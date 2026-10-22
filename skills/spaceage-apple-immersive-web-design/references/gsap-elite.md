# GSAP technique

As of **3.13** the whole toolkit is free, including SplitText, MorphSVG, DrawSVG, ScrollSmoother,
InertiaPlugin, CustomEase and the rest. The gate is no longer licensing — it is restraint.

This file covers the technique that separates production GSAP from tutorial GSAP. Scroll-specific
material lives in `scroll-systems.md`.

---

## Registration and cleanup

```js
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Draggable, InertiaPlugin, Observer);
```

Every animation you create in a component must be revertible:

```js
const ctx = gsap.context(() => {
  gsap.to('.thing', { x: 100 });
  ScrollTrigger.create({ /* … */ });
}, rootElement);            // scopes every selector to rootElement

// on unmount
ctx.revert();               // kills tweens, triggers, pins, and restores inline styles
```

`gsap.matchMedia()` is `context()` plus a media query, and it is the correct tool for anything
responsive:

```js
const mm = gsap.matchMedia();
mm.add({
  desktop: '(min-width: 861px)',
  mobile: '(max-width: 860px)',
  motion: '(prefers-reduced-motion: no-preference)',
}, (ctx) => {
  const { desktop, mobile, motion } = ctx.conditions;
  if (desktop && motion) { /* full sequence */ }
  if (mobile) { /* recomposed */ }
});
mm.revert();   // on unmount
```

Never write `if (window.innerWidth > 860)` — it does not re-evaluate, and it does not clean up.

---

## The performance primitives

### `gsap.quickTo` — for high-frequency values

```js
const xTo = gsap.quickTo('.cursor', 'x', { duration: .4, ease: 'power3' });
const yTo = gsap.quickTo('.cursor', 'y', { duration: .4, ease: 'power3' });

addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
```

One reused tween instance, retargeted per event. The naive `gsap.to()` per pointermove allocates
a tween per event — hundreds per second, all fighting each other. `quickTo` is the difference
between a magnetic cursor that feels alive and one that stutters.

`gsap.quickSetter(el, 'x', 'px')` is the same idea with no interpolation at all, for values you
have already smoothed yourself.

### `modifiers` — per-frame value rewriting

```js
gsap.to(row, {
  x: `-=${width}`,
  repeat: -1,
  ease: 'none',
  modifiers: { x: (v) => `${gsap.utils.wrap(-width, 0)(parseFloat(v))}px` },
});
```

Seamless loops with one tween instead of cloned elements each running their own animation.

### `gsap.utils`

`clamp`, `wrap`, `wrapYoyo`, `mapRange`, `snap`, `interpolate`, `distribute`, `random`,
`normalize`, `pipe`, `toArray`, `selector`. `mapRange` and `distribute` in particular remove most
of the hand-written maths from motion code:

```js
const heat = gsap.utils.mapRange(0, 800, 0, 1, scrollDistance);
gsap.to('.grid-cell', {
  scale: .6,
  stagger: { amount: 1.2, grid: [6, 6], from: 'center' },   // real 2D cascade
});
```

---

## Easing

```js
CustomEase.create('brand', 'M0,0 C0.16,1 0.3,1 1,1');
gsap.to(el, { y: 0, ease: 'brand' });
```

Rules of thumb:

- **entrances** — fast out of the gate, long settle (`expo.out`, `power4.out`, `back.out(1.4)`);
- **exits** — slow to leave, quick to finish (`power3.in`);
- **bidirectional / interruptible** — `power2.inOut` or a spring;
- **scrubbed** — `none`, always;
- **physical release** — inertia, not an ease.

`CustomBounce` and `CustomWiggle` are available; they are almost always the wrong answer in a
premium interface.

Springs without a JS runtime: express one as a CSS `linear()` curve (see `--ease-spring` in
`tokens.css`). It runs on the compositor and costs nothing.

---

## Observer — one input abstraction

```js
Observer.create({
  target: window,
  type: 'wheel,touch,pointer',
  onUp: () => goToSection(index - 1),
  onDown: () => goToSection(index + 1),
  onStop: () => settle(),
  onStopDelay: 0.12,
  tolerance: 10,
  preventDefault: true,
});
```

Normalises wheel, touch, trackpad and pointer into one set of callbacks with velocity and
tolerance. `onStop`/`onStopDelay` is the built-in answer to "what happens when the gesture ends"
— the problem that, handled badly, leaves velocity accents stuck (see `scroll-systems.md`).

`preventDefault: true` means you now own scrolling. That is scroll-jacking unless the design is
genuinely a full-page section deck, and even then it needs keyboard equivalents.

---

## SVG plugins

```js
gsap.to('#path', {
  drawSVG: '0% 100%',                         // DrawSVGPlugin
  scrollTrigger: { trigger: '#svg', scrub: .5 },
});

gsap.to('#shape', { morphSVG: '#target-shape', duration: .8, ease: 'power2.inOut' });

gsap.to('.marker', {
  motionPath: { path: '#route', align: '#route', autoRotate: true, alignOrigin: [.5, .5] },
  scrollTrigger: { scrub: true },
});
```

A drawn line following a scroll is one of the few decorative effects that reliably reads as
craft rather than noise — it has a direction, a start and an end, which is more than most
parallax achieves. Keep the stroke count low; each path is a separate animation.

---

## Flip

Covered in `transitions-continuity.md`. The summary: `Flip.getState` → mutate the DOM →
`Flip.from(state, …)`. Also `Flip.fit()` to match one element's box to another, and
`Flip.batch()` when many elements change at once.

---

## Timeline discipline

```js
const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: .6 } });

tl.to('.a', { y: 0 })
  .to('.b', { y: 0 }, '<0.1')      // 0.1s after the previous tween STARTED
  .to('.c', { y: 0 }, '-=0.2')     // 0.2s before the previous tween ENDED
  .addLabel('reveal')
  .to('.d', { opacity: 1 }, 'reveal+=0.15');
```

- Put shared values in `defaults` — repetition in a timeline is where drift starts.
- Use **labels** for anything with more than four steps; relative offsets become unreadable and
  un-editable past that point.
- In scrubbed timelines, position everything with absolute numbers (`0`, `.18`, `.58`) so the
  choreography maps directly onto scroll progress.
- `tl.timeScale(1.4)` while art-directing, then bake the real durations.

---

## What not to reach for

- `ScrollSmoother` unless the design genuinely needs smoothing *and* you accept owning the scroll
  position (see `lab/smooth.html` for the Lenis equivalent and the same caveats);
- `CustomWiggle`/`CustomBounce` in a premium interface;
- physics simulations for anything a spring can express;
- animating `width`, `height`, `top`, `left`, or `margin` continuously — use transforms;
- animating filters or `backdrop-filter` on large surfaces per frame;
- splitting text you did not need to split.

---

## Framework notes

**React** — wrap everything in `useGSAP()` (from `@gsap/react`), which is `gsap.context()` with
automatic cleanup on unmount and correct behaviour under StrictMode double-invocation:

```jsx
useGSAP(() => {
  gsap.to('.box', { x: 100, scrollTrigger: { trigger: '.box', scrub: true } });
}, { scope: container, dependencies: [] });
```

**Any SPA router** — call `ScrollTrigger.refresh()` after the new route's images and fonts have
settled, and revert the previous route's context *before* the new one mounts, or the old pin
spacers survive into the new page.
