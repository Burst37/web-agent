---
name: ui-ux-design-system
description: Standalone design token library and hero archetype system. Use independently for design sprints, brand audits, Figma specs, or design-only consultation. Outputs reusable design specifications (color palettes, typography scales, effect specs, component mappings) that feed cinematic-website-builder, Canva, or any frontend tool. Covers 6 scientifically-designed hero patterns with full token export capability.
category: Design
---

# UI/UX Design System

Design tokens as single-source-of-truth. Every decision is a token — colors → CSS variables, typography → font stacks + scales, effects → GSAP module references + timing specs. No code assumptions; output formats are JSON, YAML, and human-readable specs.

## Trigger Patterns

- `"Design a hero for [brand]"` → run Archetype Selection
- `"What colors should I use?"` → output color palette as JSON
- `"Show me 3 design directions"` → run 3 archetypes in parallel
- `"Give me a Figma design tokens file"` → export Figma tokens JSON
- Auto-invoked by `cinematic-website-builder` → run all phases silently

## Phase 1: Archetype Selection

Score each of the 6 archetypes against the user's keywords, industry, and emotional intent. Report the winner with confidence %, 1-2 alternatives, and rationale. Ask for approval before proceeding unless auto-invoked.

**Scoring signals:**
- Gaming / sports / streaming / energy → RED_EXPLOSIVE
- SaaS / fintech / crypto / enterprise → BLUE_TECH
- NFT / creative / music / meditation → PURPLE_MYSTIC
- Design agencies / dev tools / startups / edtech → LIME_GREEN_GENIUS
- Luxury / premium / gallery / portfolio → GOLD_CINEMATIC
- Lifestyle / mental health / indie games / youth → PINK_SURREAL

## The 6 Hero Archetypes

### RED_EXPLOSIVE ⚡
**Emotion:** Aggression, power, urgency | **Speed:** Fast (0.3–0.6s)

```json
{
  "colors": { "primary": "#FF3333", "secondary": "#CC0000", "accent": "#FF6600", "background": "#0F0F0F", "text": "#FFFFFF", "highlight": "#FFAA00" },
  "typography": { "headline": { "font": "Inter, system-ui", "weight": 900, "size": "clamp(3.5rem, 10vw, 8rem)", "tracking": "-0.02em", "transform": "uppercase" }, "subtext": { "weight": 400, "size": "1.2rem", "tracking": "0.05em" } },
  "effects": ["Module_05_Glow_Flare (#FF6600, high)", "Module_09_Scale_Pulse (subtle, 3s loop)", "Module_16_Glitch (minimal, 2px)", "Module_23_Blur_Reveal"],
  "motion": { "easing": "power3.out", "easing_css": "cubic-bezier(0.16, 1, 0.3, 1)", "scrub": 1.5 },
  "lighting": "Hard side key (45°, 3200K) + orange/red rim + volumetric haze. Ref: Denis Villeneuve",
  "css_variables": { "--color-primary": "#FF3333", "--color-secondary": "#CC0000", "--color-accent": "#FF6600", "--color-bg": "#0F0F0F", "--color-text": "#FFFFFF", "--color-highlight": "#FFAA00", "--transition-speed": "0.3s", "--easing": "cubic-bezier(0.16, 1, 0.3, 1)" }
}
```

### BLUE_TECH 🔷
**Emotion:** Trust, intelligence, precision | **Speed:** Medium (0.6–1s)

```json
{
  "colors": { "primary": "#00A8E8", "secondary": "#0066CC", "accent": "#00D4FF", "background": "#0A1428", "text": "#E8F4F8", "highlight": "#FFD700" },
  "typography": { "headline": { "font": "Inter, 'JetBrains Mono'", "weight": 700, "size": "clamp(3rem, 9vw, 7.5rem)", "tracking": "-0.01em" }, "subtext": { "font": "'JetBrains Mono', monospace", "weight": 300, "tracking": "0.08em" } },
  "effects": ["Module_12_Digital_Rain (#00D4FF, medium)", "Module_19_Hologram (#00A8E8, high)", "Module_01_Text_Mask_Reveal (#00D4FF)", "Module_27_Grid_Overlay (0.3 opacity)"],
  "motion": { "easing": "quad.inOut", "easing_css": "cubic-bezier(0.25, 0.46, 0.45, 0.94)", "scrub": 0.8 },
  "lighting": "Soft three-point: key 30°, cyan fill 120°, hard cyan rim 90°. Ref: Ridley Scott",
  "css_variables": { "--color-primary": "#00A8E8", "--color-secondary": "#0066CC", "--color-accent": "#00D4FF", "--color-bg": "#0A1428", "--color-text": "#E8F4F8", "--color-highlight": "#FFD700", "--transition-speed": "0.6s", "--easing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
}
```

