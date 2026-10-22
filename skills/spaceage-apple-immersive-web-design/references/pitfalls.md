# Failure catalogue

Every entry below was hit while building `lab/` — not collected from articles. Each has the
symptom, the cause, the fix, and the assertion that catches it.

---

## 1. The velocity accent that never comes back

**Symptom.** Scroll fast, stop, and the heading stays visibly skewed. Forever.

**Cause.** `ScrollTrigger.create({ onUpdate })` fires only *while* the page is scrolling. The last
callback ran with a non-zero velocity, set a non-zero skew target, and nothing ever ran again.

**Fix.** Debounce a return to rest:

```js
let restId;
onUpdate: (self) => {
  skewTo(gsap.utils.clamp(-5, 5, self.getVelocity() / -320));
  clearTimeout(restId);
  restId = setTimeout(() => skewTo(0), 120);
}
```

`Observer`'s `onStop` / `onStopDelay` is the built-in equivalent.

**Assertion.** *"velocity accent returns to rest when scrolling stops"* — scroll hard, wait for
`scrollY` to stop changing, wait again, assert the skew factor is below 0.005.

---

## 2. Inline styles silently defeating accessibility fallbacks

**Symptom.** `prefers-reduced-transparency: reduce` correctly swapped the background to opaque,
but `backdrop-filter` was still blurring.

**Cause.** The refraction effect was applied as `el.style.backdropFilter = '…'` after a feature
probe. Inline styles beat every stylesheet rule, including the media query written specifically
to remove them.

**Fix.** Apply feature-gated effects by **class**, and let the cascade do its job:

```js
if (CSS.supports('backdrop-filter', 'blur(2px) url(#lg-refract)')) el.classList.add('lens');
```

```css
.lens { backdrop-filter: blur(24px) saturate(150%) url(#lg-refract); }
@media (prefers-reduced-transparency: reduce) { .lens { backdrop-filter: none; } }
```

This is the general rule: **anything an accessibility preference must be able to override cannot
be set inline.**

**Assertion.** *"reduced transparency removes every backdrop-filter"* under emulated
`prefers-reduced-transparency`.

---

## 3. `inset` cancelling `position-area`

**Symptom.** An anchor-positioned popover appeared ~360px from its trigger, roughly where it sat
in the document flow.

**Cause.** The UA stylesheet gives `[popover]` `inset: 0; margin: auto`. Clearing the margin is
necessary — but the code also re-declared `inset: auto`, and **an explicit `inset` overrides the
`position-area` placement entirely.**

**Fix.** Clear only the margin:

```css
#menu {
  position: absolute;
  position-anchor: --trigger;
  position-area: bottom span-right;
  margin: 10px 0 0 0;      /* no `inset` declaration at all */
}
```

**Assertion.** *"anchor positioning aligns the menu to its trigger"* — menu `x` within 2px of the
trigger's `x`, and menu top below the trigger's bottom.

---

## 4. Glass stacked on glass

**Symptom.** Three "material weight" samples inside a glass panel rendered as flat dark boxes
with no visible difference between blur 10 and blur 34.

**Cause.** They were glass on glass. Both layers sampled a backdrop that was itself translucent,
so neither read as a surface — exactly the hierarchy collapse the skill's own rules forbid.

**Fix.** Move the samples out of the panel, directly onto the busy background. Material weight is
only legible against real content.

**Assertions.** *"material weight scales with surface size"* (10px vs 34px blur) and *"refraction
rim stays off large content surfaces"*.

---

## 5. Carousel treatment driven by snap indices

**Symptom.** The centre-slide scale effect worked in the middle of the carousel and collapsed at
both ends — adjacent slides looked identical.

**Cause.** The treatment compared `scrollSnapList()[i]` against `scrollProgress()`. With
`containScroll: 'trimSnaps'` the outer snaps are clamped into the scrollable range, so they bunch:
snaps 0 and 1 were 0.025 apart while snaps 1 and 2 were 0.36 apart.

**Fix.** Use real geometry, measured once:

```js
const distance = Math.abs(geo.centers[i] - progress * geo.span - geo.viewport / 2);
const closeness = gsap.utils.clamp(0, 1, 1 - distance / (geo.viewport / 2));
```

