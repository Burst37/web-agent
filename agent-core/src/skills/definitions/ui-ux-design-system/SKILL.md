---
name: ui-ux-design-system
description: >
  Standalone design token library and hero archetype system. Use independently for design sprints,
  brand audits, Figma specs, design-only consultation. Outputs reusable design specifications
  (color palettes, typography scales, effect specs, component mappings) that feed
  cinematic-website-builder or any frontend tool. Covers 6 scientifically-designed hero patterns
  (RED_EXPLOSIVE, BLUE_TECH, PURPLE_MYSTIC, LIME_GREEN_GENIUS, GOLD_CINEMATIC, PINK_SURREAL)
  plus full design token export in JSON, YAML, CSS variable, and Figma formats.
category: Design
---

# UI/UX Design System

Design-token-first hero section architect. Every decision is a token (color, type, effect, motion). No code assumptions — output flows to `cinematic-website-builder`, Figma, Canva, or any frontend.

## When to use

- User asks "Design a hero for [brand]" → run Phase 1 (archetype selection)
- User asks "What colors should I use?" → output color palette as JSON
- User asks "Show me 3 design directions" → run all 3 archetypes in parallel
- User asks for a Figma-ready or dev-ready design spec → export full token package
- Auto-invoked by `cinematic-website-builder` → run all phases, return token bundle

## Phase 1 — Archetype Selection

Score all 6 archetypes against user keywords. Return the top pick (≥90% = decisive, 70–89% = recommend with alternatives, <70% = present top 2 and ask).

| Archetype | Emotion | Best For | Primary Color | Motion |
|-----------|---------|----------|---------------|--------|
| RED_EXPLOSIVE | Aggression, Power, Urgency | Gaming, Streaming, Sports | #FF3333 | Fast (0.3–0.6s) |
| BLUE_TECH | Trust, Intelligence, Precision | SaaS, Fintech, Enterprise | #00A8E8 | Medium (0.6–1s) |
| PURPLE_MYSTIC | Creativity, Mystery, Spirit | NFT, Creative, Music | #A855F7 | Slow (0.8–1.5s) |
| LIME_GREEN_GENIUS | Innovation, Challenge, Boldness | Design, EdTech, Startups | #84CC16 | Fast+Responsive (0.3–0.8s) |
| GOLD_CINEMATIC | Luxury, Craftsmanship, Aspiration | Premium, Galleries, Portfolio | #D4AF37 | Elegant (1–1.8s) |
| PINK_SURREAL | Playfulness, Emotion, Surrealism | Lifestyle, Mental Health, Games | #FF1493 | Dynamic (0.5–1.2s) |

## Phase 2 — Token Bundle Output

Return the full token bundle for the selected archetype as JSON. Include every section.

### Token bundle schema

```json
{
  "archetype": "RED_EXPLOSIVE",
  "confidence": 0.95,
  "colors": {
    "primary":    { "hex": "#FF3333", "use_case": "Headline, primary CTA, emphasis" },
    "secondary":  { "hex": "#CC0000", "use_case": "Hover states, dividers" },
    "accent":     { "hex": "#FF6600", "use_case": "Motion highlights, glow effects" },
    "background": { "hex": "#0F0F0F", "use_case": "Hero background" },
    "text":       { "hex": "#FFFFFF", "use_case": "Primary text, high contrast" },
    "highlight":  { "hex": "#FFAA00", "use_case": "Secondary accent, particles" }
  },
  "typography": {
    "headline": {
      "font_family": "Inter, system-ui, sans-serif",
      "font_weight": 900,
      "font_size": "clamp(3.5rem, 10vw, 8rem)",
      "letter_spacing": "-0.02em",
      "text_transform": "uppercase"
    },
    "subtext": {
      "font_family": "Inter, system-ui, sans-serif",
      "font_weight": 400,
      "font_size": "1.2rem",
      "letter_spacing": "0.05em",
      "text_transform": "uppercase"
    }
  },
  "effects": [
    { "module": "Module_05_Glow_Flare",   "color": "#FF6600", "intensity": "high" },
    { "module": "Module_09_Scale_Pulse",  "intensity": "subtle" },
    { "module": "Module_16_Glitch",       "intensity": "minimal" },
    { "module": "Module_23_Blur_Reveal"                         }
  ],
  "motion_profile": {
    "speed": "fast",
    "transition_range": "0.3s - 0.6s",
    "easing_primary": "power3.out",
    "scroll_scrub": 1.5
  },
  "lighting_philosophy": {
    "key_light": "Hard side (camera-left, 45°)",
    "back_light": "Orange/red practical glow",
    "atmosphere": "Volumetric haze, dust particles",
    "reference": "Denis Villeneuve — hard rim light, explosion aesthetic"
  },
  "css_variables": {
    "--color-primary":   "#FF3333",
    "--color-secondary": "#CC0000",
    "--color-accent":    "#FF6600",
    "--color-bg":        "#0F0F0F",
    "--color-text":      "#FFFFFF",
    "--color-highlight": "#FFAA00",
    "--transition-speed": "0.3s",
    "--easing": "cubic-bezier(0.16, 1, 0.3, 1)"
  }
}
```