### PURPLE_MYSTIC 🔮
**Emotion:** Creativity, mystery, transformation | **Speed:** Slow (0.8–1.5s)

```json
{
  "colors": { "primary": "#A855F7", "secondary": "#7C3AED", "accent": "#EC4899", "background": "#1A0F2E", "text": "#F3E8FF", "highlight": "#A78BFA" },
  "typography": { "headline": { "font": "Playfair Display, serif", "weight": 800, "size": "clamp(3.2rem, 9.5vw, 8rem)", "style": "italic", "tracking": "-0.01em" }, "subtext": { "weight": 300, "size": "1.15rem", "tracking": "0.03em", "style": "italic" } },
  "effects": ["Module_06_Shimmer_Field (#A855F7+#EC4899, high)", "Module_11_Liquid_Blur (medium)", "Module_14_Color_Shift (360deg, 4s loop)", "Module_20_Depth_Fog (#A855F7, 0.4)"],
  "motion": { "easing": "quad.in / cubic.out", "easing_css": "cubic-bezier(0.42, 0, 0.58, 1)", "scrub": 1.2 },
  "lighting": "Diffuse overhead 45° + purple/magenta practicals + RGB pink/blue separation. Ref: Wong Kar-wai",
  "css_variables": { "--color-primary": "#A855F7", "--color-secondary": "#7C3AED", "--color-accent": "#EC4899", "--color-bg": "#1A0F2E", "--color-text": "#F3E8FF", "--color-highlight": "#A78BFA", "--transition-speed": "0.8s", "--easing": "cubic-bezier(0.42, 0, 0.58, 1)" }
}
```

### LIME_GREEN_GENIUS ✨
**Emotion:** Innovation, boldness, challenge | **Speed:** Fast+Responsive (0.3–0.8s)

```json
{
  "colors": { "primary": "#84CC16", "secondary": "#65A30D", "accent": "#000000", "background": "#F5F5F5", "text": "#0F0F0F", "highlight": "#1A1A1A" },
  "typography": { "headline": { "font": "Inter, system-ui", "weight": 900, "size": "clamp(3.5rem, 10vw, 8.5rem)", "tracking": "-0.03em" }, "subtext": { "font": "'JetBrains Mono', monospace", "weight": 500, "size": "1.1rem", "tracking": "0.02em" } },
  "effects": ["Module_08_Spotlight_Follow (#84CC16, high)", "Module_24_Scramble_Text (medium)", "Module_13_Neon_Glow (#84CC16, high)", "Module_04_Magnetic_Button (elastic physics)"],
  "motion": { "easing": "back.out / elastic.out", "easing_css": "cubic-bezier(0.34, 1.56, 0.64, 1)", "scrub": 1.0 },
  "lighting": "High-key natural light, minimal shadows, clean industrial. Ref: Spike Jonze",
  "css_variables": { "--color-primary": "#84CC16", "--color-secondary": "#65A30D", "--color-accent": "#000000", "--color-bg": "#F5F5F5", "--color-text": "#0F0F0F", "--color-highlight": "#1A1A1A", "--transition-speed": "0.3s", "--easing": "cubic-bezier(0.34, 1.56, 0.64, 1)" }
}
```

### GOLD_CINEMATIC 👑
**Emotion:** Luxury, craftsmanship, aspiration | **Speed:** Elegant (1.0–1.8s)

```json
{
  "colors": { "primary": "#D4AF37", "secondary": "#B8860B", "accent": "#F5DEB3", "background": "#1A1410", "text": "#F0EDE5", "highlight": "#FFF8DC" },
  "typography": { "headline": { "font": "Playfair Display, serif", "weight": 700, "size": "clamp(3rem, 8.5vw, 7.5rem)", "tracking": "-0.02em" }, "subtext": { "font": "Garamond, serif", "weight": 300, "size": "1.05rem", "tracking": "0.1em" } },
  "effects": ["Module_03_Layered_Zoom_Parallax (3 layers, medium)", "Module_21_Film_Grain (35mm Kodak Vision3, subtle)", "Module_17_Soft_Focus_Reveal (3s)", "Module_25_Fade_In_Cascade (0.2s stagger)"],
  "motion": { "easing": "sine.inOut", "easing_css": "cubic-bezier(0.45, 0.05, 0.55, 0.95)", "scrub": 0.6 },
  "lighting": "Soft three-point (key 30°, golden fill 120°, strong rim 180°), 35mm grain, 3200K warm. Ref: Bradford Young",
  "css_variables": { "--color-primary": "#D4AF37", "--color-secondary": "#B8860B", "--color-accent": "#F5DEB3", "--color-bg": "#1A1410", "--color-text": "#F0EDE5", "--color-highlight": "#FFF8DC", "--transition-speed": "1.0s", "--easing": "cubic-bezier(0.45, 0.05, 0.55, 0.95)" }
}
```

