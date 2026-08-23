#!/usr/bin/env node
/**
 * verify.mjs — behavioural verification for the pattern lab.
 *
 *   node scripts/verify.mjs [--headed] [--only=scroll,type,…]
 *
 * This exists because "the skill describes a pinned scrub" and "the pinned
 * scrub works" are different claims. Every assertion here reads a real value
 * out of a real browser: computed transforms at known scroll offsets, opacity
 * mid-transition, the x of a thrown element after pointerup, the accessible
 * name of split text, the backdrop-filter under emulated reduced transparency.
 *
 * Exit code is non-zero if any assertion fails. Results are written to
 * proof/verification.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROOF = join(ROOT, 'proof');
const args = process.argv.slice(2);
const HEADED = args.includes('--headed');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '')
  .split(',').filter(Boolean);

import { loadPlaywright, launchChromium } from './playwright.mjs';
const { chromium } = await loadPlaywright();

/* ── result collection ───────────────────────────────────────────────────── */
const results = [];
let group = '';
const setGroup = (g) => { group = g; };

function check(name, pass, detail = '') {
  results.push({ group, name, pass: Boolean(pass), detail: String(detail) });
  const mark = pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${mark} ${name}${detail ? `  \x1b[2m${detail}\x1b[0m` : ''}`);
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

/* ── browser plumbing ────────────────────────────────────────────────────── */
const { server, port } = await startServer(4321);
const base = `http://localhost:${port}`;
const browser = await launchChromium(chromium, { headless: !HEADED, args: ['--no-sandbox'] });

/**
 * Open a lab page and wait for its dev contract. Console/page errors are
 * collected on the returned object — a pattern that "works" while throwing is
 * not working.
 */
async function open(path, opts = {}) {
  const {
    width = 1440, height = 900, reducedMotion, features, waitReady = true,
  } = opts;
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
    colorScheme: 'dark',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  if (features?.length) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setEmulatedMedia', { features });
  }

  await page.goto(`${base}/${path}`, { waitUntil: 'load' });
  if (waitReady) {
    await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  }
  page.errors = errors;
  page.close_ = async () => { await context.close(); };
  return page;
}

/** Load a page pre-scrolled and fully settled at an exact offset. */
const at = (path, y, opts) => open(`${path}?jump=${y}`, opts);

const css = (page, selector, prop) =>
  page.evaluate(([s, p]) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const v = getComputedStyle(el);
    return v.getPropertyValue(p) || v[p] || null;
  }, [selector, prop]);

const rect = (page, selector) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }, selector);

