---
name: cinematic-prompt-director
description: >
  Generates ultra-detailed AI focal image prompts (180–250 words) for hero sections.
  Takes a design archetype plus brand/industry context and outputs a cinematographer-grade
  prompt ready to paste into Kling 3.0, Midjourney, or any image generation platform.
  Specifies character, camera body, lens, lighting rig, color science, and emotional intent
  at professional film-production level. Auto-invoked by cinematic-website-builder.
category: Design
---

# Cinematic Prompt Director

Produces publication-quality AI image prompts by applying cinematographer-grade thinking to hero section focal images. Each prompt is a complete production brief — character, camera, lighting, color science, motion, and emotional subtext.

## When to use

- User asks for an AI image prompt for their hero section
- User says "give me a prompt for Midjourney / Kling / Stable Diffusion"
- Auto-invoked by `cinematic-website-builder` after archetype is selected
- User wants to replace a stock photo with a custom AI-generated focal image

## Inputs required

- **Archetype** — one of the 6 archetypes (drives lighting philosophy + color grade)
- **Context** — industry, brand vibe, target audience, product category
- **Subject type** — character portrait / product shot / environmental / abstract
- **Platform** — Kling 3.0 (video), Midjourney v6 (static), NanoBanana Pro (photorealistic), or generic (platform-agnostic)

## Prompt construction — 7 layers

Build every prompt across all 7 layers. Each section maps to a professional film department.

### Layer 1 — Subject & Character
Physical description, expression, posture, wardrobe. Be hyper-specific: height, build, skin tone, eye color, expression micro-description ("stoic determination, unwavering gaze"), clothing material and wear state.

### Layer 2 — Cinematography
- **Camera body**: Blackmagic URSA 17K / ARRI ALEXA 35 / Sony VENICE 2 (match to archetype)
- **Lens**: ZEISS Supreme Prime focal length + T-stop (match to depth-of-field intent)
- **Frame rate + ISO**: e.g. "24fps, ISO 800"
- **Aperture**: wide for bokeh (portrait), narrow for product sharpness

### Layer 3 — Lighting rig
- Key light position (angle + modifier + color temp)
- Fill light (soft vs. hard, ratio)
- Rim/back light (separation, intensity, color — use archetype accent color)
- Practical lights and atmosphere (hazer, smoke, LED panels)
- Lighting ratio and shadow depth

### Layer 4 — Environment & Background
Distance, bokeh quality, color of out-of-focus plane, any set dressing visible, atmospheric depth.

### Layer 5 — Color science
- Film stock emulation (Kodak Vision3 500T, FUJI ETERNA, etc.)
- Grade direction: pushed/pulled stops, shadow lift, saturation zones
- Color temperature contrast (warm subject vs. cool void, or vice versa)
- Specific hue boosts (reds/oranges only, or skin-natural + background desaturated)

### Layer 6 — Motion & Texture
Subtle movement (breathing, micro-camera push), film grain (% and simulated stock), depth-of-field rendering (which plane is tack-sharp vs. diffused).

### Layer 7 — Emotional intent
One closing sentence in quotes: the feeling the viewer must walk away with. No adjectives — only specific emotional states and narrative implications.

## Archetype → cinematographer mapping

| Archetype | Lighting Philosophy | Cinematographer Reference | Camera | Lens |
|-----------|--------------------|--------------------------|---------|----|
| RED_EXPLOSIVE | Hard side 45° + orange rim | Denis Villeneuve | Blackmagic URSA 17K | ZEISS 85mm T1.5 |
| BLUE_TECH | Soft three-point + cyan rim | Ridley Scott | ARRI ALEXA 35 | ZEISS Supreme 50mm T1.5 |
| PURPLE_MYSTIC | Diffuse overhead + RGB practicals | Wong Kar-wai | Sony VENICE 2 | Leica Summilux-C 75mm |
| LIME_GREEN_GENIUS | High-key natural + hard shadow | Spike Jonze | ARRI AMIRA | Canon K35 35mm |
| GOLD_CINEMATIC | Classic three-point + golden bounce | Bradford Young | ARRI ALEXA Mini LF | Cooke S7/i 65mm |
| PINK_SURREAL | Saturated LED rig + extreme contrast | Harmony Korine | RED V-RAPTOR | Sigma Cine 40mm |

## Example prompt (RED_EXPLOSIVE, gaming studio)

> Close-up cinematic portrait of a hardened video game warrior protagonist, male, 6'2", athletic-muscular build, deep olive skin tone, shaved head with 3-day stubble, sharp angular jawline, intense dark brown eyes with steely gaze locked outward (direct eye contact, unwavering focus), slight scar across left cheekbone. Expression is stoic, determined, unbreakable concentration.
>
> Wardrobe: medieval-fantasy battle armor, deep charcoal gray with ornate red and gold filigree detailing, visible dents and scratches from combat, weathered leather straps.
>
> Cinematography: Blackmagic URSA Cine 17K Full Frame, ZEISS Supreme Prime 85mm T1.5, aperture T1.5, ISO 1000, 24fps. Hard side key light from ARRI SkyPanel S60-C tungsten 3200K at 45° camera-left, diffused through 216 sheet. Separate hard rim from ARRI SkyPanel X32 RGB set to deep orange (#FF6600), creating dramatic edge separation.
>
> Background: near-black cyclorama, subtle volumetric haze from hazer machine, particulate depth visible in side light.
>
> Color science: Kodak Vision3 500T emulation. Pushed +1 stop in shadows (crushed to 0–10 IRE), desaturated cool background, saturation +30% reds and oranges only, highlights protected on armor.
>
> Subtle breathing motion in shoulders, slow 0.5mm camera push. Film grain at 1–2% (35mm simulation). Face tack-sharp; armor diffused into shallow focus at chest level.
>
> "Unstoppable. Forged in battle. Ready for anything. This is the hero you follow into darkness."

## Platform-specific notes

- **Kling 3.0** — emphasize motion in Layer 6; describe movement speed and direction explicitly
- **Midjourney v6** — append `--ar 16:9 --style raw --v 6` as a suffix note; avoid motion language
- **NanoBanana Pro** — emphasize photorealism and product placement readiness; add "print-ready quality"
- **Generic** — omit platform suffix; keep all 7 layers intact

## Output

Return the complete prompt as a single copyable text block (no markdown headers inside). Then call `formatOutput` with:
- `archetype` used
- `platform` targeted
- `prompt_word_count`
- `prompt_text` (the full prompt)
- `meta_tokens` — hidden searchable tags (e.g. `gaming_protagonist_hero_frame`, `Kodak_Vision3_film_grade`)

## See also

- [ui-ux-design-system](../ui-ux-design-system/SKILL.md) — provides archetype + lighting philosophy inputs
- [cinematic-website-builder](../cinematic-website-builder/SKILL.md) — orchestrates this skill and injects the generated image into HTML
