# Kinetic typography

Running implementation: `lab/type.html`.

Typography is the primary visual system, not decoration added after layout. The question is
never "should this animate" but "which unit of text is allowed to move".

---

## The four tiers

| Tier | Unit | Use for | Never for |
| --- | --- | --- | --- |
| 1 | whole block | body copy, utility headings | — |
| 2 | line | editorial headings with deliberate breaks | paragraphs |
| 3 | word | short campaign statements | anything over ~12 words |
| 4 | character | one logotype or hero phrase | sentences, body sizes |

Descending this table costs DOM nodes, accessibility risk and re-split work. Justify each step.

---

## Fluid scale with size-specific tracking

```css
:root {
  --step--1: clamp(.78rem, .74rem + .18vw, .9rem);
  --step-0:  clamp(1rem, .94rem + .24vw, 1.15rem);
  --step-1:  clamp(1.35rem, 1.15rem + .85vw, 1.9rem);
  --step-2:  clamp(2rem, 1.45rem + 2.2vw, 3.5rem);
  --step-3:  clamp(3.1rem, 1.8rem + 5vw, 7.5rem);
  --step-4:  clamp(4.5rem, 2rem + 9vw, 12rem);

  --track-display: -.055em;   /* big type needs negative tracking */
  --track-heading: -.028em;
  --track-body: 0em;
  --track-micro: .06em;       /* small caps need positive */
}
```

Tracking is a function of size, not a brand constant. A display face at 12rem with body tracking
looks loose; body copy with display tracking closes its counters.

---

## `text-box-trim` — optical vertical metrics

```css
.display {
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}
```

Fonts ship built-in leading above the cap height and below the baseline. That padding is why a
"vertically centred" heading never looks centred, and why the gap above a heading always needs
a different value from the gap below.

Measured in the lab on the same heading, same font, same size: **35.0px box → 22.0px box.** The
13px difference is exactly the phantom space you have been manually compensating for with
negative margins.

Use it on display type and headings. Leave body copy alone — its leading is load-bearing.

---

## Registered properties make things animatable

An unregistered custom property is a string. `--angle: 120deg → 480deg` is a step change, not an
interpolation. Registering it gives the engine a type:

```css
@property --sheen-angle { syntax: '<angle>';  inherits: false; initial-value: 120deg; }
@property --wght        { syntax: '<number>'; inherits: true;  initial-value: 400; }
@property --reveal      { syntax: '<number>'; inherits: true;  initial-value: 0; }
```

### Animated gradient text

```css
.gradient-text {
  background: linear-gradient(var(--sheen-angle),
    oklch(97% .02 250) 8%, var(--accent) 34%, var(--hot) 62%, oklch(97% .02 250) 94%);
  background-clip: text;
  color: transparent;
  animation: sheen 7s linear infinite;
}
@keyframes sheen { to { --sheen-angle: 480deg; } }
@media (prefers-reduced-motion: reduce) { .gradient-text { animation: none; } }
```

Check contrast against the *darkest* stop, and keep a solid `color` fallback for engines without
`background-clip: text`.

### Variable axis driven by scroll

```css
.axis-line {
  --wght: 300;
  font-variation-settings: 'wght' var(--wght), 'opsz' 60;
  animation: weight-up both linear;
  animation-timeline: view();
  animation-range: entry 0% cover 60%;
}
@keyframes weight-up { to { --wght: 820; } }
```

Animating the axis rather than `font-size` means **no reflow** — the glyphs thicken in place.
Verified interpolating 300 → 820 across the range, with the value reaching
`font-variation-settings` each frame.

Cap this to short headings, and remember it only *looks* like anything with a variable font
loaded (`font-optical-sizing: auto` handles `opsz` automatically when the face supports it).

### Mask reveal with zero JavaScript

```css
.mask-lines p {
  --reveal: 0;
  mask-image: linear-gradient(to right,
    black calc(var(--reveal) * 130% - 30%),
    transparent calc(var(--reveal) * 130%));
  animation: mask-in both linear;
  animation-timeline: view();
  animation-range: entry 14% cover 46%;
}
@keyframes mask-in { to { --reveal: 1; } }
@supports not (animation-timeline: view()) { .mask-lines p { --reveal: 1; } }
```

