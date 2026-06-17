---
name: cinematic-website-builder
description: Orchestrator skill that auto-composes ui-ux-design-system, brand-extractor, cinematic-prompt-director, and frontend-design into a complete hero section package. Use for any request to build, design, or redesign a landing page hero. Outputs production-ready HTML + design spec JSON + AI focal image prompt.
category: Design
---

# Cinematic Website Builder

Primary orchestrator for hero section generation. Auto-invokes sub-skills in sequence; user gets a complete package in one request.

## Trigger Patterns

- `"Build a landing page for [client]"`
- `"Create a hero section"`
- `"Redesign my homepage"`
- `"Build a hero for my [industry] [brand]"`

## Composition Pipeline

```
User Request
    ↓
cinematic-website-builder (orchestrator)
    ├→ brand-extractor       (if URL provided)
    ├→ ui-ux-design-system   (always — archetype + design tokens)
    ├→ cinematic-prompt-director (if focal image needed)
    └→ frontend-design       (HTML code generation)
    ↓
Complete Package: HTML + design spec + AI prompt + integration notes
```

## Phase 1: Request Analysis

Parse the user's request for:
- **Industry/vertical** → informs archetype scoring in ui-ux-design-system
- **Client URL** → triggers brand-extractor before design system
- **Emotional keywords** → pass to ui-ux-design-system as scoring signals
- **Deliverable type** → design-only vs. code vs. full package

## Phase 2: Brand Extraction (if URL provided)

Call `brand-extractor` with the URL. Extract:
- Current primary/secondary/accent colors
- Typography stack (font families in use)
- Visual vibe (conservative, playful, techy, luxurious, etc.)
- Detected archetype affinity

Pass brand token package to ui-ux-design-system as override input.

## Phase 3: Design Token Generation

Call `ui-ux-design-system` with:
- Industry + emotional keywords from user request
- Brand tokens from brand-extractor (if available)

Receive: full archetype token bundle (colors, typography, effects, CSS variables, motion profile).

If brand tokens were provided, the design system returns a `[ARCHETYPE]_CUSTOM` hybrid — brand colors preserved, archetype effects applied.

## Phase 4: Focal Image Prompt (if hero image needed)

Call `cinematic-prompt-director` with:
- Selected archetype name
- Industry + brand context from user request

Receive: 180–250 word ultra-detail AI image prompt, platform-tagged (Kling 3.0 / NanoBanana Pro / Midjourney).

## Phase 5: HTML Code Generation

Call `frontend-design` with:
- Full design token bundle (colors, typography, CSS variables)
- GSAP module list from archetype
- Focal image placeholder `{{ hero_image_url }}`

Receive: single-file production HTML with:
- `:root {}` CSS variables injected from tokens
- Hero section (full-screen, responsive)
- GSAP animations wired to archetype modules
- Magnetic CTA button
- Responsive breakpoints via `clamp()`

## Output Package

Deliver 4 files to the user:

**1. `[project]-hero.html`** — Production-ready single-file HTML
```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      :root {
        --color-primary: [from tokens];
        --color-accent: [from tokens];
        --easing: [from tokens];
      }
    </style>
  </head>
  <body>
    <section class="hero">
      <img src="{{ hero_image_url }}" />
      <!-- GSAP animations -->
    </section>
  </body>
</html>
```

**2. `design-spec-[ARCHETYPE].json`** — Full token bundle
```json
{
  "archetype": "RED_EXPLOSIVE",
  "confidence": 0.95,
  "colors": { "primary": "#FF3333", ... },
  "gsap_modules": ["Module_05_Glow_Flare", ...],
  "css_variables": { "--color-primary": "#FF3333", ... },
  "motion_profile": { "speed": "fast", "easing": "power3.out" }
}
```

**3. `focal-image-prompt.txt`** — Ready to paste into AI image generator
- Platform-tagged (Kling 3.0 / NanoBanana Pro)
- 180–250 words with camera, lighting, color science, emotional intent
- Copy/paste ready

**4. `integration-notes.md`** — 3-step user workflow
1. Generate focal image from prompt → save as `hero-character.jpg`
2. Replace `{{ hero_image_url }}` in HTML with image path
3. Deploy → live

## Design Sprint Mode (No Code)

When user asks for design directions only ("Show me 3 options"):
- Skip frontend-design and cinematic-prompt-director
- Run ui-ux-design-system in 3-archetype parallel mode
- Return 3 design spec bundles with color swatches, typography, and effect list
- Prompt: "Approve A, B, or C? Or want a hybrid?"

## Brand Refresh Mode (URL provided)

When user asks to modernize an existing site:
1. brand-extractor analyzes current brand
2. ui-ux-design-system returns side-by-side token comparison (before/after)
3. Present: "Current design vs. modernized [ARCHETYPE] — preserving your [colors]"
4. On approval, proceed to code generation

## Custom Hybrid Archetypes

When user requests a mix (e.g., "BLUE_TECH colors + RED_EXPLOSIVE effects"):
- Pass hybrid request to ui-ux-design-system
- Receive one-off archetype bundle labeled `[A]_[B]_HYBRID`
- Proceed with hybrid tokens through the rest of the pipeline

## Error Handling

- **Ambiguous archetype** (two archetypes within 10% confidence): present 2-option choice to user before proceeding
- **No URL but brand colors mentioned**: treat as manual brand-extractor input, pass colors directly to design system
- **Design-only request**: skip frontend-design, return spec + prompt only
