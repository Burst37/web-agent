# SpaceAge Apple-Immersive Web Design — v2.0.0

A reusable, framework-neutral design-engineering skill for building and auditing premium web
interfaces: scroll storytelling, pinned and scrubbed sequences, momentum carousels, gesture
physics, kinetic typography, coherent depth, Liquid Glass-inspired functional chrome, and the
accessibility and performance work that keeps all of it honest.

**What makes v2 different:** every technique the skill prescribes exists as running code in
`lab/`, and every claim about that code is asserted by a browser-driven harness. Current state:
**100/100 assertions passing** across 7 pages, plus 24 reproducible screenshots.

## Start here

1. Read `SKILL.md` — the operating contract, design laws, stack router and constraints.
2. Run the lab and click through it (`npm run setup && npm run serve`).
3. Read the reference for whatever you are building (see below).
4. Read `references/pitfalls.md` before you write motion code. It is the shortest path to not
   repeating twelve specific mistakes.

## Commands

```bash
npm run setup      # vendor GSAP 3.13, Embla, Lenis into lab/vendor/ (offline-capable)
npm run serve      # http://localhost:4173
npm run verify     # 100 behavioural assertions → proof/verification.json
npm run capture    # 24 screenshots → proof/shots/
npm run proof      # all three
```

`node_modules/` and `lab/vendor/` are gitignored — third-party builds are fetched from npm under
their own licences rather than redistributed here. Every lab page also carries a CDN fallback, so
pages run before `setup` if you are online.

`verify` and `capture` need a browser. They use a local Playwright install, fall back to a global
one, and fall back again to a system Chrome/Chromium (`CHROME_PATH` is honoured). If none is
present, run `npx playwright install chromium`.

## Layout

| Path | What it is |
| --- | --- |
| `SKILL.md` | the skill itself |
| `lab/css/tokens.css` | **the portable half** — copy this into real projects |
| `lab/js/boot.js` | dependency loading + the dev contract (`__ready`, `__lab`, `?jump`, `?motion=off`) |
| `lab/scroll.html` | view timelines, scroll-state chrome, pinned scrub, horizontal `containerAnimation`, sticky stack, canvas media scrub, velocity accents |
| `lab/type.html` | SplitText masked lines/words/chars, variable axes on scroll, `@property` gradients, `text-box-trim`, velocity marquee |
| `lab/material.html` | glass material with refraction, weight ladder, depth anatomy, popover + anchor positioning, `interpolate-size` |
| `lab/carousel.html` | Embla with geometry-driven treatment, keyboard parity, Draggable + Inertia |
| `lab/transitions.html` | GSAP Flip shared elements, same- and cross-document view transitions |
| `lab/smooth.html` | correct Lenis + ScrollTrigger wiring, and when not to use it |
| `scripts/verify.mjs` | the verification harness |
| `scripts/capture.mjs` | deterministic screenshots |
| `proof/` | assertion results + screenshots |
| `references/` | deep dives with production code |
| `source-baseline/` | the original `apple-design` skill and the v1 package, preserved |

## References

- `references/scroll-systems.md`
- `references/gsap-elite.md`
- `references/typography-kinetic.md`
- `references/material-depth.md`
- `references/carousels-gestures.md`
- `references/transitions-continuity.md`
- `references/performance-accessibility.md`
- `references/pitfalls.md`
- `references/SOURCES.md`

## Core operating principle

Use the smallest effective immersion system. Native browser capabilities come first; GSAP,
Embla, Lenis and WebGL are routed in only when the interaction genuinely requires them. Content,
accessibility, performance and conversion stay primary — and nothing is claimed that has not been
measured.

## Attribution

Derived from Emil Kowalski's MIT-licensed `apple-design` skill; the original is preserved in
`source-baseline/` along with its licence. Apple-inspired methodology — not an Apple product, not
affiliated with or endorsed by Apple, and no Apple assets are reproduced. "Liquid Glass-inspired"
describes a web approximation built from public browser capabilities.
