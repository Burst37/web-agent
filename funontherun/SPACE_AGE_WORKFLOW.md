# Space Age Multi-Site Creation Workflow
## Master Process Document — v1.0
**Owner:** Space Age AI Solutions
**Status:** Canonical — do not deviate

---

## OVERVIEW

This document defines the exact, repeatable workflow for building any website using the Space Age system. Every site — consumer app, HVAC, restaurant, e-commerce, portfolio — runs through the same pipeline. The phases never change. The tools at each phase are fixed. The builder is never Claude Sonnet.

---

## THE PIPELINE — 9 PHASES

```
1. DISCOVERY
2. BRAND DNA
3. MARKET READ
4. STRATEGY (Attention → Story → Trust → Conversion)
5. DESIGN & MOTION DECISION MATRIX
6. ASSET GENERATION
7. UNIVERSAL BUILD HANDOFF
8. BUILD
9. QA + SEO
```

---

## PHASE 1: DISCOVERY

**Objective:** Understand the client's existing digital presence and extract raw material.

**Skill used:** `firecrawl-mcp`

**What to do:**
- Crawl the existing website (all pages)
- Extract: color usage, typography, copy tone, section structure, CTAs, imagery style
- Pull all existing asset URLs (images, videos, logos)
- Identify what is broken, missing, or weak

**Output:** Raw site audit — copy, structure, existing assets, weaknesses

**For new sites with no existing web presence:**
- Skip crawl
- Use `exa-mcp` to research 3 competitor sites in the same vertical
- Document what the category leaders are doing

---

## PHASE 2: BRAND DNA

**Objective:** Lock the visual identity before anything else is touched.

**Skill used:** SAVO OS (SpaceAge_SAVO_CreativeDirector_OS_v11.md)

**What to lock:**
- Primary background color
- Accent color (max 2)
- Text color + muted text color
- Glass/border overlay values
- Heading font + weight
- Body font + weight
- Brand voice (3 adjectives)
- Logo treatment

**Brand DNA is NON-NEGOTIABLE after this phase. No changes downstream.**

### Color Decision Rules by Site Type

| Site Type | Background | Accent | Feel |
|---|---|---|---|
| Consumer App | Warm near-black (`#0A0705`) | Warm orange/coral | Energetic, human |
| HVAC / Home Services | Cool dark navy (`#0D1117`) | Electric blue or safety orange | Reliable, technical |
| Restaurant / Food | Deep warm black (`#0C0907`) | Red, gold, or amber | Appetite, warmth |
| Medical / Health | Off-white or pale gray | Teal or soft blue | Clean, trustworthy |
| Fitness / Sport | True black (`#080808`) | Neon green or electric blue | Performance, intensity |
| Real Estate | Charcoal (`#111111`) | Gold or champagne | Premium, aspirational |
| E-commerce | Dark gray (`#0F0F0F`) | Brand color from product | Converts, not decorates |
| Portfolio / Creative | True black | Electric accent, 1 color max | Bold, confident |
| Law / Finance | Deep navy (`#0A0D14`) | Muted gold | Authority, trust |

---

## PHASE 3: MARKET READ

**Objective:** Understand where this site sits in its competitive landscape.

**Skill used:** `exa-mcp`

**What to research:**
- Top 3 competitors in the same city/vertical
- What visual and copy patterns dominate the category
- What is NOT being done (the gap to own)
- Price point signals from competitor sites

**Output:** 1-paragraph positioning statement — what this site does that no competitor does

---

## PHASE 4: STRATEGY

**Objective:** Define the narrative arc of the site before a single section is designed.

**Skill used:** SAVO OS + Space Age Figma Design Director OS v3

**The four layers — in order:**

1. **Attention** — What stops the scroll. Hero section job.
2. **Story** — Why this exists. Problem → Solution arc.
3. **Trust** — Why believe it. Social proof, safety, credentials.
4. **Conversion** — What to do. CTA placement, friction reduction.

**Section order is determined by this arc. Do not reorder sections without a strategic reason.**

---

## PHASE 5: DESIGN & MOTION DECISION MATRIX

**Objective:** Assign the correct motion library, animation mode, and effect system to this specific site type.