## Archetype Reference

### RED_EXPLOSIVE
Colors: `#FF3333` / `#CC0000` / `#FF6600` / bg `#0F0F0F`. Font: Inter 900. Effects: Glow Flare, Scale Pulse, Glitch. Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.

### BLUE_TECH
Colors: `#00A8E8` / `#0066CC` / `#00D4FF` / bg `#0A1428`. Font: Inter 700 + JetBrains Mono. Effects: Digital Rain, Hologram, Grid Overlay. Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.

### PURPLE_MYSTIC
Colors: `#A855F7` / `#7C3AED` / `#EC4899` / bg `#1A0F2E`. Font: Playfair Display 800 italic. Effects: Shimmer Field, Liquid Blur, Color Shift, Depth Fog. Easing: `cubic-bezier(0.42, 0, 0.58, 1)`.

### LIME_GREEN_GENIUS
Colors: `#84CC16` / `#65A30D` / `#000000` / bg `#F5F5F5`. Font: Inter 900 + JetBrains Mono. Effects: Spotlight Follow, Scramble Text, Neon Glow, Magnetic Button. Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`.

### GOLD_CINEMATIC
Colors: `#D4AF37` / `#B8860B` / `#F5DEB3` / bg `#1A1410`. Font: Playfair Display 700 + Garamond. Effects: Layered Zoom Parallax, Film Grain, Soft Focus Reveal, Fade In Cascade. Easing: `cubic-bezier(0.45, 0.05, 0.55, 0.95)`.

### PINK_SURREAL
Colors: `#FF1493` / `#FF69B4` / `#00FFFF` / bg `#0F0F0F`. Font: Poppins 800. Effects: Color Shift Bloom, Shimmer Field, Morphing Shape, Chromatic Aberration. Easing: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`.

## Export formats

On request, output tokens in the format the user needs:

**CSS (browser-ready)**
```css
:root {
  --color-primary: #FF3333;
  --color-accent: #FF6600;
  --easing: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**YAML (human-readable)**
```yaml
archetype: RED_EXPLOSIVE
colors:
  primary: "#FF3333"
  accent:  "#FF6600"
effects:
  - module: "Module_05_Glow_Flare"
    timing: "0.3s"
```

**Figma Design Tokens JSON**
```json
{
  "colors": {
    "primary": { "value": "#FF3333", "type": "color" }
  },
  "typography": {
    "headline": { "value": { "fontFamily": "Inter", "fontWeight": "900", "fontSize": "64px" }, "type": "typography" }
  }
}
```

## Hybrid / custom archetypes

If the user wants a mix (e.g. "RED energy with PURPLE mysticism"):
1. Take the base archetype's colors as primary
2. Pull accent colors from the secondary archetype
3. Merge effects from both (limit to 4–5 total)
4. Name the result `RED_FANTASY` (or similar) and document overrides clearly

## Output

Call `formatOutput` with:
- `archetype` string
- `confidence` score
- Complete `token_bundle` (colors, typography, effects, motion_profile, css_variables)
- `alternatives` array (up to 2 runner-up archetypes with reasoning)
- `recommended_fonts_import` — Google Fonts URL if non-system fonts are used

## See also

- [cinematic-website-builder](../cinematic-website-builder/SKILL.md) — full hero section build (HTML + design spec + AI prompt)
- [brand-extractor](../brand-extractor/SKILL.md) — pull brand tokens from a live URL before archetype selection
- [cinematic-prompt-director](../cinematic-prompt-director/SKILL.md) — ultra-detail focal image prompts
