---
name: brand-extractor
description: >
  Scrapes a live client URL to extract existing brand identity: color palette, typography,
  visual vibe, and logo style. Returns a brand token package that cinematic-website-builder
  and ui-ux-design-system use to preserve brand continuity while modernizing a hero section.
  Use whenever a client URL is provided alongside a design or build request.
category: Design
---

# Brand Extractor

Pulls brand tokens from a live website so the design system can modernize the hero while preserving brand identity. Uses `scrape` — no `interact` needed for typical marketing homepages.

## When to use

- User provides a client URL with any design/build request ("here's our site: acme.com")
- User asks to "modernize but keep our brand" or "redesign while staying on-brand"
- User says "audit our current hero" — extract first, then recommend archetype delta
- Auto-invoked by `cinematic-website-builder` when a URL is detected in the request

Do NOT use for URLs that are product pages, login walls, or SPAs requiring auth — fall back to asking the user for their brand colors directly.

## Strategy

1. **Scrape the homepage** with a targeted extraction prompt: colors, fonts, imagery style, mood.
2. **Scrape the CSS** if the homepage scrape returns sparse results — look for `:root` variables, `@font-face` declarations, repeated color hex values.
3. **Optional: scrape a secondary page** (e.g. `/about` or `/products`) if the homepage is a hero-only splash with minimal brand signal.
4. **Classify the vibe** from imagery language: professional, playful, luxury, technical, minimal, bold, etc.

## Extraction targets

For each site, extract:

| Signal | How to find it |
|--------|---------------|
| Primary color | Most-used non-white/black color on CTAs, borders, links |
| Secondary color | Second most-used brand color (often headers or highlights) |
| Background color | Page background (may be white, dark, or a tint) |
| Typography (headline) | Font family + weight used on `<h1>` or hero text |
| Typography (body) | Font family + weight used in paragraphs |
| Logo style | Wordmark / icon / abstract mark / illustrated |
| Visual vibe | 1–3 adjectives from imagery and layout |
| Imagery style | Photography / illustration / 3D / abstract / minimal |

## Output schema

```json
{
  "brand_url": "https://acme-corp.com",
  "extracted_colors": {
    "primary":    { "hex": "#00796B", "source": "CTA buttons" },
    "secondary":  { "hex": "#1A237E", "source": "Header background" },
    "background": { "hex": "#FFFFFF", "source": "Page background" }
  },
  "extracted_typography": {
    "headline": { "font_family": "Roboto", "font_weight": "700" },
    "body":     { "font_family": "Lato",   "font_weight": "400" }
  },
  "visual_vibe": ["professional", "established", "trustworthy"],
  "imagery_style": "corporate photography, clean, minimal",
  "logo_style": "wordmark with geometric icon",
  "detected_archetype": "BLUE_TECH",
  "archetype_confidence": 0.82,
  "modernization_recommendation": "Apply BLUE_TECH framework; preserve teal primary and navy secondary; replace generic typography with Inter + JetBrains Mono",
  "brand_overrides": {
    "primary": "#00796B",
    "secondary": "#1A237E"
  },
  "sources": ["https://acme-corp.com", "https://acme-corp.com/about"]
}
```

## Passing results downstream

When auto-invoked by `cinematic-website-builder`, pass the full output object to `ui-ux-design-system` as `brand_tokens`. The design system will:
- Use `brand_overrides.primary` and `brand_overrides.secondary` instead of archetype defaults
- Keep archetype effects, motion profile, and typography framework
- Document overrides in `custom_overrides` field of the token bundle

## Edge cases

- **No CSS variables found**: fall back to dominant color extraction from hero section hex values
- **Dark / light mode site**: extract both and note which is the primary mode
- **Scrape returns 403 / blocked**: inform the user and ask them to paste their hex codes directly
- **Single-page app (no static HTML)**: note the limitation; ask user for brand guide or color values

## Output

Call `formatOutput` with the full brand token package. Always include `sources` array and `modernization_recommendation`.

## See also

- [ui-ux-design-system](../ui-ux-design-system/SKILL.md) — consumes brand tokens to select and customize an archetype
- [cinematic-website-builder](../cinematic-website-builder/SKILL.md) — orchestrates brand-extractor + design system + HTML build
