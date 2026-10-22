# Transitions and spatial continuity

Running implementation: `lab/transitions.html` + `lab/transitions-detail.html`.

The goal is always the same: the user should never wonder where an object went. Three mechanisms
cover almost everything.

| Mechanism | Scope | Use when |
| --- | --- | --- |
| GSAP Flip | one document | element moves between containers, or layout changes |
| `document.startViewTransition` | one document | state/filter/sort changes, DOM re-rendered |
| `@view-transition { navigation: auto }` | across documents | real navigations, no router |

---

## GSAP Flip — shared elements in one document

FLIP = First, Last, Invert, Play. Measure where it is, move it, measure where it landed, animate
the difference.

```js
function open(tile) {
  const art = tile.querySelector('.tile__art');

  // 1 · record the real on-screen position, now
  const state = Flip.getState(art, { props: 'borderRadius' });

  // 2 · leave a placeholder so the grid does not collapse behind the overlay
  const placeholder = document.createElement('div');
  placeholder.className = 'tile__art';
  placeholder.style.visibility = 'hidden';
  tile.prepend(placeholder);

  // 3 · move the SAME node into the destination
  detail.dataset.open = 'true';
  frame.prepend(art);

  // 4 · animate the difference
  window.__lab.flip = Flip.from(state, {
    duration: .62,
    ease: 'power3.inOut',
    absolute: true,
    scale: false,
  });
}
```

Why this beats a cross-fade between two copies: there is only ever **one** element, so there is
no ghosting, no double text rendering, and no moment where both copies are half-visible.

Options that matter:

- `absolute: true` takes the element out of flow during the animation, so surrounding layout does
  not thrash while it travels;
- `scale: true` animates `scaleX/scaleY` instead of width/height — cheaper, but distorts text and
  borders. Use `false` when the element contains type;
- `props: 'borderRadius'` (or any comma list) animates non-transform properties across the flip;
- `nested: true` when flipping containers that themselves contain flipped elements;
- `Flip.fit(a, b)` when you want one element to match another's box without moving it.

Closing runs the identical measurement in reverse, which is what makes the exit path match the
entrance. Verified: the art travels 399px → 718px wide into the detail, `flip.isActive()` is true
mid-flight, and closing returns it to within 3px of its original x.

---

## Same-document view transitions

```js
function setFilter(next) {
  filter = next;
  if (!document.startViewTransition) { render(); return; }   // same call, no animation
  const t = document.startViewTransition(() => render());
  t.finished.then(() => { /* … */ });
}

function render() {
  rows.innerHTML = '';
  for (const d of DATA) {
    if (filter !== 'all' && d.kind !== filter) continue;
    const el = document.createElement('div');
    el.style.viewTransitionName = `row-${d.id}`;   // stable identity per row
    rows.append(el);
  }
}
```

The stable per-row `view-transition-name` is the whole feature: rows that survive the filter are
**moved** by the browser rather than destroyed and re-created somewhere else. Without it, the
list cross-fades and the reader loses their place.

Progressive enhancement is structural here — the same `render()` runs either way, so the feature
works with or without the API. Never build the state change *inside* a callback you only call
when the API exists.

Names must be unique per snapshot. Two elements with the same
`view-transition-name` at once throws and skips the transition.

Refinements worth knowing:

- `view-transition-class` applies shared animation rules to a group of names;
- `document.startViewTransition({ update, types: ['forward'] })` plus
  `:active-view-transition-type(forward)` lets one page style directional transitions differently;
- `::view-transition-group(name)`, `-image-pair`, `-old`, `-new` are the pseudo-elements to
  target for custom easing;
- always give `::view-transition-old/new` an explicit duration and easing — the default 250ms
  cross-fade is the "we enabled the API" look.

---

## Cross-document view transitions

Two declarations, on **both** documents:

```css
@view-transition { navigation: auto; }

::view-transition-old(hero-media),
::view-transition-new(hero-media) {
  animation-duration: 420ms;
  animation-timing-function: cubic-bezier(.16, 1, .3, 1);
}
```

```css
/* origin page */       .hero-media { view-transition-name: hero-media; }
/* destination page */  .hero-media { view-transition-name: hero-media; }
```

A plain `<a href>` now morphs one element into the other across a real navigation. No router, no
client-side framework, no shared runtime. Same-origin only.

**Proving it actually ran** — the destination fires `pagereveal` before its first rendering
opportunity, and the event carries the transition:

```html
<!-- in <head>, before anything else can run -->
<script>
  window.__vtCrossDoc = null;
  addEventListener('pagereveal', (e) => { window.__vtCrossDoc = Boolean(e.viewTransition); });
</script>
```

The harness asserts `window.__vtCrossDoc === true` after clicking the link. That is the
difference between "we declared it" and "it works". (`pageswap` on the outgoing document is the
counterpart, useful for setting names based on which link was activated.)

Fallback is automatic and correct: an engine without support performs an ordinary navigation.

---

## Popover + anchor positioning

Continuity applies to menus too — they should grow from their trigger, not appear beside it.

```html
<button popovertarget="menu" id="trigger">Open</button>
<div id="menu" popover>…</div>
```

```css
#trigger { anchor-name: --trigger; }
#menu {
  position: absolute;
  position-anchor: --trigger;
  position-area: bottom span-right;
  margin: 10px 0 0 0;
  position-try-fallbacks: flip-block, flip-inline;
}
```

See `material-depth.md` for the `@starting-style` materialisation and the `inset` trap that
silently breaks `position-area`.

---

## Animating to intrinsic sizes

```css
:root { interpolate-size: allow-keywords; }

.acc__body { height: 0; overflow: clip; transition: height var(--motion-base) var(--ease-standard); }
.acc[data-open="true"] .acc__body { height: auto; }
```

Before `interpolate-size`, `auto` was not interpolable, so every accordion measured
`scrollHeight`, animated a pixel number, and broke whenever the content reflowed. This transitions
the keyword itself — the JS is reduced to toggling one attribute.

Verified: the body goes 0 → 112.2px with intermediate frames sampled in between, so it is
genuinely interpolated rather than snapped.

`calc-size(auto, size * 0.5)` covers the cases where you need arithmetic on an intrinsic size.
Without support, fall back to an instant open — a jump is acceptable, a clipped panel is not.

---

## Choosing between Flip and View Transitions

| | Flip | View Transitions |
| --- | --- | --- |
| element identity | the real node moves | browser snapshots old and new |
| control | full GSAP timeline, interruptible | CSS animations on pseudo-elements |
| interruptible mid-flight | yes | not really |
| crosses documents | no | yes |
| cost | JS measurement per flip | browser-level snapshot |
| text during transform | stays crisp with `scale: false` | snapshot may soften |

Use Flip when the interaction must remain interruptible (a card the user can grab again mid-open).
Use View Transitions when the DOM is being re-rendered wholesale, or when crossing documents.
