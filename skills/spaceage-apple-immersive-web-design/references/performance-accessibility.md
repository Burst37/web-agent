# Performance, accessibility, and the verification harness

Running implementation: `scripts/verify.mjs`, `scripts/capture.mjs`, `lab/js/boot.js`.

---

## Part 1 — The dev contract

Anything you build should expose these four hooks. They are what make automated verification
possible at all.

```js
window.__ready === true   // deps loaded, fonts settled, layout done, ScrollTrigger refreshed
window.__lab / __app      // live handles: timelines, carousel API, split instances
?jump=<px>                // land pre-scrolled at an exact offset, fully settled
?motion=off               // reduced-motion branch without OS emulation
```

```js
export async function ready(handles = {}) {
  window.__lab = Object.assign(window.__lab || {}, handles, { flags });

  await settled();                                    // fonts + two rAF
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();

  if (flags.jump !== null) {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, flags.jump);
    ScrollTrigger.update();
    await new Promise((r) => setTimeout(r, 120));
    window.scrollTo(0, flags.jump);
    ScrollTrigger.update();
    await scrubsSettled();                            // ← the important one
    await settled();
  }

  window.__ready = true;
  dispatchEvent(new CustomEvent('lab:ready'));
}
```

### `scrubsSettled()` — why it exists

A scrubbed timeline deliberately lags its trigger; that lag *is* the weight you feel while
scrolling. After a programmatic jump the playhead is still travelling, so anything measured
straight away is a frame of the transition, not the state.

```js
export async function scrubsSettled(timeout = 3000) {
  const deadline = performance.now() + timeout;
  const caughtUp = () => ScrollTrigger.getAll().every((st) => {
    if (!st.vars?.scrub || !st.animation) return true;
    return Math.abs(st.animation.progress() - st.progress) < 0.002;
  });
  while (!caughtUp() && performance.now() < deadline) {
    await new Promise((r) => requestAnimationFrame(r));
  }
}
```

Before this existed, the same assertion read panel opacity 0.564 and then 1.0 at the same scroll
offset, depending on machine load. Flaky assertions get deleted; deleted assertions are how
regressions ship.

### Publish late values on the global

`ready(handles)` copies the handles object **once**. Anything assigned to that local object
afterwards never reaches `window.__lab`:

```js
window.__lab.flip = Flip.from(state, { … });   // ✅
handles.flip      = Flip.from(state, { … });   // ❌ silently invisible to tests
```

---

## Part 2 — What counts as proof

| Weak claim | Assertion that earns it |
| --- | --- |
| "the hero pins" | computed `position === 'fixed'` inside the range, not after it |
| "the scrub is smooth" | `clip-path` inset decreases monotonically across four offsets |
| "cards animate individually" | a per-card custom property differs between two offsets |
| "the media scrub works" | frame index strictly increases across three offsets |
| "the carousel has momentum" | element `x` keeps changing after `pointerup`, `isThrowing === true` |
| "text stays accessible" | `aria-label` exactly equals the original sentence after splitting |
| "the split is masked" | one `.line-mask` per line, each computing `overflow: clip` |
| "type is optically trimmed" | trimmed box height measurably smaller than untrimmed |
| "mobile is recomposed" | at 430px the pin does not exist and no hero timeline is built |
| "reduced motion is handled" | pin absent, marquee `x` stable, content opacity ≥ 0.95 |
| "glass falls back" | `backdrop-filter` computes to `none` under emulated reduced transparency |
| "the popover is anchored" | menu `x` within 2px of trigger `x`, menu below trigger bottom |
| "height animates to auto" | intermediate heights strictly between 0 and final |
| "cross-document transitions work" | `pagereveal.viewTransition` truthy on the destination |
| "it hits 60fps" | measured median frame interval, on named hardware, number quoted |

The harness runs 100 such assertions across seven pages and writes
`proof/verification.json`.

### Harness patterns worth copying

**Sample inside one `evaluate`.** A round-trip per frame is slower than most transitions, which
is how a working animation gets misread as a snap:

```js
const frames = await page.evaluate(async () => {
  const out = [];
  trigger.click();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    out.push(parseFloat(getComputedStyle(el).opacity));
  }
  return out;
});
```

**Emulate accessibility preferences properly.** Playwright covers reduced motion, colour scheme,
forced colours and contrast directly; the rest go through CDP:

```js
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
});
```

**Read the right matrix component.** `matrix(a, b, c, d, e, f)`: `b` is skewY, `c` is skewX, `e`
and `f` are translate x/y. Reading `c` for a skewY animation reports a perfect zero forever — a
false pass that looks exactly like a false failure.

**Wait for smooth scrolling to finish.** `html { scroll-behavior: smooth }` means `scrollBy`
keeps animating after your loop ends, so "did it settle" must first wait for `scrollY` to stop
changing.

