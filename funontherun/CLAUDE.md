# Fun on the Run — Builder Rules

## YOU ARE THE BUILDER. NOT THE DESIGNER.

Every design decision has already been made. Your job is precise implementation only.

- Do NOT invent colors, fonts, layouts, copy, or effects
- Do NOT simplify or skip any motion/effect spec
- Do NOT use Google Fonts CDN — Fontsource only (`@fontsource/syne`, `@fontsource/dm-sans`)
- Do NOT use plain CSS animations as substitutes for GSAP/Framer Motion
- Do NOT deploy placeholder images — every image URL is in HANDOFF.md
- Read HANDOFF.md completely before writing a single line of code

## STACK — NO SUBSTITUTIONS

```
Next.js 14 (App Router) + TypeScript
Tailwind CSS + shadcn/ui + Radix UI
Framer Motion (entrance animations, hover states)
GSAP + ScrollTrigger (scroll-pinned sections, scrub)
Lenis (smooth scroll wrapper)
@fontsource/syne
@fontsource/dm-sans
```

## DESIGN TOKENS — HARDCODED, DO NOT ALTER

```ts
const tokens = {
  bg_base:      '#0A0705',
  bg_surface:   '#13100D',
  bg_glass:     'rgba(255,255,255,0.04)',
  accent:       '#FF6B35',
  accent_warm:  '#FFD166',
  accent_glow:  'rgba(255,107,53,0.3)',
  text:         '#F7F3EE',
  text_muted:   '#9C8E82',
  border_glass: 'rgba(255,255,255,0.08)',
}
```

## EFFECTS — ALL REQUIRED, NO EXCEPTIONS

**Liquid Glass** (nav, CTA cards, feature panels):
```css
background: rgba(255,255,255,0.04);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 20px;
```

**Neumorphic** (stat cards, form inputs, step cards):
```css
background: #13100D;
box-shadow: 6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(31,26,22,0.4);
border-radius: 16px;
```

**Glassmorphism** (testimonial cards, vendor cards, blog cards):
```css
background: rgba(255,255,255,0.03);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.06);
```

## MOTION — MANDATORY ON EVERY PAGE

```ts
// Global smooth scroll — wrap layout
const lenis = new Lenis({ lerp: 0.1, duration: 1.2 })

// Section entrance — every section
initial={{ opacity: 0, y: 60 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}

// GSAP ScrollTrigger — How It Works horizontal pin
ScrollTrigger.create({ pin: true, scrub: 1 })

// Hover — all cards and images
whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(255,107,53,0.25)' }}
```

## PAGES TO BUILD

1. `/` — Homepage (8 sections, see HANDOFF.md)
2. `/vendors` — Vendors page (3 sections)
3. `/blog` — Blog page (2 sections)

## DEPLOYMENT

- Platform: Vercel
- Team: `chumablack314-3299s-projects`
- Token env var: `VERCEL_TOKEN` (set in environment)
- Command: `npx vercel deploy --prod --token=$VERCEL_TOKEN`
