# Reference Site Mining: fame-estate.com (Dubai luxury real estate)

> Source: live snapshot of `https://fame-estate.com/` (Nuxt.js + Lenis + Swiper site, "Real estate agency in Dubai"). Mined for both (a) reusable smooth-scroll/sticky/parallax patterns and (b) as a structural/visual build-reference for premium real-estate or luxury-brand sites.

## Stack identified

- **Framework**: Nuxt.js (`data-capo=""` head-ordering attribute, `data-v-*` scoped-style hashes, `_nuxt/` asset paths)
- **Smooth scroll**: Lenis (`<html class="lenis">`, `.lenis-smooth`, `.lenis-stopped`, `.lenis-scrolling`, `[data-lenis-prevent]`) — **no GSAP found** (zero matches for gsap/ScrollTrigger in the snapshot). All scroll-driven motion is handled via Lenis + custom Vue/Nuxt directives and CSS custom properties, not GSAP.
- **Carousel**: Swiper.js (`--swiper-theme-color`, `data-swiper-slide-index`, `data-slide-idx`)
- **Fonts**: self-hosted via `@font-face` — HelveticaNeue (weights 500/700), HelveticaNeueLTW (weight 750, condensed display cut), TimesNewRoman. All `font-display: swap`, served as `.ttf` from `/_nuxt/`.

## Design tokens (extracted from `:root`)

```css
:root {
  /* colors */
  --c-black: #000;
  --c-white: #fff;
  --c-red: #7a0c07;       /* deep brand accent — used sparingly */
  --c-gray: #f1f1f1;
  --c-haki: #7a7a7a;
  --c-black--10: rgba(0,0,0,.1);

  /* typography */
  --font-helvetica: "HelveticaNeue";
  --font-helvetica-ltw: "HelveticaNeueLTW";  /* display/headline cut, weight 750 */
  --font-times: "TimesNewRoman";              /* serif accent for editorial copy */

  /* easing — reusable cubic-bezier set */
  --default-ease:  cubic-bezier(.24,1,.36,1);
  --in-out-quint:  cubic-bezier(.83,0,.17,1);
  --out-quint:     cubic-bezier(.22,1,.36,1);
  --out-expo:      cubic-bezier(.16,1,.3,1);

  /* fluid scaling base */
  --viewport: 1440;   /* desktop; swapped to 375 on mobile breakpoint */
}
```

Example display type usage: `.d1 { font-family: var(--font-helvetica-ltw); font-size: 9rem; font-weight: 750; }`

## Fluid type/spacing scaling pattern (no `clamp()` — viewport-ratio calc instead)

