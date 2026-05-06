---
name: cinematic-website-builder
description: >
  Primary orchestrator for building world-class hero sections. Auto-invokes brand-extractor
  (if URL provided), ui-ux-design-system (design tokens + archetype), and
  cinematic-prompt-director (AI focal image prompt), then generates production-ready
  single-file HTML with GSAP animations and CSS design tokens injected.
  Delivers a complete package: hero HTML + design spec JSON + copyable AI image prompt.
  Use for any request to build, redesign, or generate a landing page or hero section.
category: Design
---

# Cinematic Website Builder

End-to-end hero section pipeline. One request → complete package (design tokens + production HTML + AI image prompt). Composes three sub-skills automatically — the user interacts only with this orchestrator.

## When to use

- "Build a landing page for [client]"
- "Create a hero section for my [industry] startup"
- "Redesign my homepage" (with or without a URL)
- "Generate a website hero with GSAP animations"
- Any request where both design and code output are needed

If the user only wants a design spec (no code), route to `ui-ux-design-system` instead.

## Orchestration pipeline

```
User Request
    │
    ├─ URL provided? ──yes──▶ brand-extractor (scrape brand tokens)
    │                                │
    │◀────────────────────────────────
    │
    ├──▶ ui-ux-design-system (archetype selection + token bundle)
    │         ├ input: user keywords + brand tokens (if extracted)
    │         └ output: design spec JSON + CSS variables
    │
    ├──▶ cinematic-prompt-director (focal image prompt)
    │         ├ input: archetype + industry context
    │         └ output: 180–250 word AI prompt (copyable)
    │
    └──▶ HTML generation (this skill, inline)
              ├ input: token bundle + GSAP module stack
              └ output: single-file production HTML
```

## Step-by-step execution

### Step 1 — Brand analysis (conditional)

If the user provided a URL, invoke `brand-extractor`:
- Pass URL; receive `brand_token_package` with extracted colors, fonts, vibe, and detected archetype
- Pass `brand_token_package.brand_overrides` to Step 2 as `forced_overrides`

### Step 2 — Design tokens

Invoke `ui-ux-design-system`:
- Pass user keywords + forced overrides (if any)
- Receive full `token_bundle` (archetype, colors, typography, effects, css_variables)
- If confidence < 0.75, present the top 2 options and ask the user to choose before continuing

### Step 3 — Focal image prompt

Invoke `cinematic-prompt-director`:
- Pass archetype name + industry/brand context
- Receive `prompt_text` (180–250 words) ready to copy into Kling 3.0 / Midjourney / NanoBanana Pro

### Step 4 — HTML generation

Generate a single-file HTML hero using the token bundle. Follow the template below exactly.

