---
name: spaceage-apple-immersive-web-design
description: >-
  Build, redesign, or audit premium web interfaces with Apple-grade fluidity using current
  immersive-web technique. Covers scroll storytelling, pinned and scrubbed sequences, GSAP
  ScrollTrigger/SplitText/Flip/Draggable+Inertia/Observer, CSS scroll-driven animations,
  scroll-state chrome, momentum carousels, spring and inertia gestures, same- and
  cross-document view transitions, kinetic typography with variable-font axes and
  text-box-trim, layered shading, Liquid Glass-inspired functional chrome with refraction,
  responsive motion systems, accessibility parallel design, performance budgets, and a
  browser-driven verification harness that proves the build works before handover. Use for
  cinematic, editorial, luxury, or flagship sites and for diagnosing jank, weak transitions,
  generic typography, fake glass, or inaccessible motion. Do not use to copy Apple branding
  or reproduce an Apple page pixel-for-pixel.
license: MIT
---

# SpaceAge Apple-Immersive Web Design

**Version:** 2.0.0
**Type:** reusable cross-LLM design-engineering skill
**Lineage:** expanded from Emil Kowalski's MIT-licensed `apple-design` skill (preserved in
`source-baseline/`), rebuilt in v2 around a runnable pattern lab and a verification harness.

## Mission

Create web experiences that feel physically coherent, immediate, cinematic and premium
without turning the interface into a motion demo. Motion, typography, glass, depth and
scroll are functional systems: they must improve hierarchy, comprehension, navigation or
conversion.

**What makes v2 different from a design document:** every technique this skill prescribes
exists as running code in `lab/`, and every claim it makes about that code is asserted by
`scripts/verify.mjs` against a real browser. When you apply this skill, you are expected to
produce the same kind of evidence.

## Activation

Invoke when the user asks to:

- build or redesign a premium, Apple-like, cinematic, editorial, luxury or immersive site;
- add advanced scroll, carousel, transition, typography, depth, glass or gesture systems;
- review a UI for fluidity, motion quality, hierarchy or conversion impact;
- convert a static design, screenshot, Figma file or existing site into a polished build;
- create a reusable motion system or design-engineering standard;
- diagnose jank, weak transitions, generic typography, fake glass, flat shading or
  inaccessible motion;
- produce a coded prototype plus screenshots and a change report.

Do not activate solely because a project uses rounded corners, blur or a dark theme.

## Source integrity and naming

- Preserve the MIT attribution in derivative packages (`LICENSE`, `NOTICE.md`).
- Describe the approach as **Apple-inspired fluid interaction** or **Liquid Glass-inspired
  web material** — never as an official Apple implementation.
- Do not copy Apple logos, proprietary assets, product photography, page layouts or brand
  language.
- Use the principles: hierarchy, fluidity, restraint, direct manipulation, adaptivity,
  content-first design.

---

# Part 1 — Operating mode

## Never stop at recommendations

For any codebase or build request, complete the whole chain:

1. inspect the current interface and available assets;
2. identify the experience goal and the conversion goal;
3. select the smallest viable interaction stack;
4. implement it;
5. **render it in a real browser**;
6. **assert its behaviour, not its existence**;
7. capture desktop, mobile and reduced-motion screenshots;
8. fix what the assertions and screenshots expose;
9. deliver a change report, acceptance matrix and file manifest.

If the environment genuinely cannot render, say so plainly and hand over the exact commands
that would. Never describe visual QA that did not happen.

## The verification contract

This is the part most motion work skips, and it is why so much of it ships broken.

**A screenshot of a page that never signalled readiness proves nothing.** Implement this
four-part contract on anything you build (reference implementation: `lab/js/boot.js`):

| Hook | Purpose |
| --- | --- |
| `window.__ready === true` | set only after deps load, fonts settle, layout completes and ScrollTrigger refreshes |
| `window.__lab` (or `__app`) | live handles — timelines, carousel API, split instances — so tests assert against real objects |
| `?jump=<px>` | land pre-scrolled at an exact offset, with scrubbed timelines caught up |
| `?motion=off` | exercise the reduced-motion branch without OS emulation |

Two details that make or break it:

- **Wait for scrubs to settle.** A scrubbed timeline deliberately lags its trigger — that
  lag is the weight you feel. After a programmatic jump the playhead is still travelling, so
  anything measured immediately is a frame of the transition, not the state. Poll until every
  scrubbed animation's `progress()` matches its trigger's `progress` (`scrubsSettled()` in
  `boot.js`).
- **Publish late values on the global directly.** `ready(handles)` copies the handles object
  once; anything assigned to that local object afterwards never appears. Write
  `window.__lab.flip = …` for values created later.

**What counts as proof.** Assert measured values, not the presence of code:

| Weak claim | Assertion that earns it |
| --- | --- |
| "the hero pins" | computed `position` is `fixed` inside the range and not after it |
| "the scrub is smooth" | `clip-path` inset decreases monotonically across four scroll offsets |
| "the carousel has momentum" | element `x` continues to change after `pointerup` |
| "text stays accessible" | `aria-label` still equals the original sentence after splitting |
| "reduced motion is handled" | pin absent, marquee `x` stable, content opacity ≥ 0.95 |
| "glass falls back" | `backdrop-filter` computes to `none` under emulated reduced transparency |
| "it hits 60fps" | measured median frame interval, on named hardware, with the number quoted |

`scripts/verify.mjs` is a working implementation of all of the above — 100 assertions across
seven pages. Copy its structure into the project you are building.

## Evidence before invention

Lock these before changing a real project:

- existing layout and route structure;
- brand colours, typography, logos, imagery, copy;
- user-provided references and the exact elements that must not change;
- framework, package manager, browser support, deployment target;
- performance constraints and mobile priority;
- the interaction purpose of every proposed effect.

Never replace user assets, faces, logos, products, architecture, copy or brand elements
unless explicitly instructed. Record findings as an evidence table separating **observed**
from **inferred**:

| Finding | Evidence | Impact | Keep / revise / remove |
| --- | --- | --- | --- |
| Hero uses autoplay video | `src/components/Hero.tsx:24` | strong atmosphere, weak text contrast | revise |
| Carousel is hand-rolled | `src/ui/Slider.tsx` | drag bugs, no keyboard model | replace |
| Glass on every card | `styles/cards.css:12` | hierarchy collapse | remove from content layer |

## Output contract

A full execution returns or creates:

1. **Experience brief** — audience, emotion, conversion action, content priority.
2. **Observed baseline** — what exists, what works, what fails.
3. **Immersion map** — section-by-section visual and interaction purpose.
4. **Stack decision** — native CSS, GSAP, Motion, Embla, View Transitions, WebGL, or none.
5. **Motion tokens** — timing, easing, spring, depth, blur, shadow, reduced-motion rules.
6. **Implementation** — code or exact patches.
7. **Responsive degradation plan** — desktop, tablet, mobile, reduced motion, reduced
   transparency, increased contrast.
8. **Performance plan** — animation, asset and DOM budgets.
9. **Rendered proof** — screenshots at desktop, mobile and reduced motion.
10. **Verification report** — assertions run, results, measured frame pacing, known limits.

---

# Part 2 — Design laws

### 1. Directness before spectacle

- Feedback begins on pointer-down.
- Dragged content tracks 1:1 after a small intent threshold.
- Interactive motion is interruptible and reversible.
- New motion starts from the live presentation value.
- Velocity carries into spring or inertia motion.
- Boundaries resist progressively instead of hard-stopping.

### 2. Spatial continuity

- Enter and exit share one origin and one path.
- Popovers, menus, sheets and expanded cards originate from their trigger.
- Shared elements keep their identity across view changes.
- A scroll sequence preserves orientation; never rotate the mental model without an anchor.

### 3. Content remains primary

- Immersion supports a narrative or an action.
- The hero communicates the offer before the first decorative sequence completes.
- Scroll effects never hide required copy or controls.
- Glass belongs to functional chrome: navigation, controls, compact overlays, transient
  layers. Not to the content layer.

### 4. Restraint compounds quality

- One major motion idea per viewport.
- One dominant depth language per page.
- One carousel behaviour per carousel.
- One type animation idea per heading group.
- Never combine parallax, wobble, blur, rotation, scale, split text and particles on one
  element.

