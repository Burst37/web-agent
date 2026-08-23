# Material, depth, and Liquid Glass-inspired chrome

Running implementation: `lab/material.html`. Portable source: `lab/css/tokens.css`.

---

## Where glass belongs

Glass is a **functional layer that floats above content**: navigation, toolbars, compact control
groups, search, transient menus, selected overlays. It is not a card style.

Hard rules:

- never place glass in the main content layer by default;
- never stack clear glass on clear glass — both layers sample a translucent backdrop, so neither
  reads as a surface and the hierarchy collapses (this exact mistake appeared in the first build
  of the lab and had to be fixed by moving the material samples out of the glass panel);
- never mix clear and regular treatments inside one control group;
- keep controls concentric with their containing corners;
- larger surfaces get stronger blur, deeper shadow, softer highlights;
- clear glass needs a visually rich background *and* usually a dimming layer.

---

## The four layers

Order matters, or it reads as a grey box with blur on it.

```css
.glass {
  --glass-fill: color-mix(in oklab, #10141f 58%, transparent);
  --glass-line: color-mix(in oklab, white 24%, transparent);
  --glass-blur: 24px;

  position: relative;
  isolation: isolate;
  overflow: clip;

  /* 1 · tint fill + 2 · specular top edge */
  background:
    linear-gradient(180deg, rgb(255 255 255 / .13), transparent 38%),
    var(--glass-fill);
  border: 1px solid var(--glass-line);
  box-shadow: var(--shadow-2);
  backdrop-filter: blur(var(--glass-blur)) saturate(148%) contrast(1.04);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(148%) contrast(1.04);
}

/* 3 · sheen sweep */
.glass::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(100% 55% at 14% 0%, rgb(255 255 255 / .28), transparent 62%),
    linear-gradient(var(--sheen-angle), transparent 20%, rgb(255 255 255 / .09) 46%, transparent 70%);
  mix-blend-mode: screen;
  opacity: .72;
}

/* 4 · colour spill, tracking the pointer */
.glass::after {
  content: '';
  position: absolute; inset: -30%; pointer-events: none;
  background: conic-gradient(from 220deg,
    transparent,
    color-mix(in oklab, var(--accent) 20%, transparent),
    transparent 36%,
    color-mix(in oklab, var(--hot) 16%, transparent),
    transparent 70%);
  filter: blur(28px);
  opacity: .55;
  transform: translate3d(var(--light-x, 0), var(--light-y, 0), 0);
}
```

`saturate()` above 100% is what stops backdrop blur looking like grey fog — it restores the
chroma the blur averages away. `contrast(1.04)` recovers a little of the edge definition.

---

## Refraction: the honest lensing approximation

Real Liquid Glass bends what is behind it. On the web the closest available primitive is an SVG
displacement map applied through `backdrop-filter`:

```html
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <filter id="lg-refract" x="-20%" y="-20%" width="140%" height="140%"
          color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="7" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="3" result="soft"/>
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="26"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

```css
.lens { backdrop-filter: blur(24px) saturate(150%) url(#lg-refract); }
@media (prefers-reduced-transparency: reduce) { .lens { backdrop-filter: none; } }
@media (prefers-contrast: more)               { .lens { backdrop-filter: none; } }
```

```js
if (CSS.supports('backdrop-filter', 'blur(2px) url(#lg-refract)')) {
  document.querySelectorAll('[data-lens]').forEach((el) => el.classList.add('lens'));
}
```

Three non-negotiables, each learned the hard way:

1. **Feature-probe it.** `url()` inside `backdrop-filter` is not universally supported. Applying
   it blind gives you either nothing or a fully broken pane, depending on the engine.
2. **Apply it by class, never by inline style.** An inline `el.style.backdropFilter = …` beats
   every stylesheet rule, including the reduced-transparency fallback — the fallback silently
   stops working and you will not notice, because you are not the person who needs it. The lab's
   harness caught precisely this.
3. **Keep it on small chrome.** Measured on the harness machine (headless, software
   rasterisation): a viewport-sized busy backdrop with four blurred panes ran ~50ms/frame, and
   adding the displacement map pushed it to ~67ms — about 1.3×. Scoped to the nav and a popover
   the delta fell inside noise (~51 vs ~52ms). GPU hardware is far faster in absolute terms, but
   the ratio is the guidance: **refraction is a nav-and-toolbar effect, not a panel effect.**

Never apply a displacement filter to text.

---

## Material weight scales with size

```css
.w-s { --glass-blur: 10px; }   /* small control */
.w-m { --glass-blur: 20px; }   /* toolbar */
.w-l { --glass-blur: 34px; box-shadow: var(--shadow-3); }  /* large overlay */
```

A bigger pane of glass is a thicker pane of glass. Uniform blur across every surface is the
tell of a system that was copied rather than designed.

---

## Fallback tiers

Three, in order of how much they change:

```css
/* no backdrop-filter at all → opaque surface, same hierarchy */
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: oklch(20% .02 255); }
  .glass::before, .glass::after { display: none; }
}

