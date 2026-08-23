---
name: cinematic-website-director
display_name: SPACE AGE — Cinematic Website Director (v6)
version: 6.1.0
last_updated: 2026-08-14
status: production
owner: Space Age AI Solutions
classification: orchestration + QA + platform-adapter layer for the SA cinematic website pipeline
description: >
  Master production contract and QA/completion-gate layer for cinematic website builds. Load
  this ON TOP OF — not instead of — the standard pipeline (lead-to-brief,
  spaceage-savo-creative-director-os, ui-ux-designer, cinematic-website-builder,
  sa-deploy-operator) when a job needs: concurrent multi-site factory production under Hermes
  Agent (job isolation, builder-quota/model routing across DeepSeek/Kimi/Claude/Codex/Gemini/
  MiniMax), a non-code-first platform target (Wix Studio/Velo, Framer, Webflow, Shopify,
  WordPress/Elementor, Figma or Google Stitch handoff), cinematic storyboard/Higgsfield
  video-direction prompt architecture beyond what cinematic-website-builder's own asset
  pipeline covers, or the stricter evidence-based completion gate (visual/accessibility/
  performance/security/voice QA with before-after screenshots) required for enhanced/
  cinematic/flagship tiers. For a single code-first HTML build with no factory, platform, or
  media-direction need, cinematic-website-builder alone is sufficient. Trigger on: "director",
  "production contract", "site factory", "multiple sites", "concurrent builds", "Hermes
  orchestration", "platform adapter" (Wix/Framer/Webflow/Shopify/WordPress), "storyboard" /
  "Higgsfield direction", "completion gate", or "evidence package".
runtime_orchestrator: Hermes Agent (optional — see "Pipeline Position & Standalone Mode" below)
primary_builders:
  - DeepSeek V4 Flash
  - Kimi K3
alternate_builders:
  - Claude
  - Codex
  - Gemini
  - MiniMax M3
media_provider: Higgsfield MCP (mcp__Higgsfield__* tools — no separate repo skill wraps this; Sections 7-9 below are the direction layer)
storyboard_image_models:
  - GPT Image 2.0
  - Seedream current image model
storyboard_output_resolution: 2K
voice_requirement: mandatory unless explicitly disabled by the operator (Section 10)
platform_scope:
  - code-first web stacks (routes to cinematic-website-builder)
  - Wix Studio / Velo
  - Framer
  - Webflow
  - Shopify
  - WordPress / Elementor
  - Figma design handoff
  - Google Stitch design handoff
  - other verified web platforms
---

# CINEMATIC WEBSITE DIRECTOR V6
## Production Skill — Hermes-Orchestrated, Model-Agnostic, Asset-First

## Pipeline Position & Standalone Mode

This skill is the **factory / QA / platform-adapter layer**. It sits above, and does not
restate, the pipeline `cinematic-website-builder` already documents in its own "FULL PIPELINE
MAP":

```text
STAGE 1    lead-to-brief                                → build_brief
STAGE 1.5  spaceage-savo-creative-director-os            → strategy + creative direction
STAGE 2    ui-ux-designer (+ ui-ux-pro-max)              → design brief, moodboard, tokens
STAGE 2.5  [premium] Google Stitch / sa-figma-framer-spline → prototyping, exact tokens/3D
STAGE 3    cinematic-website-builder                     → production HTML (code-first path)
           [alt path] scroll-film-studio                 → scroll-film path
STAGE 4    QA gate — cinematic-website-builder's own checklist is the floor; this skill's
           Sections 15-22 are the ceiling for enhanced/cinematic/flagship/multi-site/
           non-code-first builds
STAGE 5    sa-deploy-operator                             → deploy + Hermes/vault log
STAGE 6    vapi-orchestrator (production) / sa-voice-agent-builder (roadmapped) → voice
STAGE 7    outreach-copywriter                             → outreach copy
```

Reach for this skill when a job needs one or more of: **(a)** concurrent multi-site factory
production across multiple builder models — Sections 1, 3, 26, 27, requires Hermes Agent;
**(b)** a non-code-first platform target — Section 11; **(c)** cinematic storyboard/Higgsfield
video-direction prompt architecture — Sections 7-9; or **(d)** the stricter evidence-based
completion gate for enhanced/cinematic/flagship tiers — Sections 15-24.

### Standalone mode (no Hermes Agent runtime present)

Most sessions in this repo run as a single `agent-core` / Claude Code session, not under the
Hermes VPS job-queue orchestrator (`hermes-webui` controls that separately). When no Hermes
runtime is present:

- Sections 1, 3, 26, and 27 (job queue, workspace isolation, job-state machine, factory
  telemetry) are **no-ops**. Skip them — do not simulate a job queue or fabricate a `job_id`
  just to satisfy the schema. Note in your output that factory-orchestration mechanics were
  skipped as not applicable.
- The **builder quota policy** (Section 1.2) does not apply — you are the one builder on the
  job; proceed directly to implementation once the handoff (Section 5) is ready.
- Everything else — the design system rules, media pipeline, platform adapters, QA rubric,
  accessibility/performance/security bars, voice requirement, and completion gate — still
  applies in full. Standalone mode changes *who schedules the work*, not the quality bar.

## 0. Prime Directive

Build original, conversion-capable, cinematic websites that are visually distinctive, technically verified, mobile-safe, accessible, performant for their chosen media tier, and deployable on the selected platform.

The system must not confuse generated code, a design mockup, a screenshot, or an agent claim with a completed website.

A completed website requires evidence.

```text
business intelligence
→ approved creative direction
→ site DNA
→ routed skill plan
→ media/voice/build manifests
→ isolated implementation
→ browser rendering
→ visual critique
→ functional/accessibility/performance verification
→ repair
→ deployment verification
→ evidence package
```

This skill is the canonical production contract. It does not replace every specialist skill. It routes them.

---

# 1. Operating Model

## 1.1 Hermes is the runtime orchestrator

Hermes owns:

- job queue and job state
- concurrent site execution
- workspace isolation
- skill routing
- model assignment
- tool and MCP invocation
- dependency graph execution
- retry policy
- artifact collection
- QA routing
- deployment routing
- usage/cost telemetry
- escalation

Hermes may run many websites concurrently. Never use a fixed concurrency number in the skill. Determine concurrency from available CPU, RAM, browser load, filesystem isolation, API/provider limits, subscription quotas, and cost budgets.

## 1.2 One primary builder owns one website

Each website receives one primary coding owner unless rescue or an explicit multi-agent plan is approved.

Primary volume workers:

- DeepSeek V4 Flash
- Kimi K3

