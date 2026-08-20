# Carousels and gesture physics

Running implementation: `lab/carousel.html`.

---

## Decision rule

| Need | Use |
| --- | --- |
| a basic gallery that snaps | CSS scroll snap |
| momentum, variable widths, loop, free drag, progress transforms, programmatic control | Embla |
| free drag with a throw and progressive bounds | GSAP Draggable + InertiaPlugin |
| full-page section snapping from wheel/touch | GSAP Observer |

CSS scroll snap first. It is free, accessible by default, and survives every browser quirk you
would otherwise re-implement.

---

## Embla baseline

```js
const embla = EmblaCarousel(root, {
  align: 'center',
  containScroll: 'trimSnaps',
  dragThreshold: 10,                       // intent threshold before tracking begins
  duration: reducedMotion ? 0 : 26,        // still advances, just instantly
  loop: false,
});
```

`dragThreshold` is the "small intent threshold" from the directness law: below it, the gesture is
still ambiguous between a drag and a tap.

---

## Progress-driven treatment

One treatment per carousel. Centre slide scales up, edges recede. Everything else is noise.

```js
let geo = { centers: [], span: 0, viewport: 0 };

function measure() {                       // once, and on reInit — never per frame
  const viewport = root.clientWidth;
  const container = root.querySelector('[data-embla-container]');
  geo = {
    viewport,
    span: Math.max(1, container.scrollWidth - viewport),
    centers: slides.map((s) => s.offsetLeft + s.offsetWidth / 2),
  };
}

function paint() {                         // arithmetic only — no layout reads
  const progress = gsap.utils.clamp(0, 1, embla.scrollProgress());
  const scrolled = progress * geo.span;
  const middle = geo.viewport / 2;
  slides.forEach((slide, i) => {
    const distance = Math.abs(geo.centers[i] - scrolled - middle);
    const closeness = gsap.utils.clamp(0, 1, 1 - distance / middle);
    slide.style.setProperty('--s', (0.9 + closeness * 0.1).toFixed(4));
    slide.style.setProperty('--o', (0.7 + closeness * 0.3).toFixed(4));
  });
}

embla.on('scroll', paint)
     .on('reInit', () => { measure(); paint(); syncControls(); })
     .on('select', syncControls);
```

```css
.embla__slide {
  transform: scale(var(--s, .92));
  opacity: var(--o, .55);
  will-change: transform, opacity;
}
```

Two decisions worth copying:

**Measure once.** `getBoundingClientRect()` inside the scroll path forces a reflow every frame,
per slide. Cache `offsetLeft`/`offsetWidth` at init and on `reInit`, then do arithmetic.

**Do not drive the treatment off `scrollSnapList()` indices.** With `containScroll: 'trimSnaps'`
the outer snaps are clamped into the scrollable range, so adjacent snaps bunch together at both
ends — the first two snaps sat 0.025 apart while the middle ones were 0.36 apart, and the centre
treatment visibly collapsed near the edges. Real pixel positions do not have that problem.

Verified: with slide 2 selected, its `--s` is 0.998 while a far slide is 0.900.

---

## Controls, state and keyboard parity

```js
function syncControls() {
  prev.disabled = !embla.canScrollPrev();
  next.disabled = !embla.canScrollNext();
  count.textContent = `${embla.selectedScrollSnap() + 1} / ${slides.length}`;
}

root.tabIndex = 0;
root.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  { embla.scrollPrev(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { embla.scrollNext(); e.preventDefault(); }
});
```

```html
<section aria-roledescription="carousel" aria-label="Immersive design systems">
  <article role="group" aria-roledescription="slide" aria-label="1 of 6">…</article>
</section>
<button aria-label="Previous slide">←</button>
<div aria-live="polite">1 / 6</div>
```

The accessibility model, in full:

- the region carries a label and `aria-roledescription="carousel"`;
- each slide is a labelled group;
- next/previous have explicit labels and honest `disabled` states;
- a polite live region announces position changes;
- focused controls scroll into view;
- **autoplay is off by default.** If a requirement forces it, pause on hover, on focus, on
  `visibilitychange`, and under reduced motion — and provide a stop control;
- everything is operable without ever dragging.

Verified: button advance, live-region text, disabled transitions, and `ArrowRight` all assert.

---

## Draggable + Inertia

```js
const [drag] = Draggable.create(strip, {
  type: 'x',
  inertia: !reducedMotion,       // reduced motion → drag works, throw does not
  edgeResistance: 0.72,          // progressive resistance, not a wall
  bounds: { minX: minX(), maxX: 0 },
  allowNativeTouchScrolling: true,
  onDrag: report,
  onThrowUpdate: report,
});

addEventListener('resize', () => drag.applyBounds({ minX: minX(), maxX: 0 }));
```

`edgeResistance` between 0 and 1 controls how much of the drag distance is absorbed past the
bounds — 0.72 gives the rubber-band feel where the content still moves but visibly resists.
`1` is a hard stop and feels broken; `0` lets content fly off.

InertiaPlugin projects the release velocity into a natural landing point rather than stopping
dead at `pointerup`. Verified: x = −360px at release, −381px after the throw settled, with
`drag.isThrowing === true` during the projection.

Add `snap: { x: (value) => Math.round(value / step) * step }` when the strip should land on
positions; `inertia` and `snap` combine — the throw targets the nearest snap in the direction of
travel, which is exactly the momentum-projection behaviour good native carousels have.

---

## Physical interaction rules

- feedback on pointer-down, not on release;
- 1:1 tracking after the intent threshold, with the grab offset preserved (never re-centre the
  content under the cursor);
- interruptible: a new gesture retargets from the *live* value, never from the tween's start;
- velocity carries into the release animation;
- bounds resist progressively;
- `cursor: grab` / `grabbing` only under `(hover: hover) and (pointer: fine)`;
- use Pointer Events, and set `touch-action` so the browser knows which axis you own.

---

## Reduced motion

Reduced motion does not mean "carousel removed". It means:

```js
duration: 0,        // Embla: instant scroll, still advances
inertia: false,     // Draggable: drag tracks, throw does not project
```

Verified as three separate assertions: duration is 0, inertia is false, and clicking next still
changes the selected index.