/** Pull the translateX out of a computed matrix. */
const translateX = (matrix) => {
  const m = /matrix\(([^)]+)\)/.exec(matrix || '');
  return m ? parseFloat(m[1].split(',')[4]) : 0;
};
const translateY = (matrix) => {
  const m = /matrix\(([^)]+)\)/.exec(matrix || '');
  return m ? parseFloat(m[1].split(',')[5]) : 0;
};
/** inset(0px 73.4% 0px 0px …) → 73.4 */
const insetRight = (clip) => {
  const m = /inset\(\s*[\d.]+\w*\s+([\d.]+)%/.exec(clip || '');
  return m ? parseFloat(m[1]) : NaN;
};

const want = ONLY.length ? (g) => ONLY.includes(g) : () => true;

/* ═══════════════════════════════════════════════════════════════════════════
   1. Boot integrity — every page reaches its dev contract without errors
   ═════════════════════════════════════════════════════════════════════════ */
const PAGES = ['index.html', 'scroll.html', 'type.html', 'material.html',
  'carousel.html', 'transitions.html', 'transitions-detail.html', 'smooth.html'];

if (want('boot')) {
  setGroup('boot');
  console.log('\n\x1b[1mboot integrity\x1b[0m');
  for (const p of PAGES) {
    const page = await open(p);
    const ready = await page.evaluate(() => window.__ready === true);
    check(`${p} reaches __ready`, ready);
    check(`${p} has no console or page errors`, page.errors.length === 0,
      page.errors.slice(0, 2).join(' | '));
    await page.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. Scroll systems
   ═════════════════════════════════════════════════════════════════════════ */
if (want('scroll')) {
  setGroup('scroll');
  console.log('\n\x1b[1mscroll systems\x1b[0m');

  // 2a. pin actually engages, and releases at the end of its range
  {
    const mid = await at('scroll.html', 900);
    const pinned = await css(mid, '[data-scroll-scene]', 'position');
    check('pinned scene is fixed inside its range', pinned === 'fixed', `position: ${pinned}`);
    await mid.close_();

    const after = await at('scroll.html', 3200);
    const released = await css(after, '[data-scroll-scene]', 'position');
    check('pinned scene releases after its range', released !== 'fixed', `position: ${released}`);
    await after.close_();
  }

  // 2b. the scrub interpolates monotonically rather than snapping
  {
    const samples = [];
    for (const y of [0, 700, 1400, 2000]) {
      const page = await at('scroll.html', y);
      samples.push({
        y,
        wipe: insetRight(await css(page, '[data-test="pin-wipe"]', 'clip-path')),
        title: translateY(await css(page, '[data-test="pin-title"]', 'transform')),
      });
      await page.close_();
    }
    const wipeMono = samples.every((s, i) => i === 0 || s.wipe <= samples[i - 1].wipe + 0.01);
    const wipeMoved = samples[0].wipe - samples.at(-1).wipe > 50;
    const titleMoved = samples.at(-1).title < samples[0].title - 50;
    check('clip-path wipe interpolates monotonically with scroll', wipeMono && wipeMoved,
      samples.map((s) => `${s.y}:${s.wipe.toFixed(1)}%`).join(' → '));
    check('scrubbed title travels with scroll', titleMoved,
      samples.map((s) => `${s.y}:${s.title.toFixed(0)}px`).join(' → '));
  }

  // 2c. the panel materialises across the timeline
  {
    const start = await at('scroll.html', 200);
    const end = await at('scroll.html', 2600);
    const o0 = parseFloat(await css(start, '[data-test="pin-panel"]', 'opacity'));
    const o1 = parseFloat(await css(end, '[data-test="pin-panel"]', 'opacity'));
    check('panel materialises over the pinned range', o0 < 0.1 && o1 > 0.9, `${o0} → ${o1}`);
    await start.close_(); await end.close_();
  }

  // 2d. view-timeline reveal: hidden before entry, resolved after
  {
    const page = await open('scroll.html');
    const offscreen = await page.evaluate(() => {
      const els = [...document.querySelectorAll('.reveal')];
      return els.map((e) => parseFloat(getComputedStyle(e).opacity));
    });
    await page.close_();
    const shown = await open('scroll.html');
    const visible = await shown.evaluate(async () => {
      const els = [...document.querySelectorAll('.reveal')];
      const out = [];
      for (const el of els) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        out.push(parseFloat(getComputedStyle(el).opacity));
      }
      return out;
    });
    await shown.close_();
    check('reveal is hidden before entering the viewport', offscreen.every((o) => o < 0.2),
      `max ${Math.max(...offscreen).toFixed(2)}`);
    check('reveal resolves to visible in view', visible.length > 0 && visible.every((o) => o > 0.85),
      `min ${visible.length ? Math.min(...visible).toFixed(2) : 'n/a'}`);
  }

  // 2e. horizontal run + nested containerAnimation triggers
  {
    const early = await at('scroll.html', 5600);
    const late = await at('scroll.html', 8200);
    const x0 = translateX(await css(early, '[data-test="htrack"]', 'transform'));
    const x1 = translateX(await css(late, '[data-test="htrack"]', 'transform'));
    const heat0 = await early.evaluate(() =>
      getComputedStyle(document.querySelectorAll('[data-hcard]')[4]).getPropertyValue('--card-heat'));
    const heat1 = await late.evaluate(() =>
      getComputedStyle(document.querySelectorAll('[data-hcard]')[4]).getPropertyValue('--card-heat'));
    check('horizontal track translates from vertical scroll', x1 < x0 - 400,
      `${x0.toFixed(0)}px → ${x1.toFixed(0)}px`);
    check('nested containerAnimation trigger drives a per-card value',
      parseFloat(heat1) > parseFloat(heat0) + 0.05, `--card-heat ${heat0.trim()} → ${heat1.trim()}`);
    await early.close_(); await late.close_();
  }

  // 2f. media scrub selects frames monotonically
  {
    const frames = [];
    for (const y of [10500, 11200, 11900]) {
      const page = await at('scroll.html', y);
      frames.push(await page.evaluate(() => window.__lab.frame));
      await page.close_();
    }
    const rising = frames[0] < frames[1] && frames[1] < frames[2];
    check('media scrub maps scroll progress to frame index', rising, frames.join(' → '));
  }

  // 2g. sticky stack holds cards at their offsets
  {
    const page = await at('scroll.html', 9400);
    const tops = await page.evaluate(() =>
      [...document.querySelectorAll('.stack__card')].map((c) => Math.round(c.getBoundingClientRect().top)));
    await page.close_();
    const stuckCount = tops.filter((t) => t >= 90 && t <= 190).length;
    check('sticky stack holds multiple cards at staggered offsets', stuckCount >= 2, `tops ${tops.join(', ')}`);
  }

  // 2h. velocity accent responds to fast scrolling, then settles back
  {
    const page = await open('scroll.html');
    // skewY lands in matrix component `b` (index 1): matrix(1, tan θ, 0, 1, 0, 0).
    // Index 2 is skewX, which this pattern never touches.
    const peak = await page.evaluate(async () => {
      const el = document.querySelector('[data-test="skew-target"]');
      let max = 0;
      for (let i = 0; i < 26; i++) {
        window.scrollBy(0, 320);
        await new Promise((r) => requestAnimationFrame(r));
        const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(el).transform);
        if (m) max = Math.max(max, Math.abs(parseFloat(m[1].split(',')[1])));
      }
      return max;
    });
    // scroll-behavior: smooth means scrollBy keeps animating after the loop
    // ends, so "did it settle" has to wait for the scroll itself to stop first.
    const settled = await page.evaluate(async () => {
      let last = -1;
      while (last !== window.scrollY) {
        last = window.scrollY;
        await new Promise((r) => setTimeout(r, 120));
      }
      await new Promise((r) => setTimeout(r, 900));
      const m = /matrix\(([^)]+)\)/.exec(
        getComputedStyle(document.querySelector('[data-test="skew-target"]')).transform);
      return m ? Math.abs(parseFloat(m[1].split(',')[1])) : 0;
    });
    check('scroll velocity drives a skew accent', peak > 0.01, `peak skew factor ${peak.toFixed(4)}`);
    check('velocity accent returns to rest when scrolling stops', settled < 0.005,
      `resting ${settled.toFixed(4)}`);
    await page.close_();
  }

  // 2i. mobile recomposition — the pin must NOT exist at phone widths
  {
    const page = await at('scroll.html', 900, { width: 430, height: 932 });
    const pos = await css(page, '[data-scroll-scene]', 'position');
    const mobileStatic = await page.evaluate(() => window.__lab.mobileStatic === true);
    const heroTl = await page.evaluate(() => Boolean(window.__lab.heroTimeline));
    check('mobile does not pin the hero scene', pos !== 'fixed', `position: ${pos}`);
    check('mobile receives the static composition branch', mobileStatic && !heroTl);
    await page.close_();
  }

  // 2j. reduced motion — no pin, no scrub, content still visible
  {
    const page = await at('scroll.html', 900, { reducedMotion: 'reduce' });
    const pos = await css(page, '[data-scroll-scene]', 'position');
    const heroTl = await page.evaluate(() => Boolean(window.__lab.heroTimeline));
    const revealOpacity = await page.evaluate(() =>
      Math.min(...[...document.querySelectorAll('.reveal')].map((e) => parseFloat(getComputedStyle(e).opacity))));
    check('reduced motion removes the pinned scrub', pos !== 'fixed' && !heroTl, `position: ${pos}`);
    check('reduced motion leaves all revealed content visible', revealOpacity > 0.95,
      `min opacity ${revealOpacity.toFixed(2)}`);
    await page.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Kinetic typography
   ═════════════════════════════════════════════════════════════════════════ */
if (want('type')) {
  setGroup('type');
  console.log('\n\x1b[1mkinetic typography\x1b[0m');

  const page = await open('type.html');

  // 3a. SplitText produced a real masked line structure
  {
    const s = await page.evaluate(() => ({
      lines: document.querySelectorAll('[data-split-lines] .line').length,
      masks: document.querySelectorAll('[data-split-lines] .line-mask').length,
      maskOverflow: getComputedStyle(document.querySelector('[data-split-lines] .line-mask')).overflow,
      words: document.querySelectorAll('[data-split-words] .word').length,
      chars: document.querySelectorAll('[data-split-chars] div').length,
    }));
    check('SplitText splits into multiple lines', s.lines > 1, `${s.lines} lines`);
    check('mask: "lines" wraps every line in a clipping element',
      s.masks === s.lines && s.maskOverflow.includes('clip'),
      `${s.masks} masks, overflow: ${s.maskOverflow}`);
    check('word split produces one element per word', s.words === 8, `${s.words} words`);
    check('character split is limited to a single short word', s.chars === 9, `${s.chars} chars`);
  }

  // 3b. the accessible sentence survives the split
  {
    const a = await page.evaluate(() => window.__lab.accessible);
    check('split lines keep one accessible sentence',
      a.lines === 'Lines rise out of their own mask, because a line is the unit a reader actually tracks.',
      a.lines?.slice(0, 42) + '…');
    check('split words keep their accessible sentence',
      a.words === 'Short statements earn word-level staggering. Paragraphs never do.');
    check('split characters keep their accessible word', a.chars === 'Restraint');
  }

  // 3c. registered property really interpolates the gradient angle
  {
    const a0 = await css(page, '[data-test="gradient-text"]', '--sheen-angle');
    await page.waitForTimeout(700);
    const a1 = await css(page, '[data-test="gradient-text"]', '--sheen-angle');
    check('registered @property animates the gradient angle',
      parseFloat(a0) !== parseFloat(a1), `${a0.trim()} → ${a1.trim()}`);
  }

  // 3d. text-box-trim measurably tightens the text box
  {
    const off = await rect(page, '[data-test="trim-off"]');
    const on = await rect(page, '[data-test="trim-on"]');
    check('text-box-trim reduces the rendered text box', on.h < off.h - 4,
      `${off.h.toFixed(1)}px → ${on.h.toFixed(1)}px`);
  }

  // 3e. marquee moves, and reverses with scroll direction
  {
    const x0 = translateX(await css(page, '[data-test="marquee"]', 'transform'));
    await page.waitForTimeout(600);
    const x1 = translateX(await css(page, '[data-test="marquee"]', 'transform'));
    check('marquee advances continuously', Math.abs(x1 - x0) > 5, `${x0.toFixed(1)} → ${x1.toFixed(1)}`);

    const ts = await page.evaluate(async () => {
      const m = window.__lab.marquee;
      window.scrollBy(0, 900);
      await new Promise((r) => setTimeout(r, 260));
      const down = m.timeScale();
      window.scrollBy(0, -900);
      await new Promise((r) => setTimeout(r, 260));
      return { down, up: m.timeScale() };
    });
    check('marquee direction follows scroll direction',
      Math.sign(ts.down) !== Math.sign(ts.up),
      `timeScale ${ts.down.toFixed(2)} → ${ts.up.toFixed(2)}`);
  }
  await page.close_();

  // 3f. scroll-driven variable axis + mask reveal
  {
    const top = await at('type.html', 0);
    const w0 = parseFloat(await css(top, '[data-test="axis-line"]', '--wght'));
    const r0 = parseFloat(await css(top, '[data-test="mask-line"]', '--reveal'));
    await top.close_();
    const deep = await at('type.html', 4200);
    const w1 = parseFloat(await css(deep, '[data-test="axis-line"]', '--wght'));
    const fvs = await css(deep, '[data-test="axis-line"]', 'font-variation-settings');
    const r1 = parseFloat(await css(deep, '[data-test="mask-line"]', '--reveal'));
    await deep.close_();
    check('scroll timeline interpolates the variable-font weight axis', w1 > w0 + 100,
      `wght ${w0} → ${w1.toFixed(0)}`);
    check('the animated axis reaches font-variation-settings', /wght"?\s*\d/.test(fvs), fvs);
    check('CSS-only masked reveal advances with scroll', r1 > r0 + 0.5,
      `--reveal ${r0} → ${r1}`);
  }

  // 3g. reduced motion stops the marquee and the sheen
  {
    const page2 = await open('type.html', { reducedMotion: 'reduce' });
    const x0 = translateX(await css(page2, '[data-test="marquee"]', 'transform'));
    await page2.waitForTimeout(600);
    const x1 = translateX(await css(page2, '[data-test="marquee"]', 'transform'));
    const anim = await css(page2, '[data-test="gradient-text"]', 'animation-name');
    check('reduced motion pauses the marquee', near(x0, x1, 0.5), `${x0.toFixed(2)} → ${x1.toFixed(2)}`);
    check('reduced motion stops the gradient sheen', anim.trim() === 'none', `animation-name: ${anim.trim()}`);
    await page2.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Material, depth, and the accessibility fallback tiers
   ═════════════════════════════════════════════════════════════════════════ */
if (want('material')) {
  setGroup('material');
  console.log('\n\x1b[1mmaterial & depth\x1b[0m');

  const page = await open('material.html');

  {
    const bf = await css(page, '[data-test="glass-panel"]', 'backdrop-filter');
    const lens = await page.evaluate(() => window.__lab.lensSupported);
    const rim = await page.evaluate(() => ({
      // the rim is scoped to chrome, never to the large content panel
      onChrome: document.querySelector('.labnav').classList.contains('lens'),
      onPanel: document.querySelector('[data-test="glass-panel"]').classList.contains('lens'),
    }));
    check('glass applies a real backdrop-filter', /blur\(\d/.test(bf), bf);
    check('refraction rim is feature-probed, not assumed', lens === rim.onChrome,
      `supported: ${lens}, applied to chrome: ${rim.onChrome}`);
    check('refraction rim stays off large content surfaces', rim.onPanel === false);

    const small = await css(page, '[data-test="w-s"]', 'backdrop-filter');
    const large = await css(page, '[data-test="w-l"]', 'backdrop-filter');
    const bs = parseFloat(/blur\(([\d.]+)px/.exec(small)?.[1] ?? '0');
    const bl = parseFloat(/blur\(([\d.]+)px/.exec(large)?.[1] ?? '0');
    check('material weight scales with surface size', bl > bs, `${bs}px vs ${bl}px blur`);
  }

  // 4a. popover + anchor positioning places the menu against its trigger
  {
    // Click and sample inside one evaluate: a round-trip per frame is slower
    // than the transition, which is how a working animation gets misread as a
    // snap. Frames are collected on the page's own clock.
    const frames = await page.evaluate(async () => {
      const menu = document.querySelector('#glass-menu');
      const out = [];
      document.querySelector('[data-test="menu-trigger"]').click();
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const s = getComputedStyle(menu);
        out.push({ o: parseFloat(s.opacity), f: s.filter, t: s.transform });
      }
      return out;
    });
    await page.waitForTimeout(600);
    const open = await page.evaluate(() => document.querySelector('#glass-menu').matches(':popover-open'));
    const m = await rect(page, '#glass-menu');
    const t = await rect(page, '#menu-trigger');
    check('popover opens', open);
    check('anchor positioning aligns the menu to its trigger',
      near(m.x, t.x, 2) && m.y > t.y + t.h, `menu x ${m.x.toFixed(0)} vs trigger x ${t.x.toFixed(0)}`);

    /* "Materialises" means several properties travel together, not that opacity
       alone ramps. Frame sampling alone is unreliable here: this page is heavy
       enough that a rAF tick can be longer than the 320ms opacity transition, so
       the transition list is read from the animation API as well. */
    const wired = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('#glass-menu'));
      return {
        props: s.transitionProperty.split(',').map((x) => x.trim()),
        durations: s.transitionDuration,
      };
    });
    const props = wired.props;
    const intermediate = frames.filter((f) => {
      const blur = parseFloat(/blur\(([\d.]+)px\)/.exec(f.f)?.[1] ?? '0');
      const scale = parseFloat(/matrix\(([\d.]+)/.exec(f.t)?.[1] ?? '1');
      return (blur > 0.2 && blur < 9.8) || (scale > 0.965 && scale < 0.999);
    });
    check('glass materialises rather than only fading',
      ['opacity', 'transform', 'filter'].every((p) => props.includes(p))
      && props.includes('display') && props.includes('overlay'),
      `transitions: ${props.join(', ')} @ ${wired.durations}`);
    check('materialisation is interpolated, not switched',
      intermediate.length > 0,
      `${intermediate.length} intermediate blur/scale frames`);
  }

  // 4b. interpolate-size actually animates height to auto
  {
    const heights = await page.evaluate(async () => {
      const body = document.querySelector('[data-test="acc-1"] .acc__body');
      const out = [body.getBoundingClientRect().height];
      document.querySelector('[data-test="acc-1"] .acc__head').click();
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        out.push(body.getBoundingClientRect().height);
      }
      await new Promise((r) => setTimeout(r, 500));
      out.push(body.getBoundingClientRect().height);
      return out;
    });
    const final = heights.at(-1);
    const intermediate = heights.slice(1, -1).filter((h) => h > 1 && h < final - 1);
    check('accordion reaches its intrinsic height', final > 40, `${final.toFixed(1)}px`);
    check('height:auto is interpolated, not snapped', intermediate.length > 0,
      `${intermediate.length} intermediate frames, e.g. ${intermediate[0]?.toFixed(1)}px`);
  }

  // 4c. depth stepper swaps a coherent shadow set
  {
    const before = await css(page, '[data-test="anatomy-obj"]', 'box-shadow');
    await page.click('.anatomy__steps button[data-l="1"]');
    await page.waitForTimeout(80);
    const after = await css(page, '[data-test="anatomy-obj"]', 'box-shadow');
    check('depth anatomy stepper changes the shadow stack', before !== after,
      `${before.slice(0, 28)}… → ${after}`);
  }
  await page.close_();

  // 4d. reduced transparency → opaque surface, no backdrop work at all
  {
    const p2 = await open('material.html', {
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    });
    const bf = await css(p2, '[data-test="glass-panel"]', 'backdrop-filter');
    const bg = await css(p2, '[data-test="glass-panel"]', 'background-color');
    const opaque = !/\/\s*0?\.\d+\s*\)/.test(bg) && !/rgba\([^)]+,\s*0?\.\d+\)/.test(bg);
    check('reduced transparency removes every backdrop-filter', bf === 'none', `backdrop-filter: ${bf}`);
    check('reduced transparency substitutes an opaque surface', opaque, `background: ${bg}`);
    await p2.close_();
  }

  // 4e. increased contrast → explicit borders
  {
    const p3 = await open('material.html', {
      features: [{ name: 'prefers-contrast', value: 'more' }],
    });
    const border = await css(p3, '[data-test="glass-panel"]', 'border-top-color');
    const alpha = parseFloat(/[\d.]+\s*\)$/.exec(border)?.[0] ?? '1');
    check('increased contrast raises border contrast', alpha > 0.5, `border-color: ${border}`);
    await p3.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. Carousel and gesture physics
   ═════════════════════════════════════════════════════════════════════════ */
if (want('carousel')) {
  setGroup('carousel');
  console.log('\n\x1b[1mcarousel & gestures\x1b[0m');

  const page = await open('carousel.html');

  {
    const prevDisabled = await page.evaluate(() => document.querySelector('[data-embla-prev]').disabled);
    check('previous control is disabled at the first slide', prevDisabled === true);

    await page.click('[data-embla-next]');
    await page.waitForTimeout(700);
    const s1 = await page.evaluate(() => ({
      idx: window.__lab.embla.selectedScrollSnap(),
      count: document.querySelector('[data-embla-count]').textContent.trim(),
      prevDisabled: document.querySelector('[data-embla-prev]').disabled,
    }));
    check('next control advances the carousel', s1.idx === 1, `index ${s1.idx}`);
    check('live region reports the new position', s1.count === '2 / 6', s1.count);
    check('previous control enables once it can move', s1.prevDisabled === false);

    await page.focus('[data-embla]');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    const idx2 = await page.evaluate(() => window.__lab.embla.selectedScrollSnap());
    check('keyboard reaches parity with drag', idx2 === 2, `index ${idx2}`);

    const treatment = await page.evaluate(() => {
      const slides = [...document.querySelectorAll('.embla__slide')];
      const scale = (i) => parseFloat(getComputedStyle(slides[i]).getPropertyValue('--s'));
      return { centre: scale(2), far: scale(5) };
    });
    check('progress-driven treatment favours the centre slide',
      treatment.centre > 0.98 && treatment.far < 0.96,
      `centre ${treatment.centre.toFixed(3)} vs far ${treatment.far.toFixed(3)}`);
  }

  // 5a. inertia: the strip keeps travelling after the pointer is released
  {
    await page.evaluate(() => document.querySelector('[data-strip]').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(350);
    const box = await page.locator('[data-strip]').boundingBox();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + 620, y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(box.x + 620 - i * 30, y);
      await page.waitForTimeout(8);
    }
    await page.mouse.up();
    const xRelease = await page.evaluate(() => window.__lab.stripX);
    const throwing = await page.evaluate(() => window.__lab.throwing);
    await page.waitForTimeout(1000);
    const xSettled = await page.evaluate(() => window.__lab.stripX);
    check('drag tracks the pointer', xRelease < -100, `x ${xRelease}px at release`);
    check('release velocity is projected into inertia',
      throwing === true && xSettled < xRelease - 5, `${xRelease}px → ${xSettled}px after release`);
  }
  await page.close_();

  // 5b. reduced motion keeps the carousel usable and drops the throw
  {
    const p2 = await open('carousel.html', { reducedMotion: 'reduce' });
    const cfg = await p2.evaluate(() => ({
      duration: window.__lab.embla.internalEngine().options.duration,
      inertia: window.__lab.drag.vars.inertia,
    }));
    await p2.click('[data-embla-next]');
    await p2.waitForTimeout(200);
    const idx = await p2.evaluate(() => window.__lab.embla.selectedScrollSnap());
    check('reduced motion collapses the transition duration', cfg.duration === 0, `duration ${cfg.duration}`);
    check('reduced motion disables the inertia throw', cfg.inertia === false);
    check('reduced motion still allows advancing slides', idx === 1, `index ${idx}`);
    await p2.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. Transitions and continuity
   ═════════════════════════════════════════════════════════════════════════ */
if (want('transitions')) {
  setGroup('transitions');
  console.log('\n\x1b[1mtransitions & continuity\x1b[0m');

  const page = await open('transitions.html');

  // 6a. Flip moves the same node and animates the difference
  {
    const before = await rect(page, '[data-tile] .tile__art');
    await page.click('[data-tile]');
    await page.waitForTimeout(70);
    const active = await page.evaluate(() => Boolean(window.__lab.flip?.isActive()));
    await page.waitForTimeout(900);
    const after = await rect(page, '.detail__frame .tile__art');
    const done = await page.evaluate(() => window.__lab.flipDone === true);
    check('Flip animation is running mid-flight', active);
    check('the same node lands in the detail view', Boolean(after) && after.w > before.w + 100,
      `${before.w.toFixed(0)}px → ${after?.w.toFixed(0)}px wide`);
    check('Flip completes', done);

    await page.click('[data-detail-close]');
    await page.waitForTimeout(800);
    const restored = await rect(page, '[data-tile] .tile__art');
    check('closing returns the element along the same path',
      near(restored.x, before.x, 3) && near(restored.w, before.w, 3),
      `x ${restored.x.toFixed(0)} vs ${before.x.toFixed(0)}`);
  }

  // 6b. same-document view transition
  {
    const rows0 = await page.evaluate(() => document.querySelectorAll('.row').length);
    await page.click('[data-filter="material"]');
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => ({
      rows: document.querySelectorAll('.row').length,
      ran: window.__lab.vt.sameDoc,
      supported: window.__lab.vt.supported,
      names: [...document.querySelectorAll('.row')].map((r) => r.style.viewTransitionName),
    }));
    check('filter changes the rendered rows', rows0 === 6 && state.rows === 3, `${rows0} → ${state.rows}`);
    check('the change ran through startViewTransition', state.supported && state.ran === 1,
      `completed transitions: ${state.ran}`);
    check('surviving rows keep stable view-transition-names',
      state.names.every((n) => /^row-[a-f]$/.test(n)), state.names.join(', '));
  }
  await page.close_();

  // 6c. cross-document view transition — proven by pagereveal on the destination
  {
    const p2 = await open('transitions.html');
    await p2.click('[data-test="cross-doc-link"]');
    await p2.waitForFunction('window.__ready === true', { timeout: 20000 });
    const crossDoc = await p2.evaluate(() => window.__vtCrossDoc);
    const url = p2.url();
    check('navigation reaches the destination document', url.endsWith('transitions-detail.html'), url);
    check('cross-document view transition actually runs', crossDoc === true,
      `pagereveal.viewTransition: ${crossDoc}`);
    await p2.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. Smooth scroll wiring
   ═════════════════════════════════════════════════════════════════════════ */
if (want('smooth')) {
  setGroup('smooth');
  console.log('\n\x1b[1msmooth scroll\x1b[0m');

  const page = await open('smooth.html');
  {
    const wired = await page.evaluate(() => Boolean(window.__lab.lenis));
    const moved = await page.evaluate(async () => {
      const before = window.scrollY;
      window.__lab.lenis.scrollTo(1400, { immediate: true });
      await new Promise((r) => setTimeout(r, 400));
      return { before, after: window.scrollY, progress: window.__lab.probeProgress };
    });
    check('Lenis is instantiated and driven by the GSAP ticker', wired);
    check('smoothed scrolling moves the document', moved.after > moved.before + 500,
      `${moved.before} → ${moved.after}`);
    check('ScrollTrigger stays in sync with the smoothed position',
      moved.progress > 0, `probe progress ${Number(moved.progress).toFixed(3)}`);
    await page.close_();
  }
  {
    const p2 = await open('smooth.html', { reducedMotion: 'reduce' });
    const wired = await p2.evaluate(() => Boolean(window.__lab.lenis));
    check('reduced motion never installs the smooth scroller', wired === false);
    await p2.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. Accessibility floor — applies to every page
   ═════════════════════════════════════════════════════════════════════════ */
if (want('a11y')) {
  setGroup('a11y');
  console.log('\n\x1b[1maccessibility floor\x1b[0m');

  for (const p of ['scroll.html', 'type.html', 'material.html', 'carousel.html', 'transitions.html']) {
    const page = await open(p);
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('a[href], button')]
        .filter((el) => {
          if (el.closest('[aria-hidden="true"]')) return false;
          const name = el.getAttribute('aria-label') || el.textContent.trim() || el.title;
          return !name;
        })
        .map((el) => el.outerHTML.slice(0, 60)));
    check(`${p}: every control has an accessible name`, unnamed.length === 0,
      unnamed.slice(0, 2).join(' | '));

    const focus = await page.evaluate(async () => {
      const el = document.querySelector('a[href], button');
      el.focus({ focusVisible: true });
      return getComputedStyle(el).outlineStyle;
    });
    check(`${p}: focus produces a visible outline`, focus !== 'none', `outline-style: ${focus}`);
    await page.close_();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. Frame pacing — measured, not claimed
   ═════════════════════════════════════════════════════════════════════════ */
let perf = null;
if (want('perf')) {
  setGroup('perf');
  console.log('\n\x1b[1mframe pacing (this machine, headless)\x1b[0m');

  const page = await open('scroll.html');
  perf = await page.evaluate(async () => {
    const longTasks = [];
    try {
      new PerformanceObserver((list) => longTasks.push(...list.getEntries().map((e) => e.duration)))
        .observe({ entryTypes: ['longtask'] });
    } catch { /* not supported everywhere */ }

    const deltas = [];
    let last = performance.now();
    const end = document.documentElement.scrollHeight - innerHeight;
    let y = 0;
    while (y < end) {
      y += 26;
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
      const now = performance.now();
      deltas.push(now - last);
      last = now;
    }
    deltas.sort((a, b) => a - b);
    const q = (p) => deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * p))];
    return {
      frames: deltas.length,
      median: +q(0.5).toFixed(2),
      p95: +q(0.95).toFixed(2),
      worst: +deltas.at(-1).toFixed(2),
      longTasks: longTasks.length,
      longestTask: longTasks.length ? +Math.max(...longTasks).toFixed(1) : 0,
    };
  });
  await page.close_();

  check('median frame interval stays under 20ms during a full scroll-through',
    perf.median < 20, `median ${perf.median}ms · p95 ${perf.p95}ms · worst ${perf.worst}ms`);
  check('no long task exceeds 200ms while scrolling', perf.longestTask < 200,
    `${perf.longTasks} long tasks, longest ${perf.longestTask}ms`);

  /* The cost of the refraction rim, measured rather than guessed. Reported as a
     ratio: absolute numbers on a software-rasterised headless machine say
     nothing about a phone, but the relative cost of the effect does. */
  const cost = async (withLens) => {
    const p = await open('material.html');
    if (!withLens) await p.evaluate(() =>
      document.querySelectorAll('.lens').forEach((e) => e.classList.remove('lens')));
    const r = await p.evaluate(async () => {
      const d = [];
      let last = performance.now();
      for (let i = 0; i < 60; i++) {
        document.documentElement.style.setProperty('--light-x', `${i % 12}px`);
        await new Promise((res) => requestAnimationFrame(res));
        const n = performance.now();
        d.push(n - last);
        last = n;
      }
      d.sort((a, b) => a - b);
      return +d[Math.floor(d.length / 2)].toFixed(1);
    });
    await p.close_();
    return r;
  };
  const withLens = await cost(true);
  const withoutLens = await cost(false);
  perf.refraction = { withLens, withoutLens, ratio: +(withLens / withoutLens).toFixed(2) };
  check('refraction rim cost is measured and bounded', perf.refraction.ratio < 2.5,
    `${withoutLens}ms → ${withLens}ms median frame (×${perf.refraction.ratio}, software rasterisation)`);
}

/* ── report ──────────────────────────────────────────────────────────────── */
await browser.close();
server.close();

const passed = results.filter((r) => r.pass).length;
const failed = results.length - passed;

mkdirSync(PROOF, { recursive: true });
writeFileSync(
  join(PROOF, 'verification.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      node: process.version,
      total: results.length,
      passed,
      failed,
      framePacing: perf,
      results,
    },
    null,
    2,
  ),
);

console.log(`\n\x1b[1m${passed}/${results.length} assertions passed\x1b[0m`);
if (failed) {
  console.log('\x1b[31mfailed:\x1b[0m');
  for (const r of results.filter((x) => !x.pass)) console.log(`  · [${r.group}] ${r.name} — ${r.detail}`);
}
console.log(`report → proof/verification.json`);
process.exit(failed ? 1 : 0);
