# Sources and implementation references

## Source skill

- Emil Kowalski, `skills/apple-design/SKILL.md` — https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md
- Repository folder — https://github.com/emilkowalski/skills/tree/main/skills/apple-design
- MIT licence — https://github.com/emilkowalski/skills/blob/main/LICENSE

Preserved verbatim in `source-baseline/apple-design-SKILL.md` and `source-baseline/LICENSE`.

## Apple design guidance

- Human Interface Guidelines — Materials — https://developer.apple.com/design/human-interface-guidelines/materials
- Human Interface Guidelines — Motion — https://developer.apple.com/design/human-interface-guidelines/motion
- Adopting Liquid Glass — https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass

Used as design guidance only. Nothing in this package reproduces Apple assets or claims to
implement Apple's private rendering.

## Browser platform

- CSS scroll-driven animations — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
- `animation-timeline` — https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- `animation-range` — https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range
- `@container scroll-state()` — https://developer.mozilla.org/en-US/docs/Web/CSS/@container
- View Transition API — https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- Cross-document view transitions — https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- `PageRevealEvent` — https://developer.mozilla.org/en-US/docs/Web/API/PageRevealEvent
- `@property` / CSS Properties and Values API — https://developer.mozilla.org/en-US/docs/Web/CSS/@property
- `@starting-style` — https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
- `transition-behavior: allow-discrete` — https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior
- `interpolate-size` — https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size
- `calc-size()` — https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size
- CSS anchor positioning — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning
- Popover API — https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
- `text-box-trim` / `text-box-edge` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim
- `text-wrap` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
- `font-optical-sizing` — https://developer.mozilla.org/en-US/docs/Web/CSS/font-optical-sizing
- `color-mix()` — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
- OKLCH — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
- `backdrop-filter` — https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- SVG `feDisplacementMap` — https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap
- `createImageBitmap` — https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- `prefers-reduced-transparency` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency
- `prefers-contrast` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast

## Interaction libraries

- GSAP docs — https://gsap.com/docs/v3/
- GSAP licensing (free tier since 3.13) — https://gsap.com/licensing/
- ScrollTrigger — https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- `containerAnimation` — https://gsap.com/docs/v3/Plugins/ScrollTrigger/#containerAnimation
- SplitText — https://gsap.com/docs/v3/Plugins/SplitText/
- Flip — https://gsap.com/docs/v3/Plugins/Flip/
- Draggable — https://gsap.com/docs/v3/Plugins/Draggable/
- InertiaPlugin — https://gsap.com/docs/v3/Plugins/InertiaPlugin/
- Observer — https://gsap.com/docs/v3/Plugins/Observer/
- `gsap.matchMedia()` — https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
- `gsap.quickTo()` — https://gsap.com/docs/v3/GSAP/gsap.quickTo()
- `@gsap/react` `useGSAP()` — https://gsap.com/resources/React/
- Embla Carousel options — https://www.embla-carousel.com/api/options/
- Lenis — https://github.com/darkroomengineering/lenis

## Verification tooling

- Playwright — https://playwright.dev/docs/api/class-playwright
- `Emulation.setEmulatedMedia` (CDP) — https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setEmulatedMedia
- Long Tasks API — https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming

## Interpretation note

The references above support the design and implementation decisions in this package. The terms
"Apple-inspired" and "Liquid Glass-inspired" are used deliberately: this is web CSS and
JavaScript, not an official Apple implementation.

## Verification environment

Numbers quoted in `SKILL.md` and `references/performance-accessibility.md` were measured on
headless Chromium 141.0.7390.37 under software rasterisation in a Linux container, Node 22.22.2,
GSAP 3.13.0, Embla 8.6.0, Lenis 1.3.25. Raw results: `proof/verification.json`.