One registered number drives a soft-edged wipe. The `@supports not` block is mandatory —
without it, unsupported engines render permanently masked text.

---

## SplitText (GSAP 3.13)

The 3.13 rewrite added `mask`, `autoSplit`, `onSplit` and proper `aria` handling. Use them; the
old `new SplitText()` + manual re-split pattern is obsolete.

```js
SplitText.create('[data-split-lines]', {
  type: 'lines',
  mask: 'lines',        // wraps each line in an overflow:clip element
  autoSplit: true,      // re-splits on resize and on font load
  aria: 'auto',         // aria-label on the container, fragments hidden
  linesClass: 'line',
  onSplit(self) {
    return gsap.from(self.lines, {          // ← RETURN the tween
      yPercent: 110,
      duration: .9,
      stagger: .09,
      ease: 'expo.out',
      scrollTrigger: { trigger: '[data-split-lines]', start: 'top 82%', once: true },
    });
  },
});
```

Three things to get right:

1. **Return the tween from `onSplit`.** GSAP then owns it and kills it before re-splitting. The
   classic leak is a re-split while old tweens still hold references to destroyed nodes.
2. **`mask: 'lines'` is not decoration.** Lines slide out from behind a clipping edge instead of
   fading in mid-air — the difference between "animated" and "designed". Verified: one
   `.line-mask` per line, each computing `overflow: clip`.
3. **Never split a paragraph.** Hundreds of spans cost layout, memory and screen-reader sanity.

Character tier, one word only:

```js
SplitText.create('[data-split-chars]', {
  type: 'chars',
  aria: 'auto',
  onSplit: (self) => gsap.from(self.chars, {
    yPercent: 60, opacity: 0, rotateX: -55,
    transformOrigin: '50% 100% -40px',
    duration: .85,
    stagger: { each: .045, from: 'center' },   // centre-out cascade, not a flat ramp
    ease: 'back.out(1.6)',
  }),
});
```

`stagger: { from: 'center' | 'edges' | 'random' | index }` and `gsap.utils.distribute` with a
`grid` are what separate a considered cascade from a linear index ramp.

**Accessibility is verified, not assumed.** The lab asserts that after splitting, the container's
accessible name still equals the original sentence — all three tiers, exact string match.

---

## Velocity-reactive marquee

```js
const half = () => row.scrollWidth / 2;
const wrap = gsap.utils.wrap(-half(), 0);

const spin = gsap.to(row, {
  x: `-=${half()}`,
  ease: 'none',
  duration: 18,
  repeat: -1,
  modifiers: { x: (v) => `${wrap(parseFloat(v))}px` },
});

ScrollTrigger.create({
  onUpdate: (self) => {
    if (self.direction !== direction) { direction = self.direction; spin.timeScale(direction); }
    const boost = gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 2200);
    gsap.to(spin, { timeScale: direction * boost, duration: .25, overwrite: true });
    gsap.to(spin, { timeScale: direction, duration: .9, delay: .25, overwrite: false });
  },
});
```

One wrapped translation drives the whole row — not N clones each running their own animation.
`modifiers` runs per frame on the computed value, which is what makes the loop seamless without
duplicating tweens. Scroll direction flips `timeScale`; scroll velocity briefly boosts it and
then eases back.

Mark the row `aria-hidden="true"` — a looping decorative word list is noise to a screen reader.
Pause it entirely under reduced motion (verified: `x` unchanged over 600ms).

---

## Techniques worth using

- `text-wrap: balance` on short display text; `text-wrap: pretty` on body copy where the
  rag matters enough to pay for it;
- mixed weights and widths from **one** variable family, never unrelated families;
- outline↔fill transitions via pseudo-elements, not duplicated accessible text;
- `hanging-punctuation: first last` for editorial layouts;
- `font-size-adjust: ex-height from-font` to keep fallback fonts optically matched.

## Reject

- tiny all-caps body copy;
- centred headings in every section;
- extreme negative tracking that closes counters;
- duplicated words layered without `aria-hidden`;
- animated body text;
- effect fonts for instructions;
- text over moving media without an adaptive contrast layer.