Alternate capacity workers:

- Claude
- Codex
- Gemini
- MiniMax M3

Default daily allocation is configurable, with an initial operator policy of:

```yaml
builder_quota_policy:
  claude_sites_per_day: 1-2
  codex_sites_per_day: 1-2
  gemini_sites_per_day: 1-2
  minimax_sites_per_day: 1-2
  remainder:
    split_between:
      - DeepSeek V4 Flash
      - Kimi K3
    strategy: weighted-by-live-performance
  stitch_uses_per_day: 1-2
  stitch_scope: google-lane-only
```

These are capacity policies, not quality rankings. The factory must learn from its own results.

## 1.3 Model names are aliases, not architecture

The handoff describes capability needs. Hermes resolves those needs to currently configured models.

```yaml
worker_profile:
  frontend_complexity: low|medium|high|extreme
  backend_complexity: low|medium|high
  visual_creativity: low|medium|high
  motion_complexity: low|medium|high|extreme
  context_requirement: low|medium|high
  cost_sensitivity: low|medium|high
  latency_priority: low|medium|high
```

Do not hardwire core website logic to a specific model provider.

---

# 2. Skill Governance

## 2.1 Never load the entire skills library

Every job gets the smallest sufficient skill set.

Skill statuses:

```text
CORE      = normally required
ROUTED    = load only when a condition matches
REFERENCE = consult when needed; do not inject by default
ARCHIVE   = source material already merged or superseded
```

## 2.2 Canonical core skill routes

The table below resolves every route to this repo's actual `skills/` directory as of
2026-08-14. Rows marked **not present** are genuine gaps, not routing errors — apply the
stated fallback rather than stalling the build waiting for a skill that doesn't exist yet.
This mirrors Section 1.3's own rule (resolve capability needs to what's actually configured;
never hardwire to a name that isn't shipped).

### Pre-build strategy

1. `spaceage-savo-creative-director-os` — strategy and creative direction
2. **not present** (website-type routing matrix) — apply Section 5.3's variation policy
   manually against recent builds
3. `ui-ux-designer` (+ `ui-ux-pro-max` for style/palette/pattern reference) — experience and
   conversion structure
4. **not present** (pattern-genome variation library) — same fallback as #2
5. `lead-to-brief` output (`build_brief`) — canonical handoff

SAVO owns strategy and creative direction. UI/UX owns experience and conversion structure.
The builder must not re-decide strategy without evidence that the handoff is invalid or
incomplete.

### Production

6. `cinematic-website-director` (this skill)
7. `design-motion-principles` + `gsap-supercharged` (or the narrower `gsap-core` /
   `gsap-scrolltrigger` / `gsap-timeline`) when the motion route requires it
8. `design-motion-principles` also covers micro-interaction/hover/cursor patterns — no
   separate interaction-library skill exists
9. **not present** (codebase-intelligence skill) — for nontrivial codebases, migrations,
   rescue, or repair, read the existing codebase directly and hold to the same discipline
   this repo's `karpathy-guidelines` skill enforces elsewhere: think before coding, surgical
   changes, no silent assumptions

### Media

10. Higgsfield MCP tools directly (`mcp__Higgsfield__*`) — no repo skill wraps Higgsfield;
    Sections 7-9 of this skill ARE that direction layer
11. `sa-youtube-cli` when a reference video needs transcribing for direction
12. `sa-workflow-copier` when replicating an existing site-build tutorial video

### Voice

13. `vapi-orchestrator` (production today) or `sa-voice-agent-builder` (Gemini Flash Live
    direct-API path — roadmapped; check its own `Status` field before routing to it) —
    mandatory for every website unless explicitly disabled (Section 10). Resolve to whichever
    is actually live; do not hardwire to a name that isn't shipped.

### QA

14. `browserbase-scraper` for cloud/stealth browser automation when local Playwright access
    isn't available or the target needs proxy/geo/CAPTCHA handling (local Playwright, as
    already wired into `cinematic-website-builder`'s own QA integration, is the default)
15. Sections 15-17 of this skill ARE the design-loop/visual-QA-rubric layer — no separate
    skill needed
16. Section 23 (Failure and Rescue) of this skill IS the diagnose/autonomous-repair logic

## 2.3 Routed specialists

Load only when relevant. Same rule as above: unmapped rows are genuine gaps, flagged rather
than silently assumed.

- Google Stitch → Google/Gemini design lane only; respect daily budget (external tool — no
  repo skill wraps it; use per Section 11.8 directly)
- `sa-figma-framer-spline` → Figma/Framer/Spline deliverable or high-design approval lane
  needing exact tokens or real physics/3D
- `penpot` → self-hosted Figma-alternative design tooling on SA infra
- `mobbin-operator` → pattern research, competitive UI benchmarking, paywall/onboarding audits
- ecommerce projects → **not present** (no dedicated ecommerce/Shopify skill in this repo yet)
  — apply Section 11.5's adapter rules directly and flag the gap to the operator rather than
  improvising checkout/payment logic
- advanced branded typography / 3D typography → **not present** — fall back to
  `design-taste-frontend`'s typography rules plus this skill's Section 6
- `browserbase-scraper` → source capture or platform automation when local browser access
  isn't available or verified
- security review → **not present** (no dedicated cybersecurity skill in this repo) — hold
  auth, payments, sensitive integrations, admin surfaces, and higher-risk apps to the
  OWASP-top-10 discipline in Section 21 and get explicit operator sign-off before shipping
- existing-site redesign/rebrand → **not present** (no `page-upgrade` skill in this repo yet)
  — audit the existing site directly and use Section 4's `REBRAND` / `MIGRATION` build modes

## 2.4 Conflict rule

When two skills give overlapping instructions, use this precedence:

```text
1. explicit project requirements
2. safety/legal/authorization requirements
3. approved SAVO / project handoff
4. this production skill
5. platform adapter
6. routed specialist skill
7. reusable pattern/reference library
```

Never combine contradictory persona instructions. Extract capability; discard persona conflict.

---

# 3. Job Isolation and Parallel Production

Each website job must have an isolated workspace.

```text
/jobs/<JOB_ID>/
├── input/
│   ├── business-dna.yaml
│   ├── site-dna.yaml
│   ├── handoff.yaml
│   ├── asset-manifest.yaml
│   ├── voice-agent-manifest.yaml
│   └── build-manifest.yaml
├── source/
├── assets/
│   ├── generated/
│   ├── provided/
│   ├── optimized/
│   └── frames/
├── qa/
│   ├── screenshots/
│   ├── reports/
│   └── scorecards/
├── logs/
└── delivery/
```

