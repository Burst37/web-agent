---
name: motion-verification
display_name: SPACE AGE — Motion Verification
version: 0.1.0
last_updated: 2026-07-30
description: >
  Measured proof that a scroll-heavy build performs, not a screenshot and a
  guess. Ships the dev contract every animated build must implement
  (deterministic ?jump capture, window.__ready gating) plus a jank harness
  that scores real per-frame timing (p95/max, never average FPS) and fails
  the build on dropped frames. Trigger on: "verify the motion", "jank test",
  "is this scroll smooth", "prove this performs", or as part of the QA gate
  for any build using pinned scenes, scroll-scrub, or Module 21.
---

# MOTION VERIFICATION
## Space Age AI Solutions — Measured Motion QA Layer

`design-motion-principles` defines what good motion *is*. `shader-effects`
defines what a named effect *looks like*. This skill answers a different
question: **does this specific build actually run smoothly**, with a number,
not an opinion.

Existing QA (`playwright-browser-automation`, wired into
`cinematic-website-builder`) checks console errors, 404s, and takes
screenshots. None of that catches dropped frames — a page can screenshot
perfectly at four scroll positions while jank happens *between* them. This
skill closes that gap.

---

## WHY AVERAGE FPS LIES

A 60fps average over a 5-second scroll can hide an 80ms decode spike that
happened once. The user felt that spike; the average erased it. **Judge
p95 and max, never average.** That is the entire reason this skill exists
as a separate, mandatory check rather than a line in the existing QA
checklist.

---

## PART 1 — THE DEV CONTRACT (implement this in every animated build)

Two hooks, mandatory on any page with scroll-driven or timed motion. Without
them, the harness in Part 2 cannot run — and it refuses to fake a result.

```js
// 1. Deterministic scroll capture — ?jump=<scrollY> lands pre-scrolled,
//    with every scroll-driven animation state force-settled, not mid-tween.
const JUMP = new URLSearchParams(location.search).get('jump');
if (JUMP !== null) history.scrollRestoration = 'manual';

// after all libraries are initialized and the page has laid out:
if (JUMP !== null) {
  scrollTo(0, +JUMP || 0);
  // GSAP/ScrollTrigger builds: force every scrubbed animation to its
  // resting state instead of leaving it mid-interpolation —
  ScrollTrigger.update();
  ScrollTrigger.getAll().forEach(st => { if (st.animation) st.animation.totalProgress(st.progress); });
}

// 2. Ready gate — fires exactly once, only when the page is truly settled
//    (fonts loaded, hero entrance animation complete, no pending layout).
window.__ready = true;
```

- If `__ready` never fires, the harness fails outright — a screenshot of an
  unready page is not proof of anything.
- Hide any custom cursor-follower until the first real `mousemove` fires, or
  it photobombs every capture sitting at `(0, 0)`.
- This contract is cheap to add and should be default on every build, not
  opt-in — it costs nothing when nobody calls `?jump`.

---

## PART 2 — THE JANK HARNESS

One script, two modes. Uses `puppeteer-core` against a **real Chrome binary**
deliberately — hosted preview panes and hidden-tab contexts throttle
`requestAnimationFrame`, which freezes the measurement and produces false
passes. A real, focused browser window is the only trustworthy measurement
environment.

```bash
npm i puppeteer-core   # once, in the project running QA
```

