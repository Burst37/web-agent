---
name: spaceage-apple-immersive-web-design
description: Build, redesign, or audit premium web interfaces with Apple-grade fluidity and current immersive web techniques. Use for scroll storytelling, pinned and scrubbed sequences, momentum carousels, spring-driven gestures, view transitions, kinetic typography, layered shading, Liquid Glass-inspired functional chrome, responsive motion systems, accessibility fallbacks, performance budgets, screenshot QA, and implementation reports. Do not use to copy Apple branding or reproduce an Apple page pixel-for-pixel.
---

# SpaceAge Apple-Immersive Web Design

**Version:** 1.0.0  
**Type:** reusable cross-LLM design-engineering skill  
**Lineage:** expanded from Emil Kowalski's MIT-licensed `apple-design` skill and translated into a production workflow for modern web builds.

## Mission

Create web experiences that feel physically coherent, immediate, cinematic, and premium without turning the interface into a motion demo. Motion, typography, glass, depth, and scroll are functional systems. They must improve hierarchy, comprehension, navigation, or conversion.

The skill must produce implementation-ready decisions, not aesthetic commentary alone.

## Activation

Invoke this skill when the user asks to:

- build or redesign a premium, Apple-like, cinematic, editorial, luxury, or immersive website;
- add advanced scroll, carousel, transition, typography, depth, glass, or interaction systems;
- review a UI for fluidity, motion quality, visual hierarchy, or conversion impact;
- convert a static design, screenshot, Figma file, or existing website into a polished implementation;
- create a reusable motion system or design-engineering standard;
- diagnose jank, weak transitions, generic typography, fake glass, flat shading, or inaccessible motion;
- produce a coded prototype plus screenshots and a change report.

Do not activate solely because a project uses rounded corners, blur, or a dark theme.

## Source integrity and naming

- Preserve the source author's MIT attribution in derivative packages.
- Describe the approach as **Apple-inspired fluid interaction** or **Liquid Glass-inspired web material**, not as an official Apple implementation.
- Do not copy Apple logos, proprietary assets, product photography, page layouts, or brand language.
- Use the principles: hierarchy, fluidity, restraint, direct manipulation, adaptivity, and content-first design.

## Required operating mode

### Never stop at recommendations

For a codebase or build request, complete this chain:

1. inspect the current interface and available assets;
2. identify the experience goal and conversion goal;
3. select the smallest viable interaction stack;
4. implement or write implementation-ready code;
5. render the result;
6. capture desktop and mobile screenshots;
7. inspect failures and revise;
8. deliver a change report, acceptance matrix, and file manifest.

When the environment cannot render, state that limitation and provide a deterministic render/QA command set. Never claim visual QA occurred when it did not.

### Evidence before invention

Lock these before changing a real project:

- existing layout and route structure;
- brand colors, typography, logos, imagery, and content;
- user-provided references and exact elements that must remain unchanged;
- framework, package manager, browser support, and deployment target;
- performance constraints and mobile priorities;
- interaction purpose for every proposed effect.

Do not replace user assets, faces, logos, products, architecture, copy, or brand elements unless explicitly instructed.

## Output contract

A full execution should return or create:

1. **Experience brief** — audience, emotion, conversion action, content priority.
2. **Observed baseline** — what exists, what works, what fails.
3. **Immersion map** — section-by-section visual and interaction purpose.
4. **Stack decision** — native CSS, GSAP, Motion, Embla, View Transitions, WebGL, or none.
5. **Motion tokens** — timing, springs, easing, depth, blur, shadow, and reduced-motion rules.
6. **Implementation** — code or exact patches.
7. **Responsive degradation plan** — desktop, tablet, mobile, reduced motion, reduced transparency.
8. **Performance plan** — animation and asset budgets.
9. **Rendered proof** — screenshots or capture commands.
10. **QA report** — findings, revisions, remaining risks, acceptance tests.

## Core design laws

### 1. Directness before spectacle