Required identifiers:

```yaml
job:
  job_id:
  client_id:
  workspace:
  primary_builder:
  quality_tier:
  platform:
  status:
```

Rules:

1. One writer owns a file at a time.
2. Shared contracts are frozen before parallel work starts.
3. No builder may read another client's workspace unless explicitly performing cross-project QA on sanitized artifacts.
4. No generated asset may be used without its job/client provenance.
5. Parallel tasks may proceed when their dependency graph permits it.
6. Media generation, voice provisioning, scaffolding, copy preparation, SEO structure, and integrations may run in parallel if they do not depend on unfinished outputs.
7. Final media-dependent layout cannot be approved using fake placeholder composition.

---

# 4. Project Modes

Every project declares exactly one primary mode.

```yaml
build_modes:
  ORIGINAL:
    description: original implementation from approved strategy
  REBRAND:
    description: preserve authorized structure/behavior while replacing identity/content
  CONTROLLED_REMIX:
    description: route approved systems from multiple authorized sources into an original implementation
  FAITHFUL_RECREATION:
    description: closely reproduce approved owned/client-approved/licensed structure and behavior
  MIGRATION:
    description: move an approved site to a new stack while retaining selected behavior
  INSPIRED_BY:
    description: extract principles and create a distinct implementation
```

Authorization is mandatory for faithful recreation and source reuse.

---

# 5. Pre-Build Intelligence Contract

Implementation is blocked until the minimum handoff exists.

## 5.1 Business DNA

```yaml
business_dna:
  business_name:
  industry:
  offer:
  locations: []
  service_area: []
  audience:
  customer_problem:
  trust_requirements: []
  primary_conversion:
  secondary_conversion:
  proof_assets: []
  competitors: []
  brand_assets: []
  brand_personality: []
  differentiators: []
  legal_or_claim_constraints: []
```

Never fabricate business facts to fill missing fields.

## 5.2 Site DNA

```yaml
site_dna:
  site_type:
  platform_target:
  quality_tier: factory|enhanced|cinematic|flagship
  layout_family:
  hero_family:
  navigation_family:
  typography_direction:
  section_rhythm:
  visual_language:
  motion_language:
  motion_budget:
  media_tier:
  conversion_architecture:
  service_presentation:
  proof_presentation:
  cta_pattern:
  signature_interaction:
  mobile_strategy:
  accessibility_strategy:
  performance_budget:
  skill_routes: []
```

## 5.3 Controlled variation

Pattern Genome selection must avoid repeated factory output.

The system should compare against recent builds when a similarity index exists.

```yaml
variation_policy:
  prohibit_exact_recent_genome_repeat: true
  compare_dimensions:
    - hero_family
    - navigation_family
    - typography_family
    - section_sequence
    - proof_pattern
    - motion_signature
    - cta_pattern
  similarity_threshold:
  recent_build_window:
```

Variation is controlled by business fit, not random novelty.

---

# 6. Cinematic Design System

Cinematic quality is composition + rhythm + hierarchy + typography + media direction + controlled motion + interaction + sound/voice strategy where appropriate.

It is not "add more effects."

## 6.1 Motion design rules

Every substantial animation has:

- purpose
- before state
- after state
- trigger
- duration or scroll range
- easing
- stagger if relevant
- mobile behavior
- reduced-motion fallback
- resize behavior
- cleanup/unmount behavior
- performance fallback

Prefer custom easing appropriate to the visual language over indiscriminate linear movement.

Stagger dependent elements when it improves hierarchy; do not animate everything simultaneously.

Never delay the critical LCP element merely for animation theater.

## 6.2 Motion budget

Each project receives a motion budget. Every complex module consumes budget.

Example default weights:

```yaml
motion_costs:
  simple_reveal: 2
  text_stagger: 3
  parallax: 5
  marquee: 4
  cursor_effect: 5
  sticky_narrative: 8
  horizontal_scroll: 10
  3d_card_orbit: 12
  canvas_scrub_video: 20
  webgl_scene: 25
```

Typical starting budgets:

```yaml
factory: 15-30
enhanced: 25-45
cinematic: 40-70
flagship: 60-100
```

These are planning values, not performance guarantees.

## 6.3 Effect selection

Do not exceed the experience with effects. Select a small number of signature behaviors that serve the narrative.

Examples:

- local service: video/still hero + clean reveals + review motion + one signature interaction
- restaurant/nightlife: full-bleed media + parallax + editorial typography + gallery transitions
- fashion/ecommerce: product motion + hover media + kinetic type + selective scroll choreography
- SaaS: product visualization + metric motion + clean interaction states
- flagship: scroll film, 3D/WebGL, richer transitions only when supported by assets and performance budget

---

# 7. Fable-Style Cinematic Recipe System

The Fable/Higgsfield prompt patterns are treated as model-agnostic production recipes. They may be implemented by any coding worker.

Canonical recipe families:

```yaml
cinematic_recipes:
  PRODUCT_REVEAL:
    media: anchor hero reference -> orbit -> macro -> detail/exploded view
    web: scroll scrub -> product proof -> specification -> conversion
  JOURNEY:
    media: chained scenes using continuity frames/keyframes
    web: scroll progress maps to narrative progression
  PERSONAL_PORTFOLIO:
    media: identity anchor -> hero orbit -> work environment -> closing hero
    web: identity -> proof -> work -> CTA
  ECOMMERCE_DROP:
    media: lookbook anchor -> hero motion -> product turns -> material macro
    web: drop hero -> products -> proof/material -> cart/notify CTA
  LOCAL_BUSINESS:
    media: hero craft/service -> environment -> process/team
    web: emotional hook -> services/menu -> proof -> booking/contact
  PROPERTY_JOURNEY:
    media: exterior anchor -> arrival -> interior flow -> destination
    web: guided tour -> features -> proof -> inquiry
  MACHINE_IN_ENVIRONMENT:
    media: reveal -> run -> environment -> night/detail
    web: performance story -> specs -> configuration -> reserve
  SAAS_PRODUCT_LAUNCH:
    media: abstract/product assembly -> signal/detail -> real-use state
    web: promise -> features -> metrics -> product -> pricing -> CTA
  STUDIO_AGENCY:
    media: signature abstract motif -> work/process -> human/brand close
    web: statement -> selected work -> capabilities -> proof -> contact
```

Recipes are starting structures. Never copy fictional brands, claims, prices, or identities into a real client build.

---

# 8. Media Pipeline — Higgsfield + Seedance

When custom media is required, generate media from the approved Site DNA before final composition.

Correct sequence:

```text
Site DNA
→ media slots
→ asset manifest
→ anchor/reference generation
→ video/image generation
→ QC
→ optimization / frame extraction
→ builder integration
→ browser verification
```

## 8.1 Asset Director classification

Every source asset is classified:

```text
KEEP      = authentic client asset already good enough
ENHANCE   = authentic asset requiring cleanup/upscale/reframe
GENERATE  = missing campaign/media asset
DISCARD   = unusable, unauthorized, low-value, misleading, or redundant
```

Prefer authentic client identity assets for trust-critical sections.

## 8.2 Storyboard previsualization — image-model locked

Storyboard generation is a controlled previsualization stage, not an incidental image-generation step.

Default storyboard/image-previs models:

```yaml
storyboard_image_generation:
  allowed_models:
    - GPT Image 2.0
    - Seedream current image model
  default_resolution: 2K
  resolution_policy: long_edge_approximately_2048px_or_nearest_supported_native_size
  disallow_by_default:
    - lower-reliability image models for text-heavy storyboard sheets
    - video models pretending to be storyboard layout engines
  reason:
    - accurate typography
    - reliable panel labels
    - stronger continuity sheets
    - cleaner production handoff
```

When the storyboard contains titles, panel numbers, lens tags, director strips, product copy, UI labels, signs, or other readable text, route only to the approved storyboard image models unless the operator explicitly overrides the rule.

The image model creates the storyboard. The video model animates the approved visual plan.

### 2K storyboard output policy

Use the nearest native 2K output supported by the selected model and aspect ratio.

Planning targets:

```yaml
storyboard_2k_targets:
  "16:9": "approximately 2048x1152"
  "1:1": "approximately 2048x2048"
  "9:16": "approximately 1152x2048"
  "21:9": "approximately 2048x878"
```

Do not upscale a poor low-resolution storyboard and call it 2K production previs.

## 8.3 Reusable cinematic storyboard prompt architecture

The Director chooses the storyboard architecture based on the media slot and narrative requirement.

```yaml
storyboard_routes:
  DIRECTOR_PREVIS_5X2:
    panels: 10
    use_when: cinematic hero, narrative sequence, continuous action, complex camera choreography
    visual_style: low-detail professional storyboard/previs unless photoreal frames are specifically required
  COMMERCIAL_BOARD_3X3:
    panels: 9
    use_when: product campaign, UGC ad, service commercial, social campaign, shot-by-shot brand story
    visual_style: premium campaign frames with compact production copy
  RAPID_15_SHOT:
    panels: 15
    use_when: dense 15-second beat progression or one-second-per-beat planning
    visual_style: highly legible shot progression with one action per panel
  CONTINUOUS_MASTER_SHOT:
    panels: 8-10
    use_when: no-cut sequence, same-lens descent/orbit/dolly/journey, spatial transformation
    visual_style: continuity-first previs with one preserved camera path
  KEYFRAME_CHAIN:
    panels: 4-8
    use_when: strict start/middle/end states matter more than complete shot coverage
    visual_style: clean high-confidence anchor frames for downstream image-to-video
```

### Mandatory storyboard prompt packets

Every substantial storyboard prompt should contain the smallest useful subset of these packets:

1. **PROJECT CARD** — title, one-line meta direction, priority read, output role.
2. **MASTER STYLE ANCHOR** — one visual language applied to all panels.
3. **REFERENCE PRIORITY** — which uploaded reference controls identity, wardrobe, product geometry, architecture, typography, or palette.
4. **SCENE PACKET** — premise, location, start state, end state, action chain, props/effects.
5. **CHARACTER / PRODUCT SANITIZATION** — remove contradictory traits and prohibit spontaneous redesign.
6. **IDENTITY CONSISTENCY** — face/body/wardrobe/product geometry remain locked across panels.
7. **STORYBOARD PURITY** — defines what belongs inside panel artwork versus outside in labels/director strips.
8. **MASTER SHOT / GEOGRAPHY RULE** — establishes screen direction, axis, destination layout, and depth.
9. **EMOTIONAL / COMMERCIAL ARC** — defines escalation or persuasion rhythm.
10. **STYLE LOCKS** — lighting, material, color, VFX, environment, realism level.
11. **SPATIAL CONTINUITY LOCK** — recurring objects and architecture keep relative positions.
12. **PANEL HEADERS** — panel ID + lens/focal length + beat name when appropriate.
13. **CAMERA + LENS PLAN** — framing, lens, height, angle, movement, focus behavior.
14. **ACTION PATH** — what physically changes from panel to panel.
15. **RHYTHM TRACK** — hold, reveal, build, burst, impact, pause, recover, final hit.
16. **ESCALATION MAP** — calm/tension/rise/surge/peak and release state.
17. **STATE TRACK** — continuity state of subject, environment, props, weather, wardrobe, effects.
18. **STYLE TRACK** — visual evolution without identity drift.
19. **FINAL HERO FRAME** — clean 16:9 editorial end composition when the asset is a website hero or campaign close.

### Storyboard purity modes

Use one of two explicit modes. Do not accidentally mix them.

```yaml
storyboard_purity_modes:
  PREVIS_CLEAN:
    panel_artwork:
      - visual only
      - no captions
      - no arrows
      - no UI
      - no lens labels inside art
      - no timing marks inside art
    outside_panel:
      - panel number
      - beat name
      - lens tag
      - director strip
      - rhythm/escalation/state notes
  COMMERCIAL_ANNOTATED:
    panel_artwork:
      - cinematic image
      - only intentional in-world text
    frame_chrome:
      - scene number
      - short title
      - concise action copy
      - optional sound/music cue
      - optional brand footer when the real campaign requires it
```

When text accuracy is critical, keep production text in clean header/footer zones with high contrast and sufficient scale. Do not crowd tiny technical copy into the frame.

### Storyboard composition rule

A storyboard is not a collage of unrelated pretty images. It is a visual state machine.

Each panel must inherit from the previous panel:

```text
identity
+ geography
+ camera logic
+ action consequence
+ light direction
+ prop state
+ environmental state
+ narrative intention
```

Only deliberately changed variables may change.

### Reference hierarchy

```yaml
reference_hierarchy:
  identity_reference: controls face/body/wardrobe or product geometry
  architecture_reference: controls physical layout and fixed environmental features
  brand_reference: controls logo, typography, color, packaging and approved identity assets
  storyboard: controls staging, shot order, camera logic and action progression
  style_reference: controls treatment only and must not overwrite identity or architecture
```

If references conflict, follow the approved project handoff and explicit project requirements.