**Skill used:** Space Age Figma Design Director OS v3 + `sa-figma-framer-spline`

### Animation Mode by Site Type

| Site Type | Hero Treatment | Scroll Animation | Primary Library | 3D Elements |
|---|---|---|---|---|
| Consumer App | Kling 3.0 or Seedance 2.0 video loop | GSAP horizontal pin + Framer entrance | GSAP + Framer Motion | Spline (optional) |
| HVAC / Home Services | Static hero image, parallax | Framer fade-up reveals only | Framer Motion | None |
| Restaurant / Food | Ambient video loop or cinemagraph | Parallax food imagery | GSAP + Lenis | None |
| Medical / Health | Static, clean, no video | Subtle Framer fade-up | Framer Motion | None |
| Fitness / Sport | Kling 3.0 or Seedance 2.0 action video | GSAP scrub, kinetic text | GSAP + Framer Motion | Spline (optional) |
| Real Estate | Kling 3.0 or Seedance 2.0 property/aerial | Parallax + Framer reveals | GSAP + Framer Motion | None |
| E-commerce | Product hero, no video | Framer hover states dominant | Framer Motion | None |
| Portfolio / Creative | Full-bleed image or Spline 3D | GSAP kinetic typography | GSAP + Spline + Framer | Spline (always) |
| Law / Finance | Static, authoritative | Framer fade-up only | Framer Motion | None |

### Effect System Assignment

**Rule:** Match effect depth to category trust expectations.

| Effect | Use When | Never Use When |
|---|---|---|
| Liquid Glass | App, creative, fitness, restaurant | Medical, law, finance |
| Glassmorphism | Any dark-mode site with layered content | Light-mode sites |
| Neumorphism | Consumer apps, fintech, health apps | Heavy motion sites (conflicts) |
| Skeuomorphic assets | When a physical metaphor adds trust (shield, phone, card) | Minimal/portfolio sites |
| Kinetic typography | Portfolio, app, fitness | HVAC, medical, law |
| Horizontal scroll pin | How-it-works steps (any site) | Sites with 7+ steps |
| Cursor effects | Portfolio, creative, premium app | Any service/local business site |

### Motion Rules (Universal — Apply to Every Site)

```
Smooth scroll:   Lenis always (lerp: 0.1, duration: 1.2)
Entrance:        Framer Motion (opacity 0→1, y 60→0, duration 0.8s, ease [0.16,1,0.3,1])
Hover cards:     scale(1.03) + accent glow shadow
Image hover:     scale(1.05) + accent box-shadow
ScrollTrigger:   scrub: 1 on any pinned section
Mobile:          Disable GSAP pins under 768px, stack vertically
```

---

## PHASE 6: ASSET GENERATION

**Objective:** Generate all visual assets before writing a line of code. No placeholder images. Ever.

**Platform:** Higgsfield AI

### Asset Decision Tree

```
Does the hero need motion?
├─ YES → Choose video model:
│         ┌─ Kling 3.0
│         │   Mode: Pro | Duration: 6-8s | AR: 16:9
│         │   Start + End frames: GPT Image 2, 4K, 16:9
│         │   Best for: multi-shot cinematic, crowd scenes, narrative sequences
│         └─ Seedance 2.0
│             Mode: Pro | Duration: 6-8s | AR: 16:9
│             Start + End frames: GPT Image 2, 4K, 16:9
│             Best for: fluid motion, product/lifestyle, smooth camera movement
│         Both require: multi-shot prompt, crowd demo, activity, lighting specified
└─ NO  → Generate with NanoBanana Pro
          Resolution: 2k | Option: Free

Is this a video-heavy page? (restaurant, fitness, app)
├─ YES → Kling 3.0 or Seedance 2.0 for hero + 1 feature section video
└─ NO  → NanoBanana Pro for all sections

Does the site need a 3D hero element?
├─ YES → Spline (via sa-figma-framer-spline skill)
└─ NO  → Skip Spline
```

### Asset Manifest (Generate Before Building)

Every build requires this asset set at minimum:

| Asset | Tool | Spec |
|---|---|---|
| Hero background (video) | Kling 3.0 OR Seedance 2.0 | 1920×1080, 6-8s, Pro mode |
| Hero start frame | GPT Image 2 | 4K, 16:9 |
| Hero end frame | GPT Image 2 | 4K, 16:9 |
| Problem/pain section image | NanoBanana Pro | 2k |
| Feature image ×3 | NanoBanana Pro | 2k each |
| Trust/safety image | NanoBanana Pro | 2k |
| Testimonial avatars ×3-4 | NanoBanana Pro | 2k each |
| Secondary page hero | NanoBanana Pro | 2k |

**All CDN URLs must be confirmed working before handoff. No `[full-id]` placeholders.**

---

## PHASE 7: UNIVERSAL BUILD HANDOFF

**Objective:** Produce the 3-file context package the builder reads before writing code.

**Files produced:**

### `CLAUDE.md` (Builder Rules)
Contains:
- Role declaration ("You are the builder. Not the designer.")
- Exact tech stack (no substitutions)
- Design token object (hardcoded values)
- Effect CSS for liquid glass, neumorphism, glassmorphism
- Motion code snippets (Lenis config, Framer variants, GSAP setup)
- Pages to build
- Deployment command

### `HANDOFF.md` (Spec + Assets)
Contains:
- Brand DNA summary
- Every asset URL (confirmed, no placeholders)
- Section-by-section spec for every page
- Nav behavior
- Typography imports
- Deployment checklist

### `RATIONALE.md` (Decision Reasoning)
Contains:
- Why each color was chosen (psychology + brand fit)
- Why each section exists and in that order
- Why each animation mode was selected for this site type
- Why each asset style was used
- Why specific copy directions were chosen
- Everything down to the last feature, explained

**All 3 files must exist before build begins. No exceptions.**

---

## PHASE 8: BUILD

**Objective:** Implement the site exactly to spec.

**Builder routing:**

| Build Type | Builder |
|---|---|
| Next.js + cinematic effects + complex motion | Opus 4.8 (reading CLAUDE.md) |
| Static site, minimal motion | Sonnet 4.6 (reading CLAUDE.md) |
| Framer-native build | Framer AI + sa-figma-framer-spline |
| Webflow build | Webflow AI |

**Claude Sonnet is NEVER the builder for cinematic/animated sites.**

### Tech Stack (Universal — All Next.js Builds)

```
Framework:     Next.js 14, App Router, TypeScript
Styling:       Tailwind CSS + shadcn/ui + Radix UI
Animation:     Framer Motion + GSAP + ScrollTrigger
Smooth scroll: Lenis
Fonts:         @fontsource/syne + @fontsource/dm-sans (NO Google Fonts CDN)
3D (if used):  Spline
Interactive:   Rive (logo/mascot animations only)
```

### `superpowers` Skill Activation

For any build longer than a single session, activate the `superpowers` skill. It enforces:
- Spec-first (no code before spec is confirmed)
- TDD-driven (test before implement)
- 5-phase lifecycle (spec → review → plan → execute → finish)
- Prevents the builder from going off-plan mid-run

---

## PHASE 9: QA + SEO

**Objective:** Verify the build matches the spec, then optimize for search and AI citation.

**QA Checklist:**
- [ ] All design tokens match CLAUDE.md values
- [ ] All asset URLs load (network tab check)
- [ ] Hero video autoplays on mobile (muted + playsinline)
- [ ] Lenis smooth scroll works on iOS Safari
- [ ] GSAP pins disabled on < 768px (stacked vertically)
- [ ] Liquid glass visible on nav scroll trigger
- [ ] All hover states functional
- [ ] Lighthouse: Performance > 85, Accessibility > 95

**SEO — activate `sa-local-seo-geo` skill after QA passes:**
- Local pack optimization (for local businesses)
- GEO optimization (AI citation across ChatGPT, Perplexity, Google AI)
- Schema markup injection
- Meta + OG tags

---

## SKILL REFERENCE MAP