### PINK_SURREAL 🌸
**Emotion:** Playfulness, emotion, surrealism | **Speed:** Dynamic (0.5–1.2s)

```json
{
  "colors": { "primary": "#FF1493", "secondary": "#FF69B4", "accent": "#00FFFF", "background": "#0F0F0F", "text": "#FFFFFF", "highlight": "#00FF88" },
  "typography": { "headline": { "font": "Poppins, Outfit, sans-serif", "weight": 800, "size": "clamp(3.2rem, 9vw, 7.8rem)", "tracking": "-0.01em" }, "subtext": { "weight": 400, "size": "1.15rem", "tracking": "0.05em" } },
  "effects": ["Module_10_Color_Shift_Bloom (#FF1493↔#00FFFF, 4s loop)", "Module_06_Shimmer_Field (#FF1493+#00FFFF, high)", "Module_18_Morphing_Shape (medium)", "Module_22_Chromatic_Aberration (subtle)"],
  "motion": { "easing": "back.inOut / power2.inOut", "easing_css": "cubic-bezier(0.68, -0.55, 0.265, 1.55)", "scrub": 1.3 },
  "lighting": "Saturated LED (hot pink + cyan), extreme color contrast, soft subject diffusion. Ref: Harmony Korine",
  "css_variables": { "--color-primary": "#FF1493", "--color-secondary": "#FF69B4", "--color-accent": "#00FFFF", "--color-bg": "#0F0F0F", "--color-text": "#FFFFFF", "--color-highlight": "#00FF88", "--transition-speed": "0.5s", "--easing": "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
}
```

## Phase 2: Token Export

Output the selected archetype's full token bundle in the requested format. Default to JSON + CSS variables together.

**Formats:**
- `JSON` — dev-ready, includes all tokens + module list
- `CSS` — `:root { --color-primary: ...; }` variables block
- `YAML` — human-readable for stakeholders
- `Figma` — `{ "colors": { "primary": { "value": "#...", "type": "color" } } }` plugin-ready

## Phase 3: Brand Customization (if brand tokens provided)

When existing brand colors are provided (from brand-extractor or user):
1. Select the closest archetype as the framework
2. Override `primary` and `accent` with brand colors; keep archetype's secondary/bg/effects
3. Label the result `[ARCHETYPE]_CUSTOM` (e.g., `BLUE_TECH_CUSTOM`)
4. Return a before/after token comparison showing what changed vs. what was preserved

## Design Sprint Mode (3 Archetypes Parallel)

When user requests multiple directions, run 3 archetypes simultaneously. For each, output:
- Color palette (6 swatches with hex + use-case)
- Typography specimen (headline size + weight + font)
- Top 2 GSAP effect modules with timing
- One-line emotional pitch
- Recommend: "Approve A, B, or C? Or want a hybrid?"

## Component Mapping

```json
{
  "hero_section": { "modules": ["Module_01_Text_Mask_Reveal", "Module_03_Layered_Zoom_Parallax", "Module_05_Glow_Flare"], "layout": "Full-screen, centered text overlay" },
  "feature_section": { "modules": ["Module_02_Sticky_Stack_Narrative", "Module_04_Magnetic_Button"], "layout": "Two-column sticky-left / scroll-right" },
  "call_to_action": { "modules": ["Module_04_Magnetic_Button", "Module_10_Color_Shift_Bloom"], "layout": "Physics-based hover snap to cursor" }
}
```

## Output

Return a structured token bundle containing:
1. Selected archetype name + confidence score
2. Full color tokens (hex, RGB, use-case per token)
3. Typography spec (font family, weight, size using `clamp()`, tracking)
4. Effect modules list with timing/intensity
5. Motion profile (speed, easing, scrub value)
6. CSS variables block (ready to paste into `:root {}`)
7. Lighting philosophy + cinematographer reference

If invoked by cinematic-website-builder, return the JSON bundle directly — skip approval prompt and narrative.