- Feedback begins on pointer-down.
- Dragged content tracks 1:1 after a small intent threshold.
- Interactive motion is interruptible and reversible.
- New motion starts from the live presentation value.
- Velocity is carried into spring or inertia motion.
- Boundaries resist progressively instead of hard-stopping.

### 2. Spatial continuity

- Enter and exit use the same origin and path.
- Popovers, menus, sheets, and expanded cards originate from their trigger.
- Shared elements maintain identity across view changes.
- A scroll sequence must preserve orientation; never rotate the page's mental model without a clear anchor.

### 3. Content remains primary

- Immersion supports a narrative or action.
- The hero communicates the offer before the first decorative sequence completes.
- Scroll effects never hide required copy or controls.
- Glass belongs mainly to functional chrome: navigation, controls, compact overlays, and transient interaction layers.
- Do not put every card inside glass.

### 4. Restraint compounds quality

- One major motion idea per viewport.
- One dominant depth language per page.
- One carousel behavior per carousel.
- One type animation idea per heading group.
- Do not combine parallax, wobble, blur, rotation, scale, split text, and particle motion on the same element.

### 5. Accessibility is a parallel design, not an afterthought

- Reduced motion receives a coherent cross-fade/static composition.
- Reduced transparency receives solid or near-solid surfaces.
- Increased contrast receives explicit borders and higher-contrast text.
- Keyboard, focus, screen-reader order, and pointer interactions remain complete.

## Production workflow

## Phase 0 — Intake and repository audit

Inspect:

- framework and rendering mode;
- page/route structure;
- component and token systems;
- CSS architecture;
- animation libraries already installed;
- media sizes and loading behavior;
- current accessibility handling;
- mobile breakpoints;
- existing visual regressions;
- reusable assets and components.

Create an evidence table:

| Finding | Evidence | Impact | Keep / revise / remove |
| --- | --- | --- | --- |
| Current hero uses autoplay video | file/path or screenshot | strong atmosphere, weak text contrast | revise |
| Carousel is hand-rolled | component path | drag bugs and no keyboard model | replace |
| Glass used on all cards | stylesheet path | hierarchy collapse | remove from content cards |

Separate **observed evidence** from **inference**.

## Phase 1 — Experience brief

Define:

- **Primary user:** who is arriving;
- **Primary action:** what they must do;
- **Desired emotion:** calm, precision, desire, urgency, confidence, exclusivity, or energy;
- **Narrative arc:** arrival → proof → exploration → decision;
- **motion personality:** restrained, editorial, kinetic, physical, cinematic, playful, or technical;
- **device priority:** mobile-first, desktop showcase, kiosk, or balanced;
- **immersion budget:** light, standard, premium, flagship.

### Immersion tiers

| Tier | Use | Typical systems |
| --- | --- | --- |
| Light | service and utility sites | reveal, hover, active feedback, simple shared transitions |
| Standard | premium SMB and product pages | hero motion, sticky narrative, one carousel, layered depth |
| Premium | fashion, nightlife, creative, flagship launches | pinned sequence, kinetic type, advanced carousel, glass chrome |
| Flagship | experience-led launch or portfolio | scene-based scroll, media scrubbing, optional WebGL, extensive QA |

Do not default every project to flagship.

## Phase 2 — Immersion map

For every section, define:

```text
SECTION:
Purpose:
Primary content:
User action:
Visual anchor:
Motion role:
Scroll behavior:
Depth/material:
Mobile behavior:
Reduced-motion behavior:
Performance risk:
```

Reject an effect when its purpose is only “looks cool.” Replace it with a purpose such as:

- reveal hierarchy;
- show cause and effect;
- maintain object continuity;
- communicate product construction;
- compare states;
- pace a narrative;
- emphasize a decision;
- preserve orientation.

## Phase 3 — Stack router

Use the smallest reliable tool.

