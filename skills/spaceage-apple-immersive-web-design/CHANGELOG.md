# Changelog

## 2.0.0 — 2026-08-05

The v1 package was a strong written system with an illustrative demo. v2 turns it into a
verified one: every technique is running code, and every claim is a browser assertion.

### Added — runnable pattern lab (`lab/`)
- `tokens.css`: registered `@property` values, four durations, four easing curves including a
  spring as `linear()`, fluid scale with size-specific tracking, OKLCH ramp, single-light
  elevation, glass material with three fallback tiers, accessibility parallel designs.
- `boot.js`: the dev contract — `__ready`, `__lab`, `?jump=`, `?motion=off`, `scrubsSettled()`,
  live feature-support probe, local-vendor-then-CDN dependency loading.
- `scroll.html`: view-timeline reveals with IntersectionObserver fallback, `scroll-state(stuck)`
  chrome, pinned+scrubbed hero via `matchMedia`, horizontal run with `containerAnimation` nested
  triggers, pure-CSS sticky stack, canvas media scrub with `ImageBitmap` decode queue, velocity
  accents with return-to-rest, and a genuinely recomposed mobile branch.
- `type.html`: SplitText 3.13 (`mask`, `autoSplit`, `onSplit`, `aria`) across line/word/character
  tiers, scroll-driven variable-font axis, `@property` gradient sheen, CSS-only masked reveal,
  `text-box-trim`, velocity-reactive wrapped marquee.
- `material.html`: four-layer glass, SVG displacement refraction behind a feature probe, material
  weight ladder, depth-anatomy stepper, Popover API + anchor positioning with `@starting-style`
  materialisation, `interpolate-size` accordions.
- `carousel.html`: Embla with a geometry-driven centre treatment, full keyboard parity, live
  region, and a Draggable + InertiaPlugin strip with progressive edge resistance.
- `transitions.html` / `transitions-detail.html`: GSAP Flip shared elements, same-document view
  transitions with stable names, cross-document view transitions proven via `pagereveal`.
- `smooth.html`: correct Lenis + ScrollTrigger wiring (one clock, `lagSmoothing(0)`) and the
  reasons not to install it.

### Added — verification (`scripts/`)
- `verify.mjs`: 100 behavioural assertions across 7 pages — pin engagement and release, monotonic
  scrub interpolation, nested container-animation values, frame-index progression, accessible
  names after splitting, measured `text-box-trim` box reduction, anchor placement, interpolated
  `height: auto`, inertia after `pointerup`, cross-document transition proof, accessibility floor,
  and frame pacing with a measured refraction-cost ratio.
- `capture.mjs`: 24 deterministic screenshots (desktop, mobile, reduced motion, reduced
  transparency).
- `setup.mjs` / `serve.mjs`: offline vendoring and a zero-dependency static server.

### Added — documentation
- `SKILL.md` rewritten around the verification contract, an updated 2026 stack router, and
  measured performance guidance.
- Seven reference deep-dives plus `references/pitfalls.md`, a catalogue of twelve failures hit
  and fixed while building the lab, each with the assertion that catches it.

### Changed
- Stack router updated for GSAP 3.13's free plugin tier, `scroll-state()`, `interpolate-size`,
  anchor positioning, the Popover API, and cross-document view transitions.
- Responsive matrix now requires mobile pins to be *absent*, not shortened — and asserts it.
- Performance guidance now quotes measured numbers and names the hardware.

### Preserved
- All v1 design laws, immersion tiers, audit rubric and acceptance tests.
- Source attribution, MIT licence, and the original `apple-design` skill in `source-baseline/`.

## 1.0.0 — 2026-08-05
Initial SpaceAge expansion of the `apple-design` skill: activation rules, production workflow,
output contract, scroll/carousel/typography/material systems, degradation matrix, performance and
accessibility guidance, audit rubric, offline demo and report.