The site does **not** use CSS `clamp()`. Instead it scales every size token against a `--viewport` custom property (the design's base artboard width), producing a pure-vw fluid scale that's swapped at the mobile breakpoint:

```css
:root            { --viewport: 1440; }   /* desktop artboard width */
@media (max-width: 768px) {
  :root          { --viewport: 375; }    /* mobile artboard width */
}

/* any design-spec pixel value `N` becomes: */
.el { font-size: calc(N / var(--viewport) * 100vw); }
/* e.g. a 16px spec value -> calc(16/var(--viewport)*100vw) */
```

This is a clean, reusable pattern for porting Figma/design-spec pixel values directly into fluid CSS without manually computing `clamp()` min/max pairs — useful any time a design system gives you fixed artboard dimensions.

## Transitions — consistent custom-ease usage

All hover/interaction transitions reuse the same small set of named eases rather than ad-hoc bezier values:

```css
transition: all .65s var(--out-expo);          /* large reveal/hero transitions */
transition: transform .4s var(--out-expo);     /* hover scale/translate on cards, buttons */
transition: transform .3s var(--in-out-quint); /* nav, menu, smaller UI moves */
transition: color .3s var(--in-out-quint);
transition: fill .3s var(--in-out-quint);
```

Pattern worth copying: define 3–4 named eases once as custom properties, then reference them everywhere — keeps motion feel consistent across a whole site without GSAP.

## Scroll-orchestration data-attributes (Lenis-driven, framework-level — not GSAP)

The site drives section-level scroll behavior with custom `data-*` attributes consumed by Nuxt/Vue composables (presumably watching Lenis scroll progress), rather than ScrollTrigger:

| attribute | observed values | purpose (inferred) |
|---|---|---|
| `data-scroll-section` | `introduction`, `about`, `cases`, `services`, `partnership`, `team`, `contact` | names a section for scroll-spy / nav-highlight / anchor-jump logic |
| `data-scroll-section-mob` | (mobile mirror) | same, mobile-specific section map |
| `data-start-trigger` | `"top -165%"`, `"top center"` | ScrollTrigger-style trigger strings — defines when a section's pinned/dark-mode state activates relative to viewport, fed into a custom Lenis-progress watcher |
| `data-dark-screen` | boolean flag | toggles a dark color-scheme overlay while a section is in view |
| `data-hide-hero` | boolean flag | hides/collapses the sticky hero once scrolled past |
| `data-anchor-num` | `"[ 1 ]"` … `"[ 7 ]"` | numbered nav menu items, paired with section names |
| `data-form-anchor` | boolean flag | marks the CTA button that scrolls to the contact form |
| `data-case-id` | `1`, `2`, … | indexes case-study/portfolio article cards |

**Reusable takeaway**: `data-start-trigger="top -165%"` mirrors GSAP ScrollTrigger's trigger-string syntax (`"top -165%"`, `"top center"`) — confirms this is a deliberate, portable convention for describing scroll-trigger points whether you're driving them with ScrollTrigger or a hand-rolled Lenis progress watcher. Safe to lift this string format directly into ScrollTrigger configs (`start: "top -165%"`).

## Sticky / parallax structural classes

```
wrap-sticky               — outer pinned-section wrapper
sticky-plash              — full-bleed pinned "splash" panel (used for the dark intro reveal)
cases-sticky              — pinned case-study/portfolio rail
sticky-content            — inner content layer that stays fixed while bg scrolls
sticky                    — generic pin wrapper (used on .hero)
image-sticky              — pinned background image layer
parallax-wrapper          — parallax container (background moves slower than content)
contact-reveal-pause      — scroll-pause class applied while the contact reveal animation plays
```

Hero section uses an inline custom property to control parallax intensity per-section:

```html
<section class="hero" style="--speed-factor: 3;">
  <div class="sticky">
    <div data-hide-hero class="bg-image side-overlay"
         style="--bg-image: url(https://cdn.fame-estate.com/home_....webp)"></div>
  </div>
</section>
```

`--speed-factor` is a clean, reusable convention: expose parallax speed as a CSS custom property set inline per-instance, then read it in JS (`getComputedStyle(el).getPropertyValue('--speed-factor')`) to drive a Lenis-scroll-synced `translateY` — avoids hardcoding speed values in JS and lets each section tune its own parallax depth declaratively in markup.

`.side-overlay` gradient-fade trick (directional vignette over a hero image, pure CSS, no JS):
```css
.side-overlay::after {
  content: "";
  position: absolute; top: 0; right: 0;
  height: 100%; width: 35.5rem;
  background: linear-gradient(270deg, rgba(0,0,0,.3), transparent);
  pointer-events: none;
  z-index: 1;
}
```

## Page/section structure (homepage, in order)

1. **hero** — full-bleed pinned background image (`.sticky`, `--speed-factor: 3`), side-overlay vignette, big display headline ("Fame Real Estate — where lifestyle becomes legacy")
2. **introduction / wrap-sticky about-section** — `sticky-plash` dark-mode reveal panel, triggers at `top -165%`; manifesto copy ("We sell real estate that evokes emotions...")
3. **stats** — numeric proof-points block
4. **mobile-cases** — mobile-only condensed case rail (separate from desktop `cases-sticky`)
5. **our-services / why-choose** — value-prop grid sections
6. **ticker** — horizontally scrolling marquee strip (likely CSS keyframe or JS-driven infinite scroll, common on luxury sites for client-logo or keyword strips)
7. **investment-funds** — secondary offering block
8. **team-slider** — Swiper carousel of team members
9. **contact** — lead-capture form, gated by `contact-reveal-pause` (scroll locks while reveal animation completes)
10. **locations** — map/area listing, `--mob-location-sticky-top` custom property for mobile sticky offset

Nav menu mirrors this with 7 numbered anchors: `[1] introduction · [2] About · [3] cases · [4] services · [5] partnership · [6] team · [7] contact`.

## Copy/voice reference (luxury real estate tone)

- Headline register: short, emotionally-loaded, lifestyle-first — *"where lifestyle becomes legacy"*
- Body register: confident, sensory, outcome-framed — *"We sell real estate that evokes emotions. We give a new sense of self."*
- Positioning line: *"Exclusive real estate agency specializing in luxury residential and commercial properties — seamlessly connecting buyers and sellers with premier investments tailored to elegance, comfort, and success."*

Useful as a tone calibration reference for any luxury-vertical (real estate, hospitality, high-end retail) copy: short declarative hooks, sensory verbs ("evokes", "legacy", "elegance"), buyer-as-protagonist framing.

## How to reuse this for a build

- **Eases**: lift the 4-ease custom-property set (`--default-ease`, `--in-out-quint`, `--out-quint`, `--out-expo`) directly — they map cleanly onto GSAP `ease:` strings via `CustomEase` or as raw cubic-bezier strings for Framer Motion `transition.ease`.
- **Fluid scale**: prefer the `--viewport` ratio-calc convention over `clamp()` when porting fixed-width design specs — fewer magic numbers, scales proportionally to a known artboard.
- **Scroll triggers**: the `data-start-trigger="top -165%"` string format is directly portable into GSAP `ScrollTrigger.create({ trigger, start: "top -165%" })` configs.
- **Parallax**: the `--speed-factor` inline custom-property pattern is a clean way to make per-section parallax depth declarative and JS-readable, whether driving it with `gsap.quickTo` + Lenis or raw `lenis.on('scroll', ...)`.
- **Section anatomy**: the hero → manifesto-reveal → proof → services → social-proof-carousel → contact → locations flow is a solid default skeleton for a luxury local-services/real-estate homepage.