| Requirement | First choice | Escalate when |
| --- | --- | --- |
| basic reveal or hover | CSS transitions / `@starting-style` | sequencing becomes complex |
| simple scroll-linked reveal | CSS view timeline with fallback | broad support or precise pinning is required |
| pinned narrative / scrub / horizontal scene | GSAP ScrollTrigger | native CSS cannot express the sequence reliably |
| gesture, spring, drag, shared layout | Motion | bespoke physics or framework restrictions require custom code |
| accessible momentum carousel | Embla | native scroll snap is insufficient |
| simple gallery carousel | native CSS scroll snap | momentum, loop, progress transforms, or API control is needed |
| SPA/MPA continuity | View Transition API | browser support or framework routing requires fallback |
| smooth scroll | native first | use Lenis only with a documented reason and no scroll-jacking |
| true 3D product/spatial content | Three.js/WebGL | never for decorative background alone |
| text splitting | CSS/native DOM first | split only short display text and preserve accessible text |

### Native-first rule

Prefer platform primitives when they satisfy the experience:

- CSS scroll snap;
- sticky positioning;
- CSS scroll/view timelines;
- View Transitions;
- `@starting-style`;
- `clamp()`;
- `text-wrap: balance`;
- `font-optical-sizing`;
- `color-mix()` and OKLCH/OKLAB colors;
- `backdrop-filter` with solid fallbacks;
- container queries;
- `content-visibility` and `contain`.

Add a library only for behavior the browser primitive cannot deliver cleanly.

## Phase 4 — Motion system

Create tokens before animating components.

```css
:root {
  --motion-instant: 100ms;
  --motion-fast: 180ms;
  --motion-base: 320ms;
  --motion-slow: 560ms;
  --ease-enter: cubic-bezier(.16, 1, .3, 1);
  --ease-exit: cubic-bezier(.7, 0, .84, 0);
  --ease-standard: cubic-bezier(.2, .8, .2, 1);
  --press-scale: .97;
  --hover-lift: -4px;
  --parallax-near: 1.08;
  --parallax-far: .94;
}
```

### Motion type rules

- **Tween:** choreographed sequences, scroll-tied motion, opacity, color, masks, editorial timing.
- **Spring:** gestures, retargetable controls, drag release, drawers, morphing controls.
- **Inertia:** carousel or free-drag continuation.
- **No animation:** high-frequency data, critical controls where motion delays action, or repeated utility actions.

### Spring presets

```js
export const springs = {
  ui:       { type: 'spring', bounce: 0,   duration: 0.38 },
  compact:  { type: 'spring', bounce: 0,   duration: 0.28 },
  gesture:  { type: 'spring', bounce: 0.18, duration: 0.42 },
  sheet:    { type: 'spring', bounce: 0.12, duration: 0.46 },
};
```

For physics-based Motion springs, prefer stiffness/damping/mass when velocity continuity matters.

### Press and focus feedback

```css
.action {
  transition:
    transform var(--motion-fast) var(--ease-enter),
    box-shadow var(--motion-fast) var(--ease-enter),
    background-color var(--motion-fast) linear;
}

.action:active { transform: scale(var(--press-scale)); }

.action:focus-visible {
  outline: 2px solid color-mix(in oklab, currentColor 70%, transparent);
  outline-offset: 4px;
}

@media (hover: hover) and (pointer: fine) {
  .action:hover { transform: translateY(var(--hover-lift)); }
}
```

## Scroll immersion systems

## A. View-linked reveal

Use for section headings, product cards, and editorial reveals.

```css
.reveal {
  opacity: 0;
  transform: translateY(2rem) scale(.985);
}

@supports (animation-timeline: view()) {
  .reveal {
    animation: reveal both linear;
    animation-timeline: view();
    animation-range: entry 10% cover 38%;
  }

  @keyframes reveal {
    to { opacity: 1; transform: none; }
  }
}
```

Fallback: IntersectionObserver adds an `.is-visible` class. Do not ship invisible content when the API is unsupported.