### 5. Accessibility is a parallel design

- Reduced motion gets a coherent static or cross-faded composition — not a broken one.
- Reduced transparency gets solid surfaces.
- Increased contrast gets explicit borders and higher-contrast text.
- Keyboard, focus, screen-reader order and pointer interaction stay complete.

---

# Part 3 — Routing

## Immersion tiers

| Tier | Use | Typical systems |
| --- | --- | --- |
| Light | service and utility sites | reveal, hover, active feedback, simple shared transitions |
| Standard | premium SMB and product pages | hero motion, sticky narrative, one carousel, layered depth |
| Premium | fashion, nightlife, creative, flagship launches | pinned sequence, kinetic type, advanced carousel, glass chrome |
| Flagship | experience-led launch or portfolio | scene-based scroll, media scrubbing, optional WebGL, extensive QA |

Do not default every project to flagship.

## Stack router

Use the smallest reliable tool. Escalate only when the row's condition is actually met.

| Requirement | First choice | Escalate when |
| --- | --- | --- |
| reveal on entry | `animation-timeline: view()` | precise pinning or wide legacy support needed |
| scroll progress bar / rail | `animation-timeline: scroll()` | never — this is the whole feature |
| sticky element that restyles when stuck | `@container scroll-state(stuck: top)` | engine lacks it → IntersectionObserver sentinel |
| pinned narrative, scrub, horizontal scene | GSAP ScrollTrigger | — |
| triggers on horizontally-moving content | ScrollTrigger `containerAnimation` | — |
| shared-element layout change | GSAP Flip | crossing documents → View Transitions |
| same-document state transition | `document.startViewTransition` | complex sequencing → Flip |
| cross-document continuity | `@view-transition { navigation: auto }` | framework routing requires JS |
| text splitting | SplitText with `mask` + `autoSplit` | short display text only |
| accessible momentum carousel | Embla | native scroll snap is insufficient |
| simple gallery | CSS scroll snap | momentum, loop, progress transforms, API control needed |
| free drag with throw | Draggable + InertiaPlugin | — |
| unified wheel/touch/pointer input | GSAP Observer | — |
| animating to `height: auto` | `interpolate-size: allow-keywords` | engine lacks it → instant open |
| menu anchored to its trigger | Popover API + anchor positioning | engine lacks it → measured fallback |
| animatable gradient / axis values | `@property` registered properties | — |
| smooth scroll | native | documented reason only → Lenis, never scroll-jacking |
| true 3D product content | Three.js/WebGL | never for a decorative background alone |

