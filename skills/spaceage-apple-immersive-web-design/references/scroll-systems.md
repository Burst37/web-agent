# Scroll systems

Running implementation: `lab/scroll.html`. Every snippet below is extracted from code that
passes `scripts/verify.mjs`.

---

## A. View-timeline reveal (no JavaScript)

The entire reveal is declarative where the engine supports view timelines. Nothing runs on the
main thread per frame.

```css
.reveal { opacity: 1; transform: none; }              /* resting state is the default */
.js .reveal, .vt .reveal {                            /* hidden only once a mechanism exists */
  opacity: 0;
  transform: translateY(2rem) scale(.985);
}

@supports (animation-timeline: view()) {
  .vt .reveal {
    animation: reveal-in both linear;
    animation-timeline: view();
    animation-range: entry 8% cover 34%;
  }
  @keyframes reveal-in { to { opacity: 1; transform: none; } }
}
```

```js
if (CSS.supports('animation-timeline', 'view()')) {
  document.documentElement.classList.add('vt');
} else {
  document.documentElement.classList.add('js');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
```

**The ordering is the point.** The hidden state is applied by a class that is only added once
something is known to remove it. Ship the hidden state unconditionally and one script error
blanks the page.

`animation-range` keywords worth knowing: `entry`, `exit`, `cover`, `contain`, `entry-crossing`,
`exit-crossing`. `entry 8% cover 34%` means "start when the element is 8% into entering, finish
when it is 34% of the way across the viewport."

For a page-level progress rail, `scroll()` replaces `view()`:

```css
.progress-rail i { transform: scaleX(0); transform-origin: 0 50%; }
@supports (animation-timeline: scroll()) {
  .progress-rail i {
    animation: rail-grow linear both;
    animation-timeline: scroll(root block);
  }
  @keyframes rail-grow { to { transform: scaleX(1); } }
}
```

---

## B. `scroll-state()` — a sticky element that knows it is stuck

No sentinel element, no scroll listener, no layout reads.

```css
.stickybar-host { container-type: scroll-state; position: sticky; top: 0; }

@container scroll-state(stuck: top) {
  .stickybar {
    background: color-mix(in oklab, #0d1018 72%, transparent);
    border-color: var(--line);
    backdrop-filter: blur(18px) saturate(150%);
  }
}
```

The container must be the sticky element's own wrapper — `scroll-state` queries the container's
own stuck-ness. Other states: `scroll-state(scrollable: top | bottom | inline-start …)` and
`scroll-state(snapped: block | inline)`.

Fallback, wired only when the query is unsupported:

```js
if (!CSS.supports('container-type', 'scroll-state')) {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:-1px;height:1px;width:1px;';
  host.before(sentinel);
  new IntersectionObserver(([e]) => {
    bar.dataset.stuck = String(!e.isIntersecting);
  }).observe(sentinel);
}
```

---

## C. Pinned and scrubbed scene

```js
const mm = gsap.matchMedia();

mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '[data-scroll-scene]',
      start: 'top top',
      end: '+=2200',
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl.to('[data-layer="sky"]',  { scale: 1.14, yPercent: -6 }, 0)
    .to('[data-layer="grid"]', { yPercent: -18, opacity: .35 }, 0)
    .to('[data-layer="title"]', { yPercent: -120, opacity: 0 }, .18)
    .fromTo('[data-layer="wipe"]',
      { clipPath: 'inset(0 100% 0 0 round 28px)' },
      { clipPath: 'inset(0 0% 0 0 round 28px)' }, .26)
    .fromTo('[data-layer="panel"]',
      { opacity: 0, yPercent: 14, filter: 'blur(10px)' },
      { opacity: 1, yPercent: 0, filter: 'blur(0px)' }, .58);

  return () => { /* matchMedia reverts pins, spacers and inline styles for you */ };
});
```

Rules that matter:

- **`ease: 'none'` inside a scrub.** The scroll position is the easing curve. Any other ease
  double-applies and the sequence feels rubbery.
- **`scrub: 0.65`** is a catch-up duration in seconds, not a boolean. It is what gives scrubbed
  motion weight. `scrub: true` is instant and reads cheap.
- **`anticipatePin: 1`** avoids the one-frame jump when a pin engages during fast scrolling.
- **`invalidateOnRefresh: true`** plus function-based values re-measures on resize instead of
  drifting.
- **`gsap.matchMedia()` is the only correct responsive mechanism.** Everything created inside a
  context — pins, spacers, inline styles — is reverted when the query stops matching.
- **Position the timeline with absolute labels** (`, 0`, `, .18`, `, .58`) rather than chaining,
  so overlaps are explicit and readable.

Mobile gets a different branch entirely — not a smaller pin:

```js
mm.add('(max-width: 860px)', () => {
  gsap.set('[data-layer="panel"]', { opacity: 1, clearProps: 'filter' });
  gsap.set('[data-layer="wipe"]', { clipPath: 'inset(0 0% 0 0 round 28px)' });
});
```

Verified: at 430px the scene's computed `position` never becomes `fixed` and no hero timeline
is constructed.

---

## D. Sticky narrative