## HTML template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ hero_title }} | Hero</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <style>
    /* ── Design tokens from {{ archetype }} ── */
    :root {
      --color-primary:   {{ css_variables['--color-primary'] }};
      --color-secondary: {{ css_variables['--color-secondary'] }};
      --color-accent:    {{ css_variables['--color-accent'] }};
      --color-bg:        {{ css_variables['--color-bg'] }};
      --color-text:      {{ css_variables['--color-text'] }};
      --color-highlight: {{ css_variables['--color-highlight'] }};
      --transition-speed: {{ css_variables['--transition-speed'] }};
      --easing: {{ css_variables['--easing'] }};
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: {{ typography.headline.font_family }};
      background-color: var(--color-bg);
      color: var(--color-text);
      overflow-x: hidden;
    }

    .hero {
      position: relative;
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-secondary) 200%);
    }

    /* Ambient glow layer */
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at 30% 50%,
        color-mix(in srgb, var(--color-accent) 15%, transparent) 0%,
        color-mix(in srgb, var(--color-primary) 5%, transparent) 40%,
        transparent 80%
      );
      pointer-events: none;
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 1200px;
      padding: 2rem;
    }

    .hero-image-container {
      position: relative;
      width: 100%;
      max-width: 560px;
      margin: 0 auto 2.5rem;
      aspect-ratio: 3/4;
      overflow: hidden;
      border-radius: 8px;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      animation: pulse-scale 3s ease-in-out infinite;
    }

    @keyframes pulse-scale {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.02); }
    }

    .hero-title {
      font-size: {{ typography.headline.font_size }};
      font-weight: {{ typography.headline.font_weight }};
      text-transform: {{ typography.headline.text_transform }};
      letter-spacing: {{ typography.headline.letter_spacing }};
      line-height: 1;
      margin-bottom: 1rem;
      color: var(--color-primary);
    }

    .hero-subtitle {
      font-size: {{ typography.subtext.font_size }};
      font-weight: {{ typography.subtext.font_weight }};
      text-transform: {{ typography.subtext.text_transform }};
      letter-spacing: {{ typography.subtext.letter_spacing }};
      margin-bottom: 2.5rem;
      opacity: 0.85;
    }

    .hero-cta {
      display: inline-block;
      padding: 1rem 2.5rem;
      background-color: var(--color-primary);
      color: var(--color-bg);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.1em;
      border: 2px solid var(--color-primary);
      border-radius: 4px;
      cursor: pointer;
      transition: all var(--transition-speed) var(--easing);
      position: relative;
    }

    .hero-cta:hover {
      background-color: transparent;
      color: var(--color-primary);
      box-shadow: 0 0 30px var(--color-accent);
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      .hero { height: auto; min-height: 90vh; padding: 3rem 0; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="hero-content">
      <div class="hero-image-container">
        <!--
          STEP 1: Generate your focal image
          Copy the prompt from focal-image-prompt.txt
          Paste into Kling 3.0 / Midjourney / NanoBanana Pro
          Download as: hero-focal.jpg

          STEP 2: Replace the src below
        -->
        <img
          class="hero-image"
          src="{{ focal_image_url }}"
          alt="{{ hero_title }} hero image"
        >
      </div>

      <h1 class="hero-title">{{ hero_title }}</h1>
      <p class="hero-subtitle">{{ hero_subtitle }}</p>
      <button class="hero-cta">{{ cta_label }}</button>
    </div>
  </section>

  <script>
    gsap.registerPlugin(ScrollTrigger);

    // Glow flare on scroll
    gsap.to(".hero-image", {
      boxShadow: "0 0 60px color-mix(in srgb, var(--color-accent) 60%, transparent)",
      duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed')),
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".hero",
        start: "top center",
        end: "bottom center",
        scrub: 1.5,
      }
    });

    // Magnetic CTA button
    const cta = document.querySelector(".hero-cta");
    document.addEventListener("mousemove", (e) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (Math.sqrt(x * x + y * y) < 150) {
        gsap.to(cta, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
      }
    });

    // Hero entrance animation
    gsap.from(".hero-title",    { opacity: 0, y: 40, duration: 0.8, ease: "power3.out", delay: 0.3 });
    gsap.from(".hero-subtitle", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", delay: 0.5 });
    gsap.from(".hero-cta",      { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", delay: 0.7 });
  </script>
</body>
</html>
```

When generating the actual HTML, replace all `{{ }}` placeholders with real values from the token bundle. Keep the template structure — do not simplify or stub the GSAP code.

## Output package

Deliver all four items in order:

1. **`design-spec-[ARCHETYPE].json`** — full token bundle (from `ui-ux-design-system`)
2. **`[project-name]-hero.html`** — production-ready single-file HTML (generated in Step 4)
3. **`focal-image-prompt.txt`** — the 180–250 word AI image prompt (from `cinematic-prompt-director`)
4. **`integration-notes.md`** — three-step user workflow:
   - Step 1: Generate focal image (copy prompt → paste into platform → download)
   - Step 2: Replace `{{ focal_image_url }}` in HTML with local image path
   - Step 3: Deploy (upload to server / Vercel / Netlify)

Then call `formatOutput` with:
```json
{
  "archetype": "RED_EXPLOSIVE",
  "files_generated": ["design-spec.json", "hero.html", "focal-image-prompt.txt", "integration-notes.md"],
  "design_spec": { ... },
  "html_preview_snippet": "<!-- first 20 lines of generated HTML -->",
  "focal_image_prompt": "...",
  "next_step": "Generate focal image using the prompt, then replace {{ focal_image_url }} in the HTML."
}
```

## Brand preservation mode

When `brand-extractor` ran and returned overrides:
- Set `primary` and `secondary` from `brand_overrides` (not archetype defaults)
- Keep all archetype effects, motion, and typographic framework
- Name the archetype `BLUE_TECH_CUSTOM` (or similar) in the design spec
- Add a `custom_overrides` object in the JSON showing original vs. overridden values
- Add a "before/after" note in `integration-notes.md`

## GSAP module selection

Pick 4–5 modules per hero. More is noise. Match to archetype:

| Archetype | Primary | Secondary | Tertiary |
|-----------|---------|-----------|----------|
| RED_EXPLOSIVE | Glow Flare | Scale Pulse | Glitch |
| BLUE_TECH | Digital Rain | Hologram | Grid Overlay |
| PURPLE_MYSTIC | Shimmer Field | Liquid Blur | Color Shift |
| LIME_GREEN_GENIUS | Spotlight Follow | Scramble Text | Neon Glow |
| GOLD_CINEMATIC | Layered Zoom Parallax | Film Grain | Fade In Cascade |
| PINK_SURREAL | Color Shift Bloom | Shimmer Field | Morphing Shape |

Always include the entrance animation (fade-up stagger on title/subtitle/CTA) and the magnetic CTA regardless of archetype.

## Tips

- Generate placeholder copy (`hero_title`, `hero_subtitle`, `cta_label`) from the user's industry/vibe if they didn't provide specific text — don't leave blanks
- Always include the `{{ focal_image_url }}` placeholder comment — users need the integration workflow to be explicit
- If the user's request only mentions a redesign without specifying a new direction, run `brand-extractor` first, then show the archetype recommendation before generating HTML

## See also

- [ui-ux-design-system](../ui-ux-design-system/SKILL.md) — standalone design token consultation
- [brand-extractor](../brand-extractor/SKILL.md) — brand token extraction from live URLs
- [cinematic-prompt-director](../cinematic-prompt-director/SKILL.md) — standalone AI image prompt generation