**Treat console errors as failures.** A pattern that "works" while throwing is not working.

---

## Part 3 — Performance budgets

### Animation

- Continuous effects animate `transform` and `opacity` only.
- Never animate layout properties continuously.
- Never animate an inherited custom property on a large ancestor every frame — it invalidates
  style for the whole subtree.
- `will-change` shortly before motion, removed after. A permanent `will-change` on many elements
  is a memory problem, not an optimisation.
- Batch reads before writes; do all `getBoundingClientRect` in one pass, at init if possible.
- `requestAnimationFrame` for pointer and scroll updates, with a `queued` flag so repeated
  requests within one frame collapse into a single paint.
- Pause offscreen loops and hidden-tab animation (`visibilitychange`, IntersectionObserver).

### Assets

- AVIF/WebP with responsive `srcset`; poster frames for video.
- Preload only critical hero assets; lazy-load below the fold.
- Decode image sequences to `ImageBitmap` before the sequence is reachable.
- Cap canvas/WebGL DPR on mobile.
- Reserve layout dimensions to prevent shifts.
- No autoplay audio, ever.

### DOM

- Do not split paragraphs into spans.
- Limit decorative particles; virtualise long galleries.
- `content-visibility: auto` below the fold.
- Destroy ScrollTriggers, observers and listeners on unmount — or use `gsap.context()` /
  `matchMedia` contexts, which revert automatically.

### Measured results

From `proof/verification.json`, on the harness machine — **headless Chromium 141, software
rasterisation, no GPU**:

| Measurement | Result |
| --- | --- |
| full scroll-through of `scroll.html` (pin, scrub, horizontal run, canvas scrub) | median frame 16.7ms, p95 16.8ms, worst 25.4ms |
| long tasks during that scroll | 0 |
| `material.html`, refraction rim on chrome | ~52ms median frame |
| `material.html`, rim removed | ~51ms median frame |
| earlier build, rim on a viewport-sized panel | ~67ms vs ~50ms (1.3×) |

Two conclusions, both actionable:

1. A page with a pinned scrub, a `containerAnimation` horizontal run and a canvas frame scrub
   holds a 16.7ms median frame even under software rasterisation. Well-built scroll work is not
   inherently expensive.
2. `backdrop-filter: url(#displacement)` is cheap on small chrome and expensive on large
   surfaces. That is the difference between a nav bar and a full-screen panel.

Absolute numbers from a container say nothing about a phone. **Always quote your hardware.**

---

## Part 4 — Accessibility

### Parallel designs, not kill switches

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
  [data-parallax], [data-scrub], [data-kinetic] {
    transform: none !important;
    opacity: 1 !important;      /* ← the part that is usually missed */
    filter: none !important;
    clip-path: none !important;
  }
}
```

The `opacity: 1` line is what stops reduced motion from producing an invisible page. A blanket
`animation-duration: 0` on a reveal that starts at `opacity: 0` freezes the content hidden.

In JS, branch rather than disable:

```js
const motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!motionOff) { /* build the pin */ }        // ✅ never constructed
```

A "disabled" smooth scroller that still owns the scroll position is worse than never installing
one.

### The floor

- logical DOM order matches visual reading order;
- every control has an accessible name (asserted across all lab pages);
- focus is always visible, including inside pinned and transformed sections (asserted:
  `outline-style !== 'none'` on focus);
- scroll locking only in modal states, and reversible;
- decorative duplicate text is `aria-hidden`;
- split text keeps one accessible sentence;
- canvas/WebGL content has an equivalent text or control path;
- live regions announce carousel position changes;
- contrast is tested over the **busiest** background state, not a flat one.

### Preference queries to support

| Query | Response |
| --- | --- |
| `prefers-reduced-motion` | static or cross-faded composition, content visible |
| `prefers-reduced-transparency` | opaque surfaces, no backdrop work |
| `prefers-contrast: more` | explicit borders, higher-contrast text |
| `forced-colors` | rely on system colours, keep focus indicators |
| `prefers-color-scheme` | re-authored dark mode, not an inversion |

---

## Part 5 — Screenshot QA

```bash
npm run capture    # 24 shots: desktop, mobile, reduced motion, reduced transparency
```

Every shot lands via `?jump=` and waits for `__ready`, so the command is reproducible rather than
capturing whatever the page happened to be doing.

Capture at minimum:

- desktop hero;
- mid-scroll narrative;
- carousel active state;
- glass chrome over busy content;
- kinetic typography and depth;
- mobile hero;
- the mobile interaction alternative;
- reduced-motion and reduced-transparency states.

Then **look at them**. The harness verified behaviour; only your eye catches a heading colliding
with its lead paragraph, a section sliding under fixed chrome, or glass stacked on glass. All
three were found this way in this lab's own screenshots, after every behavioural assertion had
already passed.