Sticky visual, advancing copy, three states. An observer, not a scrub — three state changes
cost nothing per frame.

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    steps.forEach((s) => (s.dataset.active = String(s === e.target)));
    visual.dataset.scene = e.target.dataset.step;
  }
}, { rootMargin: '-45% 0px -45% 0px' });
steps.forEach((s) => io.observe(s));
```

The symmetric `-45%` margins create a thin band across the middle of the viewport: whichever
step crosses it becomes active. Each step changes **one** property group; the transition lives
in CSS.

Release the section as soon as the narrative ends. Pinning past the story is the most common
scrollytelling failure.

---

## E. Horizontal run + `containerAnimation`

```js
const track = document.querySelector('[data-htrack]');
const distance = () => track.scrollWidth - window.innerWidth;

const run = gsap.to(track, {
  x: () => -distance(),
  ease: 'none',
  scrollTrigger: {
    trigger: '[data-htrack-section]',
    start: 'top top',
    end: () => `+=${distance()}`,
    pin: true,
    scrub: 0.6,
    invalidateOnRefresh: true,
  },
});

document.querySelectorAll('[data-hcard]').forEach((card) => {
  gsap.fromTo(card, { '--card-heat': .12, y: 26 }, {
    '--card-heat': .7, y: 0, ease: 'none',
    scrollTrigger: {
      trigger: card,
      containerAnimation: run,   // ← the whole trick
      start: 'left 88%',
      end: 'center 52%',
      scrub: true,
    },
  });
});
```

Without `containerAnimation`, a trigger on a horizontally-moving card is evaluated against its
*vertical* position — every card fires simultaneously the moment the section enters. With it,
start/end are read along the horizontal axis of the driving tween, and `left`/`right` become
valid position keywords.

Constraints: the container animation must be a tween of a single element (not a timeline), must
use `ease: 'none'`, and nested triggers cannot themselves pin.

GSAP animates CSS custom properties directly, which is how `--card-heat` drives a gradient
opacity without touching layout.

---

## F. Sticky card stack (pure CSS)

```css
.stack__card {
  position: sticky;
  top: calc(96px + var(--i) * 18px);
  height: 62vh;
  transform-origin: 50% 0;
}
.stack__card:nth-child(1) { --i: 0; }
.stack__card:nth-child(2) { --i: 1; }
.stack__card:nth-child(3) { --i: 2; }
```

Each card sticks 18px lower than the one before, so the stack builds depth from position and
occlusion instead of shadow spam. No library, no measurement. Add a scroll-timeline scale-down
on the outgoing card only if the stack genuinely needs it.

---

## G. Media scrub

```js
const frames = await buildSequence();     // decoded ImageBitmaps
let wanted = 0, painted = -1, queued = false;

function paint() {
  queued = false;
  if (wanted === painted) return;
  painted = wanted;
  ctx.drawImage(frames[painted], 0, 0, canvas.width, canvas.height);
}

function request(index) {
  wanted = gsap.utils.clamp(0, TOTAL - 1, Math.round(index));
  if (!queued) { queued = true; requestAnimationFrame(paint); }
}

ScrollTrigger.create({
  trigger: '[data-scrub-section]',
  start: 'top top',
  end: '+=1600',
  pin: '.scrub__pin',
  scrub: true,
  invalidateOnRefresh: true,
  onUpdate: (self) => request(self.progress * (TOTAL - 1)),
});
```

The pattern is: **scroll selects, rAF paints, and repeated requests within one frame collapse
into a single draw.** Painting straight from `onUpdate` draws several times per frame during
fast scrolling.

Production notes:

- decode with `createImageBitmap` before the sequence is reachable — a `<img>` decode inside the
  scroll path is a guaranteed hitch;
- cap resolution by viewport and DPR; ship a shorter sequence to phones;
- keep a poster frame and a static fallback;
- for video, `requestVideoFrameCallback` plus a fragmented MP4 beats a long image sequence
  above roughly 100 frames.

---

## H. Velocity accents

```js
const skewTo = gsap.quickTo('[data-skew]', 'skewY', { duration: 0.45, ease: 'power3.out' });
let restId;

ScrollTrigger.create({
  onUpdate: (self) => {
    skewTo(gsap.utils.clamp(-5, 5, self.getVelocity() / -320));
    clearTimeout(restId);
    restId = setTimeout(() => skewTo(0), 120);       // ← the part everyone forgets
  },
});
```

`onUpdate` only fires *while* the page is scrolling. Without the debounced reset, the last
non-zero velocity stays applied forever and the element sits permanently skewed. This exact bug
was caught by the harness assertion "velocity accent returns to rest when scrolling stops".

`gsap.quickTo` reuses one tween instance instead of allocating a new one per scroll event — the
difference is large enough to see in a profile.

Allowed: subtle skew or blur on decorative layers, progress indicators, directional light,
inertial cursor. Never: body-copy distortion, brightness flashes, full-page wobble, or motion
that continues after scrolling stops without purpose.

---

## Refresh discipline

- Call `ScrollTrigger.refresh()` after fonts and media settle, never before.
- `ScrollTrigger.config({ ignoreMobileResize: true })` stops mobile address-bar show/hide from
  triggering constant refreshes.
- `ScrollTrigger.normalizeScroll(true)` fixes iOS address-bar jitter on pinned sections, but it
  takes over scrolling — do not enable it in a page you intend to drive programmatically in
  tests, and never combine it with a smooth-scroll library.
- On unmount, revert the `gsap.context()` or matchMedia context; do not kill triggers
  individually.