| Skill | Phase | Purpose |
|---|---|---|
| `firecrawl-mcp` | 1 — Discovery | Crawl client site, extract assets and structure |
| `exa-mcp` | 1 + 3 — Discovery + Market Read | Competitor research, semantic web search |
| SAVO OS | 2 + 4 — Brand DNA + Strategy | Master creative direction |
| Space Age Figma Design Director OS v3 | 5 — Design Matrix | Section design, visual signature, motion spec |
| Space Age Cinematic Video Architect v10 | 6 — Asset Generation | Higgsfield video prompt writing |
| `sa-figma-framer-spline` | 5 + 8 — Design + Build | Design-to-production, Tokens Studio, Framer, Spline |
| `superpowers` | 8 — Build | Builder discipline, spec enforcement |
| `sa-local-seo-geo` | 9 — QA + SEO | Local search + AI citation optimization |
| `caveman` | Any | Token reduction on high-volume pipeline runs |
| `paperclip` | Any (multi-agent) | Orchestrating parallel site builds |
| `sa-workflow-copier` | Setup | Learning from tutorial videos, new workflow extraction |
| `sa-youtube-cli` | Setup | Pulling transcripts from YouTube build tutorials |
| `gbrain` | Any (persistent memory) | Cross-session knowledge graph, state persistence |
| `karpathy-autoresearch` | Post-launch | Autonomous overnight optimization loops |
| `cli-printing-press` | Setup | Building new API integrations into the pipeline |

---

## EXAMPLE: HVAC SITE

**Phase 1 — Discovery:** Firecrawl crawl existing site or top 3 HVAC competitors via exa-mcp
**Phase 2 — Brand DNA:** Cool dark navy `#0D1117`, safety orange accent `#F97316`, Syne headings, DM Sans body
**Phase 3 — Market Read:** exa-mcp research shows competitors use stock photography, generic copy, no motion
**Phase 4 — Strategy:** Attention=trust signal hero (not video — HVAC is trust-first), Story=seasonal pain, Trust=reviews+certifications, Conversion=form above fold
**Phase 5 — Motion Matrix:** Static hero image, parallax scroll only, Framer fade-ups, NO glassmorphism, NO liquid glass, NO kinetic typography, NO cursor effects
**Phase 6 — Assets:** NanoBanana Pro only (no video — trust category, motion reduces credibility), technician on job site, happy homeowner, service truck
**Phase 7 — Handoff:** CLAUDE.md + HANDOFF.md + RATIONALE.md produced
**Phase 8 — Build:** Opus 4.8 or Sonnet 4.6 (low motion = Sonnet acceptable)
**Phase 9 — QA + SEO:** `sa-local-seo-geo` critical — HVAC is hyper-local, Google local pack is primary traffic source

---

## EXAMPLE: CONSUMER APP (Fun on the Run)

**Phase 1 — Discovery:** Firecrawl funontherun.co — extracted all assets, brand colors, existing structure
**Phase 2 — Brand DNA:** Warm black `#0A0705`, orange `#FF6B35`, warm yellow `#FFD166`, Syne 900, DM Sans 400
**Phase 3 — Market Read:** No direct competitor owns cinematic social app space — gap to own
**Phase 4 — Strategy:** Attention=cinematic video hero, Story=loneliness problem → FOTR solution, Trust=safety + testimonials, Conversion=beta join + app download
**Phase 5 — Motion Matrix:** Kling 3.0 video hero, GSAP horizontal pin (How It Works), Framer entrances, liquid glass nav, glassmorphism cards, neumorphic stats, skeuomorphic shield
**Phase 6 — Assets:** GPT Image 2 4K frames → Kling 3.0 hero video + 12× NanoBanana Pro 2k images
**Phase 7 — Handoff:** CLAUDE.md + HANDOFF.md + RATIONALE.md (RATIONALE.md pending)
**Phase 8 — Build:** Opus 4.8 mandatory (complex motion stack)
**Phase 9 — QA + SEO:** `sa-local-seo-geo` for app store + GEO citations

---

## WHAT NEVER CHANGES

1. All 9 phases run. No skipping.
2. CLAUDE.md + HANDOFF.md + RATIONALE.md are always produced before build.
3. Claude Sonnet never builds cinematic/animated sites.
4. No Google Fonts CDN. Fontsource only.
5. No placeholder assets in the handoff. All URLs confirmed.
6. Lenis is always the scroll wrapper.
7. `sa-local-seo-geo` always fires after QA.
8. Motion mode is determined in Phase 5 and locked. No changes during build.