## 8.4 Higgsfield Storyboard Direction System

Higgsfield is a primary video-direction lane for cinematic website media. Treat the storyboard as a **shot blueprint**, not as a single collage image that should appear in the output.

Hermes should resolve the currently approved Higgsfield video runtime rather than hardwire core logic to one version number.

```yaml
higgsfield_route:
  runtime_alias: higgsfield_cinema_current
  input_priority:
    - approved storyboard or keyframes
    - identity/product references
    - architecture/location references
    - approved style packet
  shot_controls:
    - framing
    - camera body/look when exposed by runtime
    - lens family
    - focal length
    - camera height and angle
    - camera movement
    - subject movement
    - focus behavior
    - lighting
    - atmosphere
    - speed/rhythm
    - VFX/particle behavior
  output_roles:
    - website hero
    - section transition
    - ambient section loop
    - product reveal
    - service narrative
    - UGC/commercial spot
    - scroll-film source
```

### Higgsfield storyboard-to-video master handoff

Use this production structure:

```text
USE [STORYBOARD_REFERENCE] AS THE COMPLETE CINEMATIC SHOT BLUEPRINT.
Follow its panel order, staging, camera logic, composition, action beats, continuity, rhythm and escalation.
Do not reproduce the storyboard as a collage and do not place storyboard labels in the video.

OUTPUT ROLE:
[website hero / section transition / product film / ambient loop / campaign clip]

FORMAT:
[duration] / [aspect ratio] / [target resolution supported by runtime]

VISUAL SUMMARY:
[subject + location + event + style + camera language]

STYLE LOCK:
[cinematic realism / editorial language / palette / material / lighting / atmosphere]

REFERENCE LOCKS:
Identity: [reference]
Architecture/location: [reference]
Product/wardrobe: [reference]
Typography/brand: [reference if applicable]

SHOT / BEAT PLAN:
P01 — [framing + lens + action + camera movement]
P02 — [framing + lens + action + camera movement]
...
FINAL — [hero composition + resolved action + hold]

CAMERA LANGUAGE:
[camera system aesthetic]
[lens family]
[focal-length progression]
[dolly/orbit/crane/handheld/tracking/FPV/locked behavior]
[focus pull / depth-of-field behavior]

PHYSICAL MOTION:
[weight, inertia, gravity, fabric, hair, water, debris, wheels, footsteps, object contact]

LIGHTING:
[key source + fill + practicals + volumetric behavior + exposure transition]

VFX:
[only physically/narratively motivated particles, atmosphere and energy effects]

CONTINUITY:
Preserve subject identity, wardrobe, product geometry, architecture, screen direction, light direction and prop state unless a listed beat explicitly changes them.

RHYTHM:
[slow reveal -> build -> burst -> impact -> pause -> resolve]

NEGATIVES:
No collage output. No panel borders. No storyboard labels. No random costume changes. No identity drift. No architecture drift. No duplicate subjects. No warped hands/faces/products. No fake text. No unexplained camera teleportation. No floaty physics unless intentionally supernatural.

FINAL HERO FRAME:
Clean 16:9 editorial ad composition when used for a website hero; strong subject separation; clear focal point; protected negative space for live HTML typography/CTA; no generated website headers, buttons or UI baked into the video unless explicitly requested.
```

### Camera grammar for Higgsfield

Do not write vague directions such as `cinematic camera movement` when a precise move is known.

Prefer:

```yaml
camera_grammar_examples:
  reveal:
    - 35mm slow dolly-in through foreground occlusion
    - 50mm lateral slider reveal with shallow parallax
    - 24mm crane-down into hero geography
  intimacy:
    - 75mm controlled push-in with subtle focus pull
    - 100mm macro detail with rack focus from material to logo
  momentum:
    - 28mm low tracking move matching subject speed
    - 35mm orbit that tightens as action escalates
    - 24mm chase move with foreground debris crossing lens
  scale:
    - 18-24mm elevated pullback revealing full environment
    - 32mm rising crane reveal preserving subject center axis
  impact:
    - rapid push-in ending on contact
    - short whip-pan motivated by subject movement
    - speed ramp only around a defined physical beat
  resolve:
    - 50mm stabilized slow pullback into clean hero frame
    - locked-off 65mm closing portrait with environmental motion continuing
```

Use professional camera/lens language when it meaningfully directs the look, for example ARRI Alexa LF/Alexa 65, Sony Venice 2, RED cinema bodies, Cooke Anamorphic, ARRI Signature Prime, Leica Summilux-C, or macro/probe optics. Do not name expensive equipment merely as decoration; connect it to the intended rendering characteristics.

### Multi-axis motion rule

When the selected Higgsfield runtime exposes stacked camera movement, use no more simultaneous axes than the shot can visually justify. Example:

```text
primary: slow dolly forward
secondary: subtle clockwise orbit
tertiary: gentle crane rise
```

The subject action still needs a readable screen direction. Complex camera movement must not hide the commercial or narrative beat.

### Continuous master-shot route

For no-cut sequences:

```yaml
continuous_master_shot:
  hard_rules:
    - one developing camera path
    - no hidden teleport cuts
    - preserve screen axis unless a motivated orbit changes it
    - recurring environment anchors stay in consistent relative positions
    - camera momentum carries through each transformation
    - final state grows out of prior geography
  prompt_language:
    - continuous single shot
    - no cuts
    - no scene transitions
    - same developing camera move
    - physically connected transformation
```

A continuous shot may move from macro -> orbit -> chase -> impact -> pullback, but the camera path must remain physically intelligible.

### Commercial / UGC storyboard route

For fashion, product, outdoor, hospitality, fitness, food, automotive-style product visuals, or local-business campaigns, each panel should answer:

```text
WHAT is the product/service beat?
WHERE is the camera?
WHICH lens/framing sells it?
WHAT physical action demonstrates value?
WHAT light/weather/material response proves quality?
WHAT sound/motion beat would sell the edit?
WHAT changes before the next panel?
```

Use macro product inserts deliberately: zipper, fabric bead, shoe grip, food texture, machinery contact, material stitching, packaging, controls, hands using the service/product. The insert must support the commercial claim rather than exist as random visual variety.

### Website-specific Higgsfield rules

For website media:

1. Protect composition zones for live HTML headings and CTAs.
2. Never bake fake navigation, buttons, forms, or web UI into generated video unless the project explicitly requires an in-world screen.
3. For autoplay heroes, design the opening two seconds to read immediately without sound.
4. Hero video should loop or resolve cleanly when the approved web concept requires looping.
5. Generate a dedicated poster/keyframe from the same reference lineage.
6. Plan desktop crop and mobile crop independently when subject placement is critical.
7. Avoid placing critical text inside generated video; use real HTML for accessibility and responsiveness whenever possible.
8. The closing frame should be usable as a static fallback when practical.