**GSAP is fully free as of 3.13** (Webflow's licence change) — SplitText, MorphSVG, DrawSVG,
ScrollSmoother, Inertia and the rest ship in the standard package. There is no longer a
commercial reason to hand-roll these. There is still a *restraint* reason.

**Native-first primitives to reach for first:** CSS scroll snap, sticky positioning, scroll
and view timelines, `scroll-state()` container queries, View Transitions, `@starting-style`,
`interpolate-size` / `calc-size()`, anchor positioning, Popover API, `clamp()`,
`text-wrap: balance|pretty`, `text-box-trim`, `font-optical-sizing`, `color-mix()`, OKLCH,
`backdrop-filter`, container queries, `content-visibility`.

---

# Part 4 — The systems

Each system below is summarised here and implemented in full, with commentary, in `lab/`.
The deep references carry the production code and the failure modes.

| System | Reference | Running implementation |
| --- | --- | --- |
| Scroll architectures | `references/scroll-systems.md` | `lab/scroll.html` |
| GSAP technique | `references/gsap-elite.md` | all lab pages |
| Kinetic typography | `references/typography-kinetic.md` | `lab/type.html` |
| Material and depth | `references/material-depth.md` | `lab/material.html` |
| Carousels and gestures | `references/carousels-gestures.md` | `lab/carousel.html` |
| Transitions and continuity | `references/transitions-continuity.md` | `lab/transitions.html` |
| Performance and accessibility | `references/performance-accessibility.md` | `scripts/verify.mjs` |
| Failure catalogue | `references/pitfalls.md` | — |

## Motion tokens

Copy `lab/css/tokens.css` into the project. It is the portable half of this skill: registered
`@property` values, four durations, four easing curves (including a real spring expressed as
`linear()`), a fluid type scale with size-specific tracking, an OKLCH ramp, single-light
elevation, the glass material with three fallback tiers, and the accessibility parallel
design.

Four durations and four curves. If a component needs a fifth, the component is wrong.

## Scroll — the short version

- **Reveal:** `animation-timeline: view()` with an `animation-range`. Apply the hidden state
  only after confirming a mechanism exists, so a script failure can never leave the page
  blank.
- **Sticky narrative:** one anchored visual, three advancing states, each changing one
  property group. Release the moment the story ends.
- **Pinned scrub:** `ease: 'none'` inside a scrub (the scroll *is* the easing), function-based
  end values plus `invalidateOnRefresh`, `anticipatePin: 1`, and `gsap.matchMedia()` so the
  pin does not exist at all on phones.
- **Horizontal run:** `containerAnimation` for any trigger on a horizontally-moving element,
  or every card fires at once.
- **Media scrub:** decode to `ImageBitmap` ahead of time, map progress → frame index, paint
  inside one `requestAnimationFrame`, never from the scroll event.
- **Velocity accents:** `gsap.quickTo` fed by `ScrollTrigger.getVelocity()`, clamped, on
  decorative layers only — **and a debounced return to rest**, or the accent stays applied
  forever after scrolling stops.

## Typography — the short version

Four motion tiers, and a rule about which text may use each:

1. **Block** — body copy and utility headings.
2. **Line** — editorial headings. `SplitText.create(el, { type:'lines', mask:'lines',
   autoSplit:true, onSplit })`. Return the tween from `onSplit` so GSAP kills it before
   re-splitting.
3. **Word** — short campaign statements only.
4. **Character** — one logotype or hero phrase. Never a sentence.

Keep the accessible sentence (`aria: 'auto'` writes `aria-label` and hides fragments).
Register `--wght` as `<number>` to animate a variable axis on scroll without reflow. Use
`text-box-trim: trim-both; text-box-edge: cap alphabetic` for optical vertical centring —
measured 35px → 22px box height on the same heading in the lab.

## Material — the short version

Four layers, in order: tint fill → specular top edge → sheen sweep → refraction rim. Then:

- glass on chrome, never stacked on glass (both layers sample a translucent backdrop and
  neither reads as a surface);
- material weight scales with surface size (blur 10 → 20 → 34 across small → large);
- `backdrop-filter: blur() url(#displacement)` is the honest approximation of lensing —
  **feature-probe it**, apply it by class not inline style, and keep it on small chrome;
- three fallback tiers: reduced transparency → opaque; increased contrast → opaque plus
  explicit border; no `backdrop-filter` support → opaque surface, same hierarchy;
- glass *materialises* — opacity, transform and filter travel together via `@starting-style`
  plus `transition-behavior: allow-discrete`.

## Carousel — the short version

Embla for physics; treatment as a pure function of progress. Measure slide geometry **once**
(and on `reInit`), then do arithmetic per frame — never `getBoundingClientRect()` in the
scroll path. Do not drive the treatment off `scrollSnapList()` indices: with
`containScroll: 'trimSnaps'` the outer snaps bunch at both ends and the centre treatment
collapses there.

Keyboard parity is not optional; autoplay is off by default; reduced motion sets
`duration: 0` and `inertia: false` — the carousel still advances.

## Transitions — the short version

- **Flip** for shared elements inside one document: measure, move the *same node*, animate
  the difference. Leave a placeholder so the grid does not collapse.
- **`startViewTransition`** for state changes, with stable `view-transition-name` per row so
  survivors are moved rather than re-created. Always call the same render function when the
  API is missing.
- **`@view-transition { navigation: auto }`** on both documents plus a matching
  `view-transition-name` turns a plain link into a morph — no router. Prove it ran by reading
  `event.viewTransition` inside `pagereveal` on the destination.

---

# Part 5 — Constraints

## Responsive degradation matrix

| System | Desktop | Tablet | Mobile | Reduced motion |
| --- | --- | --- | --- | --- |
| pinned scroll | full sequence | shorter pin | **no pin — recomposed static scene** | static states |
| parallax | 3–6% | 1–3% | none or 1% | none |
| horizontal scene | vertical→horizontal | native swipe | native swipe | no auto movement |
| liquid glass | regular/clear | fewer layers | stronger fill, lower blur | solid/near-solid |
| refraction rim | small chrome only | small chrome only | omit | omit |
| kinetic type | line/word motion | line motion | block reveal | cross-fade |
| carousel | drag + controls | drag + controls | swipe + controls | duration 0 |
| smooth scroll | optional, justified | optional | usually off | never instantiated |
| WebGL | full quality | reduced DPR | poster or light scene | static poster |

Mobile is not a scaled desktop animation. Recompose it — and assert that the pin genuinely
does not exist at phone widths.

## Performance budgets

- Continuous effects animate `transform` and `opacity`.
- Do not animate layout properties continuously.
- Do not animate inherited custom properties on a large ancestor every frame.
- Apply `will-change` shortly before motion; remove it after.
- Avoid nested backdrop filters and large blurred layers.
- Use `requestAnimationFrame` for pointer and scroll updates; batch reads before writes.
- Pause offscreen loops and hidden-tab animation.
- Destroy ScrollTriggers, observers and listeners on unmount (`gsap.context()` / matchMedia
  contexts revert automatically).
- Provide AVIF/WebP with responsive `srcset`; preload only critical hero assets; reserve
  layout dimensions.
- Use `content-visibility: auto` below the fold. Never split paragraphs into spans.

**Measured on the harness machine** (headless Chromium 141, software rasterisation, no GPU),
recorded in `proof/verification.json`:

| Measurement | Result |
| --- | --- |
| full scroll-through of `scroll.html` | median frame interval 16.7ms, p95 16.8ms |
| long tasks while scrolling | 0 |
| `material.html` with refraction rim on chrome | ~52ms median frame |
| same page with the rim removed | ~51ms median frame |
| earlier build, rim on a viewport-sized panel | ~67ms vs ~50ms — 1.3× |

The lesson is in the last two rows: displacement refraction is cheap on small chrome and
expensive on large surfaces. Absolute numbers from a software-rasterised container say
nothing about a phone — quote your own hardware, always.

## Accessibility implementation

Ship the parallel designs in `tokens.css`: `prefers-reduced-motion`,
`prefers-reduced-transparency`, `prefers-contrast`. Then enforce:

- logical DOM order matches visual reading order;
- focus never disappears inside pinned or transformed sections;
- scroll locking is limited to modal states and is reversible;
- decorative duplicate text is `aria-hidden`;
- canvas/WebGL content has an equivalent text or control path;
- contrast is tested over the *busiest* glass background state, not a flat one.

Emulate the queries in the harness — Playwright covers reduced motion directly, and CDP
`Emulation.setEmulatedMedia` covers `prefers-reduced-transparency` and `prefers-contrast`.

## Conversion rules

- The primary CTA is reachable without completing the scroll narrative.
- Header chrome does not eat mobile height.
- Hero copy is readable on first paint.
- Carousels do not hide essential proof behind several swipes.
- Motion never delays forms, booking, checkout or contact.
- Repeated CTAs use consistent labels and destinations.

---

# Part 6 — Judgement

## Failure patterns to reject

Design-level:

- "Apple style" reduced to white cards, blur and large type;
- glass on every section and card, or glass stacked on glass;
- a smooth-scroll library installed without a documented reason;
- scroll-jacking, hidden scrollbars, or pinning every section;
- 3D/WebGL on a simple service page;
- large hero type with no readable value proposition;
- split-text animation on paragraphs;
- carousel autoplay without controls;
- hover-only functionality;
- mobile receiving the desktop pin sequence at half scale.

Implementation-level (each of these was hit and fixed while building this skill — see
`references/pitfalls.md`):

- a velocity accent with no return-to-rest, leaving elements permanently skewed;
- inline styles applied by JS that silently defeat the accessibility fallback CSS;
- an explicit `inset` on an anchor-positioned popover, cancelling `position-area`;
- carousel treatments driven by snap indices, which bunch under `trimSnaps`;
- handles assigned after the ready-copy, so tests read `undefined`;
- screenshots taken before scrubbed timelines have caught up.

And always: claiming 60fps, accessibility or screenshot QA without testing.

## Audit rubric

Score each 0–5.

| Area | 0 | 5 |
| --- | --- | --- |
| Purpose | effects have no job | every effect supports narrative or action |
| Directness | delayed, locked, jumpy | instant, interruptible, velocity-aware |
| Scroll | generic reveals or hijacking | paced, anchored, reversible, responsive |
| Carousel | inaccessible or brittle | physical, controlled, keyboard/touch complete |
| Typography | generic and static | optical, fluid, hierarchical, legible |
| Depth | random shadow and blur | coherent light, elevation, adaptive separation |
| Glass | fake blur everywhere | restrained functional layer with real fallbacks |
| Accessibility | motion-only experience | complete parallel experience |
| Performance | jank and oversized media | measured budgets and device degradation |
| Verification | claims | assertions with values |
| Conversion | spectacle blocks action | immersion strengthens action and trust |

Anything below 4 in accessibility, performance, directness, verification or conversion blocks
completion.

## Acceptance tests

**Functional** — links, buttons, forms, carousel controls and route changes work; drag and
scroll stay interruptible; resize does not orphan pinned sections; no invisible content after
script failure; no console errors from observers or teardown.

**Visual** — no clipped display type at target breakpoints; no glass-on-glass collapse; no
flat grey copy over dynamic glass; shadows follow one light direction; sticky and pinned
elements release at the right boundary; the carousel shows a clear active state.

**Accessibility** — keyboard reaches and operates everything; focus ring visible; reduced
motion removes spatial movement while keeping content visible; reduced transparency produces
legible solid surfaces; screen-reader order matches the narrative; autoplay stops and carries
no audio.

**Performance** — continuous motion avoids layout thrashing; large filters and canvas scenes
degrade on mobile; offscreen loops pause; media loading does not block first action;
animation instances and listeners are cleaned up.

---

# Part 7 — Running the lab

```bash
cd skills/spaceage-apple-immersive-web-design
npm run setup      # vendor GSAP 3.13, Embla, Lenis into lab/vendor/ (offline-capable)
npm run serve      # http://localhost:4173 — browse every pattern
npm run verify     # 100 behavioural assertions → proof/verification.json
npm run capture    # 24 screenshots → proof/shots/
npm run proof      # setup + verify + capture
```

`lab/vendor/` and `node_modules/` are gitignored: third-party builds are fetched from npm
under their own licences rather than redistributed here. Every lab page also carries a CDN
fallback, so the pages run before `setup` if you are online.

## Final report template

```markdown
# Immersive UI Upgrade Report

## Executive summary
## Repository baseline
## What was preserved
## Problems found (evidence table)
## Systems added
### Scroll · Carousel · Motion · Typography · Depth · Material · Accessibility · Performance
## Verification
| Assertion | Method | Result |
## Desktop proof
## Mobile proof
## Reduced-motion / reduced-transparency proof
## Measured performance (state the hardware)
## Before / after decision table
## Files changed
## Known limitations
## Source attribution
```

## Compact execution prompt

```text
Apply the SpaceAge Apple-Immersive Web Design skill to this project. Audit the existing
interface and assets first and preserve every locked brand element. Build the smallest
effective immersion system: native browser features first (view/scroll timelines,
scroll-state, view transitions, @starting-style, interpolate-size, anchor positioning,
@property), then GSAP ScrollTrigger for pinned and scrubbed scroll, SplitText for line-level
type, Flip for shared elements, Draggable+Inertia for physical drag, and Embla for carousels.
Use the token system in lab/css/tokens.css. Recompose mobile rather than scaling the desktop
sequence, and ship the reduced-motion, reduced-transparency and increased-contrast parallel
designs. Then implement the verification contract (__ready, __lab, ?jump, ?motion=off), write
assertions that read measured values out of a real browser, capture desktop/mobile/
reduced-motion screenshots, fix what they expose, and deliver a change report with the
assertion results and the hardware your performance numbers came from. Do not stop at
recommendations, and do not claim any QA you did not run.
```