## B. Sticky narrative

Use when a visual should remain anchored while copy advances.

Structure:

```html
<section class="story">
  <div class="story__visual" aria-hidden="true">...</div>
  <div class="story__steps">
    <article data-scene="1">...</article>
    <article data-scene="2">...</article>
    <article data-scene="3">...</article>
  </div>
</section>
```

Rules:

- sticky visual stays within its section;
- each step changes one major state;
- transition states overlap enough to avoid flashing;
- copy remains readable without animation;
- mobile converts to stacked scenes or a swipe gallery;
- do not pin for more than the narrative needs.

## C. Pinned GSAP sequence

Use ScrollTrigger for precise scrubbing, pinning, labels, and synchronized media.

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const timeline = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: {
    trigger: '[data-scroll-scene]',
    start: 'top top',
    end: '+=2400',
    pin: true,
    scrub: 0.65,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});

timeline
  .to('[data-layer="hero"]', { scale: 1.06, yPercent: -4 }, 0)
  .to('[data-title]', { yPercent: -120, opacity: 0 }, 0.18)
  .fromTo('[data-detail]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }, 0.28)
  .to('[data-camera]', { xPercent: -36, rotateY: -7 }, 0.45)
  .to('[data-final]', { opacity: 1, scale: 1 }, 0.72);
```

Rules:

- use linear easing inside scrubbed timelines;
- animate transforms, opacity, clip paths, or CSS masks carefully;
- refresh after fonts and media settle;
- use `gsap.matchMedia()` for device-specific timelines;
- remove heavy pinning on narrow screens;
- never hide the browser scrollbar or hijack wheel input.

## D. Horizontal gallery from vertical scroll

Use only when horizontal movement improves comparison or sequencing.

- show a visible next-card cue;
- preserve keyboard and touch access;
- keep section progress visible;
- avoid horizontal motion on reduced-motion;
- mobile should use native horizontal swipe instead of a long pinned conversion.

## E. Media scrub

For image sequences or video frame control:

- use a poster and readable first frame;
- preload only the first required frames;
- progressively decode future frames;
- cap resolution by viewport and DPR;
- avoid hundreds of full-resolution images on mobile;
- preserve a static fallback;
- connect frame choice to scroll progress through `requestAnimationFrame`, not raw scroll handlers.

## F. Scroll velocity accents

Allowed:

- subtle skew or blur on non-text decorative layers;
- progress indicators;
- directional light movement;
- inertial cursor or background parallax.

Disallowed:

- body-copy distortion;
- large brightness flashes;
- uncontrolled full-page wobble;
- motion that continues after scrolling stops without purpose.

## Carousel systems

## Decision rule

Use native scroll snap for a basic gallery. Use Embla when the carousel needs physics, variable-width cards, drag free motion, looping, custom progress, or reliable programmatic control.

## Embla baseline

```js
import EmblaCarousel from 'embla-carousel';

const root = document.querySelector('.embla');
const viewport = root.querySelector('.embla__viewport');

const embla = EmblaCarousel(viewport, {
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: true,
  dragThreshold: 10,
  loop: false,
  breakpoints: {
    '(prefers-reduced-motion: reduce)': { duration: 0 },
  },
});
```

## Premium carousel treatment

Add only effects driven by carousel progress:

- center slide scales from `.92` to `1`;
- edge slides reduce opacity or saturation slightly;
- copy or metadata changes via a shared view transition;
- media parallax is capped to a small range;
- a progress line or fraction communicates position;
- cursor changes to “drag” only on fine pointers;
- focused controls scroll into view.

Do not rotate cards excessively or blur text.

## Accessibility model

- region label identifies the carousel;
- next/previous controls have explicit labels;
- slides have meaningful headings;
- focused controls remain visible;
- autoplay is off by default;
- autoplay, when required, pauses on hover, focus, page hidden, and reduced motion;
- keyboard interaction is complete without requiring drag.

## Kinetic typography

Typography is the primary visual system, not decoration added after layout.

## Fluid type scale

```css
:root {
  --step--1: clamp(.78rem, .74rem + .18vw, .9rem);
  --step-0: clamp(1rem, .94rem + .24vw, 1.15rem);
  --step-1: clamp(1.35rem, 1.15rem + .85vw, 1.9rem);
  --step-2: clamp(2rem, 1.45rem + 2.2vw, 3.5rem);
  --step-3: clamp(3.1rem, 1.8rem + 5vw, 7.5rem);
  --step-4: clamp(4.5rem, 2rem + 9vw, 12rem);
}

.display {
  font-size: var(--step-4);
  line-height: .86;
  letter-spacing: -.055em;
  font-optical-sizing: auto;
  text-wrap: balance;
}
```

## Type motion hierarchy

1. **Whole-block motion** — default for body copy and utility headings.
2. **Line motion** — editorial headings with deliberate line breaks.
3. **Word motion** — short campaign statements.
4. **Character motion** — rare, only for short logos or hero phrases.

Keep semantic text in the DOM. If text is split for animation, maintain an unsplit accessible label and avoid creating hundreds of spans.

## Current typography techniques

- optical sizing with variable fonts;
- size-specific tracking and leading;
- `text-wrap: balance` for short display text;
- `text-wrap: pretty` only where quality justifies its cost;
- mixed weights and widths from a variable font, not unrelated font families;
- gradient or image fill using `background-clip: text` while preserving contrast;
- outline/fill transitions using pseudo-elements, not duplicate accessible text;
- scroll-driven font-weight or width changes capped to short headings;
- masked reveals that leave text legible when animation is disabled.

## Typography failure modes

Reject:

- tiny all-caps body copy;
- generic centered headings in every section;
- extreme negative tracking that closes counters;
- duplicate words layered without `aria-hidden` handling;
- animated body text;
- effect fonts used for important instructions;
- text placed over moving media without adaptive contrast.

## Layered shading and depth

Depth must imply a consistent light model.

## Depth anatomy

A premium surface can contain:

1. base fill;
2. ambient gradient;
3. occlusion shadow;
4. directional cast shadow;
5. top/specular edge;
6. reflected color spill;
7. subtle inner shadow;
8. texture or noise at very low opacity.

Do not apply all layers at maximum intensity.

## Color system

Use perceptual color spaces for stable ramps.

```css
:root {
  --brand: oklch(72% .17 250);
  --surface: oklch(18% .02 255);
  --surface-raised: color-mix(in oklab, var(--surface) 84%, white);
  --surface-sunken: color-mix(in oklab, var(--surface) 86%, black);
  --line: color-mix(in oklab, white 14%, transparent);
  --glow: color-mix(in oklab, var(--brand) 28%, transparent);
}
```

## Elevation tokens

```css
:root {
  --shadow-1:
    0 1px 1px rgb(0 0 0 / .18),
    0 8px 24px rgb(0 0 0 / .14);
  --shadow-2:
    0 2px 2px rgb(0 0 0 / .18),
    0 18px 60px rgb(0 0 0 / .24),
    inset 0 1px 0 rgb(255 255 255 / .12);
  --shadow-3:
    0 4px 8px rgb(0 0 0 / .2),
    0 34px 100px rgb(0 0 0 / .34),
    inset 0 1px 0 rgb(255 255 255 / .14);
}
```

## Adaptive shading

- stronger separation over busy content;
- softer shadows over flat backgrounds;
- larger surfaces read thicker through deeper shadow and stronger scattering;
- active/focused controls can illuminate internally;
- colored content may spill subtly into nearby chrome;
- hover lift changes both position and shadow, not position alone;
- dark mode is re-authored, not inverted.

## Liquid Glass-inspired web material

Liquid Glass is a functional layer that floats above content. It should adapt to background complexity, size, focus, and interaction.

## Material rules

- Use glass mainly for navigation, toolbars, compact control groups, search, transient menus, and selected overlays.
- Do not place glass in the main content layer by default.
- Do not stack clear glass over clear glass.
- Do not mix incompatible clear and regular glass treatments in one control group.
- Keep controls concentric with their containing corners.
- Larger glass surfaces use stronger blur, deeper shadow, and softer highlights.
- Clear glass requires a visually rich background and often a dimming or contrast layer.
- Material can morph between controls and menus when the relationship is clear.

## Web material stack

```css
.glass {
  --glass-fill: color-mix(in oklab, #fff 10%, transparent);
  --glass-line: color-mix(in oklab, #fff 26%, transparent);
  --glass-shadow: rgb(0 0 0 / .28);
  position: relative;
  isolation: isolate;
  overflow: clip;
  background:
    linear-gradient(180deg, rgb(255 255 255 / .12), transparent 38%),
    var(--glass-fill);
  border: 1px solid var(--glass-line);
  box-shadow:
    0 22px 70px var(--glass-shadow),
    inset 0 1px 0 rgb(255 255 255 / .24),
    inset 0 -1px 0 rgb(255 255 255 / .06);
  backdrop-filter: blur(22px) saturate(145%) contrast(1.04);
  -webkit-backdrop-filter: blur(22px) saturate(145%) contrast(1.04);
}

.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 65% at 20% 0%, rgb(255 255 255 / .28), transparent 56%),
    linear-gradient(115deg, transparent 25%, rgb(255 255 255 / .08) 48%, transparent 70%);
  mix-blend-mode: screen;
  opacity: .72;
}

.glass::after {
  content: '';
  position: absolute;
  inset: -30%;
  pointer-events: none;
  background: conic-gradient(from 220deg,
    transparent,
    rgb(120 180 255 / .14),
    transparent 36%,
    rgb(255 160 220 / .10),
    transparent 70%);
  filter: blur(28px);
  opacity: .55;
  transform: translate3d(var(--light-x, 0), var(--light-y, 0), 0);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgb(24 26 32 / .96); }
}
```

## Material variants

```css
.glass--regular {
  --glass-fill: color-mix(in oklab, #111827 72%, transparent);
}

.glass--clear {
  --glass-fill: color-mix(in oklab, #fff 7%, transparent);
  backdrop-filter: blur(14px) saturate(160%);
}

.glass--thick {
  backdrop-filter: blur(32px) saturate(135%) contrast(1.06);
  box-shadow:
    0 36px 100px rgb(0 0 0 / .36),
    inset 0 1px 0 rgb(255 255 255 / .28);
}
```

## Scroll-edge treatment

Use a fading blur/gradient zone instead of a hard divider where content moves beneath floating chrome.

```css
.floating-nav::after {
  content: '';
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: -18px;
  height: 22px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgb(0 0 0 / .22), transparent);
  filter: blur(8px);
  opacity: var(--edge-opacity, 0);
}
```

Increase `--edge-opacity` only when content overlaps the navigation.

## Material motion

Glass should **materialize**, not only fade.

```css
.glass-popover {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  transition:
    opacity 220ms var(--ease-enter),
    transform 360ms var(--ease-enter),
    filter 360ms var(--ease-enter),
    backdrop-filter 360ms var(--ease-enter);

  @starting-style {
    opacity: 0;
    transform: translateY(8px) scale(.96);
    filter: blur(8px);
    backdrop-filter: blur(8px) saturate(120%);
  }
}
```

For gesture-driven morphing, use a spring and preserve velocity.

## View transitions

Use View Transitions to preserve continuity between:

- gallery card → detail page;
- product tile → product view;
- collapsed player → expanded player;
- selected tab or filter state;
- route-level hero image and title.

```css
@view-transition { navigation: auto; }

.product-image { view-transition-name: product-hero; }
.product-title { view-transition-name: product-title; }

::view-transition-old(product-hero),
::view-transition-new(product-hero) {
  animation-duration: 420ms;
  animation-timing-function: cubic-bezier(.16, 1, .3, 1);
}
```

Fallback must remain an immediate route or state change.

## Responsive degradation matrix

| System | Desktop | Tablet | Mobile | Reduced motion |
| --- | --- | --- | --- | --- |
| pinned scroll | full sequence | shorter pin | stacked/swipe | static states |
| parallax | 3–6% | 1–3% | none or 1% | none |
| horizontal scene | vertical-to-horizontal | native swipe option | native swipe | no auto movement |
| liquid glass | regular/clear as appropriate | fewer layers | stronger fill, lower blur | solid/near-solid |
| kinetic type | line/word motion | line motion | block reveal | cross-fade |
| carousel | drag + controls | drag + controls | swipe + controls | duration 0 or short fade |
| WebGL | full quality | reduced DPR | poster or light scene | static poster |

Mobile is not a scaled desktop animation. Recompose it.

## Performance system

### Animation budget

- Continuous effects target compositor-friendly `transform` and `opacity`.
- Use clip paths, masks, filters, and backdrop blur sparingly and test on mobile hardware.
- Do not animate layout properties continuously.
- Do not animate inherited CSS variables on a large ancestor every frame.
- Apply `will-change` shortly before motion and remove it after.
- Avoid nested backdrop filters and large blurred layers.
- Use `requestAnimationFrame` for pointer and scroll updates.
- Pause offscreen loops and hidden-tab animation.

### Asset budget

- provide AVIF/WebP and responsive `srcset` for imagery;
- poster frames for video;
- preload only critical hero assets;
- lazy-load below-fold media;
- cap canvas/WebGL DPR on mobile;
- decode images before a scroll sequence needs them;
- compress image sequences and provide mobile alternatives;
- avoid autoplay audio;
- reserve layout dimensions to prevent shifts.

### DOM budget

- do not split paragraphs into spans;
- keep decorative particles limited;
- virtualize long galleries when necessary;
- use `content-visibility: auto` below the fold;
- destroy ScrollTriggers, observers, and listeners on route unmount.

## Accessibility implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
  }

  [data-parallax], [data-scrub], [data-kinetic-type] {
    transform: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: rgb(22 24 30 / .97);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .glass {
    background: rgb(12 14 18 / .98);
    border-color: rgb(255 255 255 / .72);
  }
}
```

Also enforce:

- logical DOM order matches visual reading order;
- focus never disappears inside pinned or transformed sections;
- scroll locking is limited to modal states and reversible;
- controls remain at least comfortably tappable;
- decorative duplicate text is `aria-hidden`;
- canvas/WebGL content has equivalent text and controls;
- contrast is tested over the busiest glass background state.

## Conversion-first rules

Immersion must not obscure the business outcome.

- Primary CTA is visible or discoverable without completing the full scroll narrative.
- Header chrome does not consume excessive mobile height.
- Hero copy is readable on first paint.
- Carousels do not hide essential proof exclusively after several swipes.
- Motion does not delay forms, booking, checkout, or contact actions.
- Repeated CTAs use consistent labels and destinations.
- Trust, proof, pricing, and action remain semantically clear without animation.

## Visual QA loop

Perform this loop until acceptance:

1. render at desktop, tablet, and mobile widths;
2. capture top, mid-scroll, carousel, overlay, and final CTA states;
3. inspect typography, clipping, stacking, focus, contrast, and empty states;
4. record motion at normal speed and slow playback when possible;
5. test fast scroll, reverse scroll, resize, orientation change, and route transition interruption;
6. test reduced motion, reduced transparency, contrast mode, keyboard, and touch;
7. inspect performance traces for long tasks and paint-heavy effects;
8. revise;
9. compare screenshots against reference and previous pass;
10. publish a change report and acceptance matrix.

## Screenshot requirements

A completed immersive build should capture at least:

- desktop hero;
- desktop mid-scroll narrative;
- carousel active state;
- glass navigation/overlay over busy content;
- kinetic typography/depth section;
- mobile hero;
- mobile interaction alternative;
- reduced-motion or solid-material fallback when relevant.

Images in the report must explain what changed, not function as decoration.

## Audit rubric

Score each 0–5.

| Area | 0 | 5 |
| --- | --- | --- |
| Purpose | effects have no job | every effect supports narrative/action |
| Directness | delayed, locked, jumpy | instant, interruptible, velocity-aware |
| Scroll | generic reveals or hijacking | paced, anchored, reversible, responsive |
| Carousel | inaccessible or brittle | physical, controlled, keyboard/touch complete |
| Typography | generic and static | optical, fluid, hierarchical, legible |
| Depth | random shadow/blur | coherent light, elevation, adaptive separation |
| Glass | fake blur everywhere | restrained functional layer with fallbacks |
| Accessibility | motion-only experience | complete parallel experience |
| Performance | jank and oversized media | tested budgets and device degradation |
| Conversion | spectacle blocks action | immersion strengthens action and trust |

Anything below 4 in accessibility, performance, directness, or conversion blocks completion.

## Acceptance tests

### Functional

- all links, buttons, forms, carousel controls, and route changes work;
- drag and scroll interactions remain interruptible;
- resize/reflow does not orphan pinned sections;
- no invisible content remains after script failure;
- no console errors from observers or animation teardown.

### Visual

- no clipped display type at target breakpoints;
- no glass-on-glass hierarchy collapse;
- no flat gray copy over dynamic glass;
- shadows follow one light direction;
- sticky and pinned elements release at correct boundaries;
- carousel shows a clear active state and next-action cue.

### Accessibility

- keyboard can reach and operate every control;
- focus ring remains visible;
- reduced motion removes spatial movement;
- reduced transparency produces legible solid surfaces;
- screen-reader order matches the narrative;
- autoplay can stop and does not include audio by default.

### Performance

- continuous motion avoids layout thrashing;
- large filters and canvas scenes degrade on mobile;
- offscreen loops pause;
- media loading does not block first action;
- animation instances and listeners are cleaned up.

## Failure patterns to reject

- “Apple style” reduced to white cards, blur, and large type;
- glass on every section and card;
- smooth-scroll library installed without need;
- scroll-jacking or hidden scrollbars;
- 3D/WebGL added to a simple service page;
- large hero text with no readable value proposition;
- every section pinned;
- carousel autoplay without controls;
- split-text animation on paragraphs;
- excessive blur, glow, and neon that flatten hierarchy;
- hover-only functionality;
- mobile receiving the same pinned sequence at half scale;
- claiming 60fps, accessibility, or screenshot QA without testing.

## Final report template

```markdown
# Immersive UI Upgrade Report

## Executive summary
## Source/repository baseline
## What was preserved
## Problems found
## Systems added
### Scroll
### Carousel
### Motion and transitions
### Typography
### Shading and depth
### Liquid Glass-inspired materials
### Accessibility
### Performance
## Desktop proof
![caption](path)
## Mobile proof
![caption](path)
## Before / after decision table
## Files changed
## Test matrix
## Known limitations
## Source attribution
```

## Compact execution prompt

Use this when handing the skill to another agent:

```text
Apply the SpaceAge Apple-Immersive Web Design skill to this project. Audit the existing interface and assets first. Preserve all locked brand elements. Build the smallest effective immersion system using native browser features first, then GSAP ScrollTrigger for complex pinned/scrubbed scroll, Motion for interruptible springs and gestures, and Embla for advanced carousels. Add current fluid typography, coherent layered shading, and Liquid Glass-inspired functional chrome without putting glass throughout the content layer. Create desktop/mobile/reduced-motion alternatives, enforce performance budgets, render screenshots, revise visible failures, and deliver a detailed change report with evidence and an acceptance matrix. Do not stop at recommendations.
```