### Higgsfield verification loop

```text
storyboard approved
→ Higgsfield prompt handoff
→ first render
→ compare against panel order and continuity locks
→ identify drift by category
→ repair only the failed category
→ rerender
→ select approved clip
→ create poster/mobile fallback
→ web integration
```

Drift categories:

```yaml
higgsfield_drift:
  identity:
  wardrobe_product:
  architecture:
  camera:
  action:
  physics:
  lighting:
  typography_brand:
  continuity:
  final_hero_frame:
```

Do not regenerate blindly when one category failed. Preserve successful categories and target the repair.

## 8.5 Seedance prompt contract

For each video job, create:

1. Asset bindings — explicitly map each image/video/audio reference to its role.
2. One-sentence visual summary — subject + place + event + style + camera.
3. Shot sequence/timeline — timestamps or shot numbers.
4. Camera/lens/movement notes where useful.
5. Subject/action continuity instructions.
6. Lighting/color/material direction.
7. Audio/dialogue instructions if relevant.
8. Output role — hero loop, scroll scrub, transition, section ambient, product turn, etc.
9. Web integration note — crop, focal point, poster, mobile fallback, frame extraction.

### Control-mode routing

```yaml
seedance_control:
  storyboard:
    use_when: high-level story progression and creative latitude are acceptable
  keyframes:
    use_when: visual alignment to specific states is important
  first_last_frame:
    use_when: start and end states must be controlled
  motion_reference:
    use_when: action/camera behavior must follow an existing motion example
  subject_reference:
    use_when: identity/object consistency matters
```

When strict alignment matters, prefer independent keyframes over assuming a multi-panel storyboard will be followed frame-for-frame.

For storyboard-driven Seedance generations, use the same blueprint language as the Higgsfield handoff: follow panel order, staging, camera logic, timing rhythm, composition, action beats, and motion continuity; do not interpret the uploaded board as one collage image.

Do not overload storyboards. Keep them logically clean, avoid excessive text, and route complex sequences to keyframes or chained clips.

## 8.6 Hero continuity

For subject/product/place continuity:

```text
approved client reference OR generated anchor image
→ reuse as subject/style reference
→ generate hero motion
→ QC identity/geometry/materials
→ generate supporting clips using the same reference lineage
```

For journey sequences:

```text
clip 1 final state
→ continuity frame/keyframe
→ clip 2
→ continuity frame/keyframe
→ clip 3
```

Do not rely on continuity claims without visual QC.

## 8.7 Scroll film

For scroll-scrub media:

```text
video source
→ optimized source
→ frame extraction (FFmpeg or verified equivalent)
→ responsive frame strategy
→ canvas/image-sequence implementation
→ ScrollTrigger/progress binding
→ preload strategy
→ poster/fallback
→ memory/performance QA
```

Never send a massive unoptimized frame sequence to mobile by default.

---

# 9. Media Performance Tiers

```yaml
media_tiers:
  TIER_0_STATIC:
    use: performance-first or media-poor builds
    hero: optimized still
  TIER_1_LIGHT_MOTION:
    use: typical SMB
    hero: optimized short loop or still + CSS/GSAP
  TIER_2_CINEMATIC_VIDEO:
    use: enhanced/cinematic sites
    hero: optimized short video with poster and mobile policy
  TIER_3_SCROLL_FILM:
    use: premium narrative/product experiences
    hero: frame sequence/canvas only after performance approval
  TIER_4_INTERACTIVE_3D:
    use: flagship only
    hero: WebGL/3D with strict fallback and device gating
```

Every video asset needs:

- poster
- dimensions/aspect
- encoded variants where needed
- focal point
- loading policy
- muted autoplay compatibility if autoplayed
- mobile policy
- reduced-motion policy
- fallback

No critical conversion path may depend on video/audio playback.

---

# 10. Universal Voice Agent — Mandatory

Every website created by the factory must ship with a configured voice-agent capability unless the operator explicitly disables it for legal/compliance reasons.

Route to `vapi-orchestrator` (production-ready today) or `sa-voice-agent-builder` (Gemini
Flash Live direct-API path — roadmapped, check its `Status` field before use). Resolve to
whichever is actually live rather than hardwiring to one; both consume the same manifest
below.

Minimum manifest:

```yaml
voice_agent:
  required: true
  business_identity:
  use_cases:
    - receptionist
    - lead_capture
    - faq
    - booking
  language:
  business_hours:
  services:
  service_area:
  knowledge_sources: []
  qualification_rules: []
  booking_rules: []
  escalation_rules: []
  transfer_target:
  crm_target:
  calendar_target:
  sms_target:
  voice_dna:
  realtime_model_alias: gemini_flash_live
  tts_model_alias: gemini_flash_tts
  tts_voice:
  tts_style:
  failure_fallback:
```

Production separation:

- Real-time conversation/function calling uses the configured live conversational runtime.
- Gemini 3.1 Flash TTS is the standardized controllable text-to-audio voice synthesis layer when TTS synthesis is required.
- Do not treat a TTS-only model as a function-calling conversational brain.
- Agent tools must be allowlisted.
- Never invent prices, policies, availability, medical/legal advice, or unsupported business facts.
- Human transfer and failure fallback are mandatory.

Voice QA is part of site completion.

---

# 11. Platform Adapter Layer

The design intelligence is platform-independent. Implementation is platform-aware.

Before build, resolve:

```yaml
platform_adapter:
  target:
  capabilities_verified: []
  limitations_verified: []
  deployment_access:
  cms_strategy:
  forms_strategy:
  custom_code_strategy:
  motion_strategy:
  media_strategy:
  voice_widget_strategy:
  analytics_strategy:
```

## 11.1 Code-first adapter

Preferred for the highest implementation control.

Possible stacks include Next.js/React/Vite/static stacks as approved by the project.

Use semantic components, reusable motion modules, server-side secrets, proper env handling, code splitting, optimized assets, and deploy-specific verification.

## 11.2 Framer adapter

Use when Framer is the approved target.

- preserve responsive layout semantics
- prefer native capabilities where they meet the design
- use code components/custom code only when required
- verify all breakpoints/interactions in the actual Framer output
- do not claim unsupported native features

## 11.3 Wix Studio / Velo adapter

Use native Wix Studio layout/CMS/forms where appropriate; use Velo/custom code for approved functionality requiring it. Verify behavior in the actual Wix environment and published/preview state. Do not translate code-first assumptions blindly into Wix.