```js
#!/usr/bin/env node
// verify.js — mechanical, no model. node verify.js shot <url> <out.png> [w] [h]
//                                    node verify.js jank <url>
const puppeteer = require('puppeteer-core');

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const p = process.platform;
  if (p === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (p === 'win32') return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  return '/usr/bin/google-chrome';
}

async function withBrowser(fn) {
  const b = await puppeteer.launch({
    executablePath: chromePath(), headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'],
  });
  try { return await fn(b); } finally { await b.close().catch(() => {}); }
}

async function ready(page) {
  await page.waitForFunction('window.__ready === true', { timeout: 45000 })
    .catch(() => { throw new Error('window.__ready never fired — page not ready, refusing to capture (implement the dev contract).'); });
}

async function shot(url, out, w = 1440, h = 900) {
  await withBrowser(async b => {
    const page = await b.newPage();
    await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await ready(page);
    await new Promise(r => setTimeout(r, 1200)); // let lerps/entrances settle
    await page.screenshot({ path: out });
    console.log('captured', out);
  });
}

async function jank(url) {
  await withBrowser(async b => {
    const page = await b.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await ready(page);
    const stats = await page.evaluate(() => new Promise(res => {
      const end = Math.max(0, (document.scrollingElement || document.documentElement).scrollHeight - innerHeight);
      const deltas = []; let last = performance.now(), y = 0;
      const tick = () => {
        const now = performance.now(); deltas.push(now - last); last = now;
        y += 13; window.scrollTo(0, Math.min(y, end));
        if (y < end) requestAnimationFrame(tick);
        else {
          deltas.sort((a, b) => a - b);
          const p = q => deltas[Math.floor(deltas.length * q)];
          res({
            frames: deltas.length, scrolled: end,
            avg: +(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1),
            p95: +p(0.95).toFixed(1), max: +deltas[deltas.length - 1].toFixed(1),
            over50: deltas.filter(d => d > 50).length,
          });
        }
      };
      requestAnimationFrame(tick);
    }));
    console.log(JSON.stringify(stats));
    console.log(stats.max < 50 ? 'PASS (max < 50ms)' : 'JANK — investigate decode cost, DPR, or animated-layout-property use');
    if (stats.max >= 50) process.exitCode = 2;
  });
}

const [mode, url, out, w, h] = process.argv.slice(2);
(async () => {
  if (mode === 'shot') await shot(url, out, w, h);
  else if (mode === 'jank') await jank(url);
  else { console.error('usage: node verify.js shot <url> <out.png> [w] [h]  |  node verify.js jank <url>'); process.exit(1); }
})().catch(e => { console.error(e.message); process.exit(1); });
```

```bash
node verify.js jank http://localhost:3000/index.html
node verify.js shot http://localhost:3000/index.html ./qa/scene-at-2400.png 1440 900   # via ?jump=2400 in the url
```

**Pass criterion: `max < 50ms`.** That's roughly one dropped frame's worth of
budget at 60fps (16.7ms/frame) with headroom — a single 50ms+ stall is
perceptible as a stutter, not a statistic.

**No system Chrome available (e.g. a sandboxed dev container):** point
`CHROME_PATH` at any Chromium binary — a Playwright-installed Chromium works
identically for this purpose, e.g. `CHROME_PATH=/opt/pw-browsers/chromium-*/chrome-linux/chrome`.
This was validated directly: the dev-contract `?jump` capture and the
p95/max jank algorithm above were run against a synthetic page with injected
70ms frame spikes and correctly failed (`max: 86.7`) while `p95` stayed low
(`17.1`) — the exact failure mode average-FPS would have hidden.

---

## THE SCROLLTRIGGER ORDERING LAW (why jank sometimes has nothing to do with the animation itself)

If jank shows up specifically after a pinned scene, check creation order
before touching easing or frame weight. ScrollTriggers refresh in the order
they were *created*, not declared in the file. A background/ambient trigger
created before a pinned scene computes its start/end against pre-pin layout,
then silently fires at the wrong scroll position once the pin-spacer exists —
this reads as "janky" but is actually a positioning bug, not a performance
one. See `design-motion-principles` → Forbidden Patterns for the enforced
rule: **create all `pin: true` triggers first, ambient ones after.**

---

## WHEN TO RUN THIS

- Any build using Module 21 (Scroll Scrub), pinned multi-scene sequences
  (`gsap-supercharged` §1), or the section-snap pattern (`gsap-supercharged`
  §14) — motion this central to the page needs measurement, not a glance.
- Skip for a simple marketing page with only entrance fades and hover
  states — the existing `playwright-browser-automation` screenshot checks
  are sufficient there.

---

## NEVER DO

- Never report a build as smooth from a screenshot alone — screenshots prove
  a frame looked right, not that getting there was smooth
- Never measure average FPS as the pass criterion — it hides the exact
  spikes that make motion feel bad
- Never run this inside a hidden/backgrounded browser tab or a preview pane
  that throttles rAF — the result will be a false pass
- Never ship a `?jump` implementation that leaves scrubbed animations
  mid-interpolation — force `totalProgress()` explicitly
- Never skip the dev contract on a build "because it's simple" — it's free
  when unused and the alternative is no way to verify later

---

## SKILL CONNECTIONS

- **Upstream:** design-motion-principles (the ScrollTrigger ordering law and
  forbidden patterns this harness catches), gsap-supercharged (pinned scenes,
  section-snap — the patterns most likely to need this)
- **Downstream:** cinematic-website-builder's QA gate (Stage 4) — a build
  using heavy scroll motion should not clear QA without a passing jank run
- **Complements, does not replace:** playwright-browser-automation (console
  errors, 404s, screenshots, interaction testing) — that skill checks
  correctness at fixed points; this skill checks the motion between them