@media (prefers-reduced-transparency: reduce) {
  .glass { background: oklch(19% .02 255); backdrop-filter: none; }
  .glass::before, .glass::after { display: none; }
}

@media (prefers-contrast: more) {
  .glass { background: oklch(13% .015 255); border-color: rgb(255 255 255 / .72); }
}
```

All three are verified by emulating the media features through CDP in `scripts/verify.mjs` —
`backdrop-filter` must compute to `none`, the background must be opaque, and the border alpha
must exceed 0.5 under increased contrast.

---

## Material motion — glass materialises

Glass should not merely fade in. Opacity, transform and filter travel together, and
`@starting-style` supplies the entry state for an element that was `display: none` a frame ago.

```css
[popover] {
  opacity: 0;
  transform: translateY(10px) scale(.96);
  filter: blur(10px);
  transition:
    opacity   var(--motion-base) var(--ease-enter),
    transform var(--motion-slow) var(--ease-spring),
    filter    var(--motion-slow) var(--ease-enter),
    overlay   var(--motion-slow) allow-discrete,
    display   var(--motion-slow) allow-discrete;
}
[popover]:popover-open { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

@starting-style {
  [popover]:popover-open { opacity: 0; transform: translateY(10px) scale(.96); filter: blur(10px); }
}
```

`allow-discrete` on `display` and `overlay` is what keeps the element in the top layer while the
*exit* transition runs. Without it the popover vanishes instantly on close and only animates in.

---

## Anchor positioning

The menu is placed by the browser relative to its trigger — no `getBoundingClientRect`, no
reposition listener, correct inside the top layer.

```css
.menu-trigger { anchor-name: --menu-trigger; }

#glass-menu {
  position: absolute;
  position-anchor: --menu-trigger;
  position-area: bottom span-right;
  margin: 10px 0 0 0;                    /* clears the UA's `margin: auto` */
  position-try-fallbacks: flip-block, flip-inline;
}
```

**Do not re-declare `inset`.** The UA stylesheet gives `[popover]` both `inset: 0` and
`margin: auto`; the margin must be cleared, but an explicit `inset` value *overrides the
`position-area` placement entirely* and the menu silently falls back to its static position.
This cost a debugging round in the lab — the menu appeared 360px away from its trigger.

`position-try-fallbacks` handles viewport edges: the menu flips above or inline rather than
clipping.

---

## Depth anatomy

A premium surface can contain, in order:

1. base fill
2. ambient gradient
3. occlusion shadow (tight, dark, close)
4. directional cast shadow (large, soft, offset along the light direction)
5. top/specular edge (`inset 0 1px 0 rgb(255 255 255 / .38)`)
6. reflected colour spill from nearby content
7. subtle inner shadow
8. texture or noise at very low opacity

Never apply all eight at full strength. `lab/material.html` has a stepper that adds one layer at
a time — the jump from 4 to 5 (adding the specular edge) is the one that makes a rectangle read
as a physical object.

```css
:root {
  --shadow-1: 0 1px 1px rgb(0 0 0 / .18), 0 8px 24px rgb(0 0 0 / .14);
  --shadow-2: 0 2px 2px rgb(0 0 0 / .18), 0 18px 60px rgb(0 0 0 / .24),
              inset 0 1px 0 rgb(255 255 255 / .12);
  --shadow-3: 0 4px 8px rgb(0 0 0 / .2),  0 34px 100px rgb(0 0 0 / .34),
              inset 0 1px 0 rgb(255 255 255 / .14);
}
```

**One light source.** Every shadow in the set agrees about where it is. Mixed light directions
are the fastest way to make an interface look assembled from screenshots of other interfaces.

Adaptive rules: stronger separation over busy content; softer shadows over flat backgrounds;
hover changes position *and* shadow, never position alone; dark mode is re-authored, not
inverted.

---

## Perceptual colour

```css
:root {
  --brand:  oklch(72% .17 250);
  --surface: oklch(17% .025 255);
  --surface-raised: color-mix(in oklab, var(--surface) 84%, white);
  --surface-sunken: color-mix(in oklab, var(--surface) 86%, black);
  --line: color-mix(in oklab, white 13%, transparent);
}
```

OKLCH keeps lightness perceptually even across hues, so a ramp built by varying L reads as one
material instead of five different plastics. Mixing in `oklab` avoids the muddy midpoint sRGB
interpolation produces.

---

## Scroll-edge treatment

Where content passes beneath floating chrome, use a fading blur zone rather than a hard divider:

```css
.scroll-edge::after {
  content: '';
  position: absolute; left: 5%; right: 5%; bottom: -18px; height: 22px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgb(0 0 0 / .22), transparent);
  filter: blur(8px);
  opacity: var(--edge-opacity, 0);
}
```

Raise `--edge-opacity` only while content actually overlaps the chrome — a permanently visible
edge is just a border with extra steps.