## 11.4 Webflow adapter

Use native CMS/interactions where appropriate; custom code only when necessary and supported. Verify published behavior, breakpoints, forms, CMS bindings, and motion performance.

## 11.5 Shopify adapter

No dedicated ecommerce/Shopify skill exists in this repo yet — apply this adapter's rules
directly rather than routing to a specialist that isn't shipped. Preserve product/cart/checkout
boundaries, theme architecture, accessibility, performance, and data integrity. Never ship
demo-cart behavior as production checkout. Flag the missing specialist to the operator instead
of improvising checkout/payment logic beyond what's stated here.

## 11.6 WordPress / Elementor adapter

Use native CMS/theme structure and approved page-builder/custom-code strategy. Place custom motion and interaction code in maintainable locations rather than uncontrolled inline fragments. Verify plugin/theme conflicts.

## 11.7 Figma adapter

Figma is a design/handoff target, not proof of a deployed website. Route to
`sa-figma-framer-spline` (token extraction + Framer Motion + Spline) or `penpot`
(self-hosted design tooling) for high-fidelity design artifacts, then return a universal
build handoff to `cinematic-website-builder` or this skill's other platform adapters.

## 11.8 Google Stitch adapter

Stitch is a design/prototyping route, not a universal mandatory step. Use only in the Google design lane or explicit operator request. Respect the configured daily Stitch budget.

## 11.9 Unknown/other platforms

Perform capability discovery. Use official documentation/tools when details are unstable. If the platform cannot satisfy the approved experience, report the conflict and route to an alternative implementation plan instead of pretending parity.

---

# 12. Build Manifest

Create `build-manifest.yaml` before implementation.

```yaml
build:
  job_id:
  client_id:
  mode:
  platform:
  primary_builder:
  quality_tier:
  routes: []
  components: []
  integrations: []
  motion_modules: []
  interaction_modules: []
  media_slots: []
  voice_agent_required: true
  analytics:
  seo:
  schema_markup:
  forms:
  booking:
  crm:
  deployment_target:
  acceptance:
    visual_score:
    functional_tests: []
    accessibility:
    performance:
    browser_matrix: []
    viewports: []
```

---

# 13. Implementation Plan and Ownership

Before coding, create `implementation-plan.md`.

Every task:

```yaml
task:
  id:
  goal:
  owner:
  owned_paths: []
  prerequisites: []
  expected_files: []
  skill_routes: []
  verification_command:
  screenshot_state:
  completion_evidence:
```

No two concurrent writers may own the same path.

The primary builder returns:

- files changed
- tests run
- unresolved issues
- screenshots/evidence requested
- integration notes

A second model may review or rescue; it does not silently overwrite the primary owner's work.

---

# 14. Copy and SEO Quality

Copy must be client-specific and evidence-based.

Prohibit:

- generic AI slogans repeated across sites
- invented awards/reviews/stats
- fake urgency
- fabricated locations/services
- keyword stuffing
- placeholder testimonials in production
- meaningless "innovative solutions" filler

Required:

- one clear primary value proposition
- scannable service/product hierarchy
- location/service relevance where applicable
- proper headings and metadata
- internal linking where appropriate
- structured data only when facts support it
- accessible descriptive labels

Anti-slop copy rules may be merged from existing Space Age writing skills rather than loading multiple writer personas.

---

# 15. Browser Verification Harness

At minimum capture these viewport classes unless the target demands more:

```text
desktop:      1440×1000
laptop:       1280×800
tablet:       768×1024
mobile:       390×844
small mobile: 360×800
```

For each critical route/state capture:

1. top viewport
2. critical middle sections
3. primary CTA/form/booking state
4. footer
5. open navigation
6. important hover/click/scroll states
7. reduced-motion state when motion is substantial

Record:

- console errors
- page errors
- failed network requests
- broken images/video
- horizontal overflow
- inaccessible controls where detectable
- screenshot filename/timestamp
- voice widget state

A single full-page screenshot is not adequate proof for a motion-led website.

---

# 16. Mandatory Visual Loop

Every site gets three passes.

## Pass 1 — Defect Discovery

Render first. Identify visible failures without defending the implementation.

## Pass 2 — Correction

Fix blocking and important defects. Re-render the same states.

## Pass 3 — Deliberate Refinement

Improve at least one meaningful area:

- hierarchy
- brand distinction
- typography
- conversion clarity
- media crop/continuity
- motion continuity
- responsive composition
- simplification where complexity hurts quality

Retain before/after evidence and change log.

---

# 17. Visual QA Rubric

Score:

```yaml
visual_qa:
  five_second_comprehension:
  focal_hierarchy:
  brand_distinction:
  typography:
  spacing_rhythm:
  media_integrity:
  section_pacing:
  motion_purpose:
  interaction_quality:
  cta_prominence:
  mobile_composition:
  conversion_clarity:
  originality:
  ai_slop_absence:
```

Feedback must be concrete.

Bad: `Make the hero stronger.`

Good: `At 390 px the headline wraps to six lines and pushes the primary CTA below the first viewport. Reduce display size, tighten measure, and preserve CTA visibility.`

---

# 18. Functional QA

Where applicable test:

- navigation and routes
- forms and validation
- booking entry and confirmation boundary
- CRM/lead submission boundary
- modal/dialog behavior
- keyboard navigation
- media controls
- carousel/gallery controls
- API success/loading/error states
- analytics events
- consent behavior
- ecommerce behavior
- voice widget open/close/connect/fallback

Never claim an external service works because its frontend shell renders.

---

# 19. Accessibility

Minimum:

- semantic landmarks
- correct heading order
- keyboard-only navigation
- visible focus
- labels/errors for forms
- contrast review
- meaningful alt text
- text zoom resilience
- reduced motion
- no cursor-only functionality
- dialog focus handling
- captions/transcripts where media context requires them

Record unresolved violations.

---

# 20. Performance

Measure when tooling exists; do not estimate scores.

Track:

- LCP
- CLS
- interaction metric available to tooling
- transferred bytes
- JavaScript bytes
- image/video/3D weight
- request count
- long tasks
- animation/WebGL performance on target class

The project manifest owns the target budgets.

Media downgrade path:

```text
interactive 3D
→ scroll film
→ cinematic video
→ light motion
→ optimized still
```

If a cinematic technique violates the approved performance budget on target devices, downgrade the technique before downgrading usability.

---

# 21. Security and Integrity

Check:

- exposed secrets
- unsafe env files
- copied client analytics IDs
- unsafe HTML injection
- form spam controls
- dependency vulnerabilities when tooling exists
- external asset authorization/licensing
- external link rel behavior
- server/client secret boundaries
- tool permissions for voice agents

Never place provider secrets in client-side code.

---

# 22. Voice QA

Every site has a voice QA state.

Test:

- greeting uses correct business identity
- correct hours/services/service area
- FAQ grounding
- lead capture
- booking/tool boundary
- human transfer
- unsupported question fallback
- interruption/recovery behavior where live runtime supports it
- TTS voice/style consistency
- latency/failure fallback
- transcript/log policy
- no invented business facts

Voice failure does not necessarily block a static website preview, but it blocks a `complete` factory status when voice is mandatory.

---

# 23. Failure and Rescue

Trigger rescue when:

- same test fails twice
- same runtime error occurs twice
- same visual defect survives two targeted fixes
- builder changes unrelated files
- browser capture hangs twice
- technology cannot meet the approved handoff
- media generation repeatedly violates identity/geometry requirements
- voice tool calling repeatedly fails a required workflow

Rescue bundle:

```text
GOAL
CURRENT STATE
EXACT FAILURE
ATTEMPTS
FILES + DIFF
COMMAND OUTPUT
SCREENSHOTS
MEDIA REFERENCES
VOICE LOGS WHEN RELEVANT
ENVIRONMENT
CONSTRAINTS
EXPECTED RESULT
```

Rescue may change implementation approach. It must not silently change the approved strategy.

---

# 24. Completion Gate

A website is complete only when:

- required routes render
- approved content is present
- primary conversion works to the implemented boundary
- mandatory voice-agent integration passes its required boundary
- no blocking console/page/network errors remain
- critical viewports pass
- visual score reaches project threshold
- motion has mobile and reduced-motion behavior
- accessibility status is recorded
- performance status is recorded
- media fallbacks exist
- secrets scan is clean
- final screenshots/evidence exist
- unresolved issues are disclosed
- deployment is verified when deployment was requested and access is available

Do not use `production-ready`, `fully tested`, `pixel perfect`, or `deployed` unless evidence supports the claim.

---

# 25. Delivery Package

```text
delivery/
├── source/
├── job-manifest.yaml
├── business-dna.yaml
├── site-dna.yaml
├── handoff.yaml
├── build-manifest.yaml
├── asset-manifest.yaml
├── voice-agent-manifest.yaml
├── implementation-plan.md
├── source-ledger.yaml
├── asset-ledger.yaml
├── tests/
├── qa/
│   ├── visual-scorecard.yaml
│   ├── accessibility-report.md
│   ├── performance-report.md
│   ├── console-network-report.md
│   ├── voice-agent-report.md
│   └── screenshots/
├── deployment-report.md
└── unresolved-issues.md
```

---

# 26. Hermes Job State

```text
DISCOVERED
→ QUALIFIED
→ STRATEGY_PENDING
→ DNA_READY
→ MEDIA_PENDING
→ BUILD_PENDING
→ BUILDING
→ MEDIA_READY
→ VOICE_PENDING
→ VOICE_READY
→ INTEGRATING
→ QA_PENDING
→ QA_FAILED / REPAIRING
→ QA_PASS
→ PREVIEW_DEPLOYED
→ APPROVAL_PENDING
→ PRODUCTION_DEPLOYED
```

Hermes should emit operator attention only for meaningful exceptions, approvals, quota/cost warnings, or completed review-ready work.

---

# 27. Factory Telemetry

Record per site:

```yaml
telemetry:
  builder:
  site_type:
  platform:
  build_duration:
  incremental_cost:
  first_pass_qa_score:
  final_qa_score:
  repair_count:
  visual_score:
  mobile_score:
  performance_status:
  voice_qa_status:
  human_intervention_count:
  close_or_conversion_outcome:
```

Use this data to update model routing. Do not assume expensive models are better.

---

# 28. Operator Behavior

Do the work first.

Operator updates contain only:

- current phase
- blocking issue
- decision required if any
- completed artifact/link

Do not bury incomplete work under explanations of what could be done.

---

# 29. Source Lineage and Repo Cross-Reference

This v6 architecture routes and consolidates logic from the Space Age library. Cross-checked
against this repo's actual `skills/` directory as of 2026-08-14:

| Lineage source | Resolves to in this repo | Status |
|---|---|---|
| SpaceAge_Cinematic_Website_Builder_v5 | `cinematic-website-builder` | present, live |
| SpaceAge_SAVO_CreativeDirector_OS | `spaceage-savo-creative-director-os` | present, live |
| SpaceAge_UIUXDesigner_SKILL | `ui-ux-designer` (+ `ui-ux-pro-max`) | present, live |
| SA_WebsiteTypeRoutingMatrix_SKILL | — | **not present** — apply Section 5.3 manually |
| SA_PatternGenomeLibrary_SKILL | — | **not present** — apply Section 5.3 manually |
| award-winning-web-designer skill | `design-taste-frontend`, `ui-ux-pro-max` | present, live |
| Fable5 / Higgsfield cinematic prompt patterns | Sections 7-9 of this skill + Higgsfield MCP tools | present, live — this file is the canonical home |
| official Seedance prompting guidance | Section 8.5 of this skill | present, live |
| SA_GSAPMotionLibrary_SKILL | `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-supercharged` | present, live |
| hover/cursor effect source material | `design-motion-principles` | present, live |
| Higgsfield Master + MCP integration + asset automation | `mcp__Higgsfield__*` MCP tools | tool present; no repo skill wrapper |
| voice-agent builder/deep skills | `vapi-orchestrator` (live), `sa-voice-agent-builder` (roadmapped) | partially present |
| Playwright/browser automation | `browserbase-scraper`, plus `cinematic-website-builder`'s own Playwright QA integration | present, live |
| design-loop | Sections 15-17 of this skill | present, live — this file is the canonical home |
| diagnose/autonomous-loop concepts | Section 23 of this skill | present, live — this file is the canonical home |
| codebase intelligence | — | **not present** — read the codebase directly |
| platform-specific routed skills (Figma/Wix/Framer/etc.) | Section 11 of this skill, `sa-figma-framer-spline`, `penpot` | partially present |
| operator-supplied storyboard/panel templates | Section 8.3 of this skill | present, live — this file is the canonical home |

Unique logic should be merged into the canonical owner listed above. Duplicate standalone
skills should be archived only after a diff confirms nothing unique is lost. Rows marked
**not present** are genuine gaps in this repo, not routing errors in this skill — do not
silently assume they exist, and do not block a build on them; apply the fallback noted.
