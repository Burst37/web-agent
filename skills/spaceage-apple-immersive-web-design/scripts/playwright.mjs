/**
 * playwright.mjs — resolves Playwright without assuming where it lives.
 *
 * `scripts/setup.mjs` installs runtime dependencies with --omit=dev so browsing
 * the lab does not pull a test runner. The harness therefore has to find
 * Playwright itself: local install first, then a global one (common on CI
 * images and in dev containers), then a clear instruction instead of a stack
 * trace about a missing module.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch { /* fall through to the global lookup */ }

  let globalRoot = '';
  try {
    globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  } catch { /* npm not on PATH */ }

  if (globalRoot) {
    const entry = join(globalRoot, 'playwright', 'index.mjs');
    if (existsSync(entry)) return import(pathToFileURL(entry).href);
  }

  console.error(
    [
      '',
      'Playwright is required to run the verification harness and it was not found.',
      '',
      '  npm install            # installs playwright from devDependencies',
      '',
      'Browsers are not downloaded if PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 is set in your',
      'environment; in that case point PLAYWRIGHT_BROWSERS_PATH at an existing install.',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

/**
 * Launch Chromium, falling back to a system browser when Playwright's own
 * download is missing. Dev containers and CI images commonly ship a browser but
 * no matching Playwright build, and "please run npx playwright install" is a
 * poor reason for a verification suite to be unrunnable.
 */
export async function launchChromium(chromium, options = {}) {
  try {
    return await chromium.launch(options);
  } catch (err) {
    const candidates = [
      process.env.CHROME_PATH,
      '/opt/pw-browsers/chromium/chrome-linux/chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].filter(Boolean);

    for (const executablePath of candidates) {
      if (!existsSync(executablePath)) continue;
      try {
        const browser = await chromium.launch({ ...options, executablePath });
        console.log(`(using system browser at ${executablePath})`);
        return browser;
      } catch { /* try the next candidate */ }
    }
    throw err;
  }
}