**Assertion.** *"progress-driven treatment favours the centre slide"* — centre `--s` > 0.98 while
a far slide is < 0.96.

---

## 6. Handles assigned after the ready-copy

**Symptom.** `window.__lab.flip` was `undefined` in tests even though the Flip animation was
visibly running.

**Cause.** `ready(handles)` does `Object.assign(window.__lab, handles)` **once**. The Flip
instance is created later, on click, and `handles.flip = …` only mutated a local object nobody
was reading any more.

**Fix.** Publish late values on the global directly: `window.__lab.flip = Flip.from(…)`.

**Assertion.** *"Flip animation is running mid-flight"* — `window.__lab.flip.isActive()` 70ms
after the click.

---

## 7. Measuring a scrubbed timeline before it caught up

**Symptom.** The same assertion at the same scroll offset read panel opacity 0.564 on one run and
1.0 on another.

**Cause.** `scrub: 0.65` means the timeline eases toward its trigger's progress over 0.65s. A
screenshot or measurement taken right after a programmatic jump captures a frame of that
catch-up.

**Fix.** `scrubsSettled()` — poll until every scrubbed animation's `progress()` matches its
trigger's `progress` within 0.002. See `performance-accessibility.md`.

---

## 8. Reading the wrong transform matrix component

**Symptom.** A working skew animation measured as exactly zero, every time.

**Cause.** In `matrix(a, b, c, d, e, f)`, **`b` is skewY and `c` is skewX**. The harness was
reading `c` for a skewY animation.

**Fix.** Know the layout: `a`/`d` scale, `b`/`c` skew (in that order), `e`/`f` translate.

**Why it matters beyond this bug:** a false zero looks identical to a genuine failure. Verify the
harness against a case you know is true before trusting a failure it reports.

---

## 9. Sampling a transition with a round-trip per frame

**Symptom.** A 320ms opacity transition appeared to have zero intermediate frames — it looked like
an instant switch.

**Cause.** Each sample was a separate `page.evaluate()` call. On a heavy page each round-trip cost
more than the transition itself, so every sample landed either before the start or after the end.

**Fix.** Sample inside one `evaluate`, on the page's own rAF clock. Where the page is heavy enough
that even that is unreliable, assert the structure instead — `transition-property` including
opacity, transform, filter, display and overlay proves the materialisation is wired.

---

## 10. `scroll-behavior: smooth` outlasting the test

**Symptom.** "Has it settled?" checks failed intermittently.

**Cause.** `window.scrollBy()` under `scroll-behavior: smooth` keeps animating after the loop that
called it has finished. Velocity was still non-zero when the assertion ran.

**Fix.** Wait for `scrollY` to stop changing before measuring anything downstream of scrolling:

```js
let last = -1;
while (last !== window.scrollY) {
  last = window.scrollY;
  await new Promise((r) => setTimeout(r, 120));
}
```

---

## 11. Content hidden by its own reveal

**Symptom (avoided by design, but the most common failure in the wild).** A script error, an
unsupported API, or a blanket reduced-motion rule leaves elements permanently at `opacity: 0`.

**Cause.** The hidden state is authored as the default, and something is expected to remove it.

**Fix.** Make the *visible* state the default, and apply the hidden state only after confirming a
mechanism exists to undo it:

```css
.reveal { opacity: 1; transform: none; }
.js .reveal, .vt .reveal { opacity: 0; transform: translateY(2rem); }
```

```js
document.documentElement.classList.add(
  CSS.supports('animation-timeline', 'view()') ? 'vt' : 'js');
```

And under reduced motion, force `opacity: 1` explicitly — a duration of zero on an animation that
starts hidden freezes it hidden.

**Assertions.** *"reveal is hidden before entering the viewport"*, *"reveal resolves to visible in
view"*, *"reduced motion leaves all revealed content visible"*.

---

## 12. Things the assertions could not catch

Behavioural verification passed 100/100 while the screenshots still showed:

- a display heading colliding with its lead paragraph (tight `line-height` plus zero margin);
- a section heading sliding under the fixed nav on first paint;
- material samples that were technically correct and visually dead (see #4).

**Look at the screenshots.** Automated assertions verify that a thing happens; only your eye
verifies that it is any good.
