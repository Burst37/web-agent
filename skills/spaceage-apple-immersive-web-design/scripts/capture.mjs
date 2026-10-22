#!/usr/bin/env node
/**
 * capture.mjs — deterministic screenshots of the lab, written to proof/.
 *
 *   node scripts/capture.mjs
 *
 * Every shot lands via the ?jump= dev contract and waits for __ready, so the
 * same command produces the same frames rather than whatever the page happened
 * to be doing. Shots that need interaction run their own setup function.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'proof', 'shots');
mkdirSync(OUT, { recursive: true });

import { loadPlaywright, launchChromium } from './playwright.mjs';
const { chromium } = await loadPlaywright();
const { server, port } = await startServer(4322);
const base = `http://localhost:${port}`;
const browser = await launchChromium(chromium, { args: ['--no-sandbox'] });

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 430, height: 932 };

const SHOTS = [
  ['01-overview', 'index.html', 0, DESKTOP, {}],
  ['02-scroll-hero-pinned', 'scroll.html', 0, DESKTOP, {}],
  ['03-scroll-mid-scrub', 'scroll.html', 1500, DESKTOP, {}],
  ['04-scroll-reveal', 'scroll.html', 3600, DESKTOP, {}],
  ['05-scroll-sticky-narrative', 'scroll.html', 4900, DESKTOP, {}],
  ['06-scroll-horizontal', 'scroll.html', 7400, DESKTOP, {}],
  ['07-scroll-sticky-stack', 'scroll.html', 9500, DESKTOP, {}],
  ['08-scroll-media-scrub', 'scroll.html', 11400, DESKTOP, {}],
  ['09-type-hero', 'type.html', 0, DESKTOP, {}],
  ['10-type-split-lines', 'type.html', 1150, DESKTOP, {}],
  ['11-type-axis-and-trim', 'type.html', 3900, DESKTOP, {}],
  ['12-material-glass', 'material.html', 0, DESKTOP, {}],
  ['13-material-popover', 'material.html', 0, DESKTOP, { action: 'popover' }],
  ['14-material-depth', 'material.html', 1150, DESKTOP, {}],
  ['15-carousel', 'carousel.html', 130, DESKTOP, {}],
  ['16-carousel-inertia-strip', 'carousel.html', 1250, DESKTOP, {}],
  ['17-transitions-gallery', 'transitions.html', 130, DESKTOP, {}],
  ['18-transitions-flip-open', 'transitions.html', 130, DESKTOP, { action: 'flip' }],
  ['19-transitions-detail', 'transitions-detail.html', 0, DESKTOP, {}],
  ['20-mobile-scroll-hero', 'scroll.html', 0, PHONE, {}],
  ['21-mobile-story', 'scroll.html', 2600, PHONE, {}],
  ['22-mobile-carousel', 'carousel.html', 130, PHONE, {}],
  ['23-reduced-motion-scroll', 'scroll.html', 900, DESKTOP, { reducedMotion: 'reduce' }],
  ['24-reduced-transparency-material', 'material.html', 0, DESKTOP,
    { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] }],
];

const ACTIONS = {
  async popover(page) {
    await page.click('[data-test="menu-trigger"]');
    await page.waitForTimeout(700);
  },
  async flip(page) {
    await page.click('[data-tile]');
    await page.waitForTimeout(900);
  },
};

const manifest = [];
for (const [name, path, jump, viewport, opts] of SHOTS) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: opts.reducedMotion,
  });
  const page = await context.newPage();
  if (opts.features) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setEmulatedMedia', { features: opts.features });
  }
  await page.goto(`${base}/${path}?jump=${jump}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  if (opts.action) await ACTIONS[opts.action](page);
  await page.waitForTimeout(320);

  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  manifest.push({ name, path, jump, viewport: `${viewport.width}x${viewport.height}`, file: `proof/shots/${name}.png` });
  console.log(`captured ${name}.png`);
  await context.close();
}

writeFileSync(
  join(ROOT, 'proof', 'shots.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), shots: manifest }, null, 2),
);

await browser.close();
server.close();
console.log(`\n${manifest.length} screenshots → proof/shots/`);
