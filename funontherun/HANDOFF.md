# SAVO Universal Build Handoff
## Fun on the Run — Full Site Recreation
**Date:** 2026-06-06
**Status:** ALL ASSETS COMPLETE — Ready to build

---

## BRAND DNA

- **App:** Fun on the Run (FOTR) — social activity discovery app connecting strangers through shared experiences
- **Tagline:** "Redefine the Way You Connect"
- **Audience:** Urban 20–35s, activity-driven, anti-isolation
- **Tone:** Warm, energetic, inclusive, cinematic
- **Logo:** Animated F with legs/arms running — use `assets/F-fun-logo.gif` for nav and hero entrance

---

## ALL ASSET URLS

### Hero Video (Kling 3.0 — 1920×1080 — 8s)
```
https://d8j0ntlcm91z4.cloudfront.net/user_30Zz3LHrTCA6JoAXpOu8nLQx0Ic/hf_20260606_003616_7f5673fb-6470-49c3-b062-3d895e1285f6.mp4
```
- Autoplay, muted, loop, playsinline
- Poster: hero start frame below
- Overlay: linear-gradient(to bottom, transparent 40%, #0A0705 100%)

### Hero Frames (4K GPT Image 2)
```
Start: https://d8j0ntlcm91z4.cloudfront.net/user_30Zz3LHrTCA6JoAXpOu8nLQx0Ic/hf_20260606_002519_66dad251-ec4c-498d-8698-1440d6ad2b87.png
End:   https://d8j0ntlcm91z4.cloudfront.net/user_30Zz3LHrTCA6JoAXpOu8nLQx0Ic/hf_20260606_002523_58ca346d-2d00-4d82-9d37-879ec0c3c036.png
```

### Site Images (NanoBanana Pro 2k — all Higgsfield CDN)
Base URL: `https://d8j0ntlcm91z4.cloudfront.net/user_30Zz3LHrTCA6JoAXpOu8nLQx0Ic/`

| Section | Filename |
|---|---|
| Problem (alone on couch) | `hf_20260606_003616_8697c506-9305-4bd5-831d-52450a34a418.png` |
| Feature: Go-karts | `hf_20260606_003617_6fd50985-d2c4-4969-a57f-529ae1efbeab.png` |
| Feature: Dinner | `hf_20260606_003618_07682e94-bff3-4afc-a5fe-011e34700cbb.jpeg` |
| Feature: Movies | `hf_20260606_003619_7e4bbbdc-2ec4-4a04-9210-73bd24ce5f72.png` |
| Safety/trust shield | `hf_20260606_003620_9b54772d-[full-id].png` |
| Testimonial: Mason Mitchell | `hf_20260606_003621_29c5b233-[full-id].png` |
| Testimonial: Sophia Taylor | `hf_20260606_003622_9fe7b7cd-[full-id].png` |
| Testimonial: Ethan Davis | `hf_20260606_003623_b2222fbb-[full-id].png` |
| Testimonial: Jackson Walker | `hf_20260606_003624_9da30b36-[full-id].png` |
| Vendor hero (bar owner) | `hf_20260606_003625_b0624f39-[full-id].png` |
| Vendor crowd | `hf_20260606_003626_1b0a9dc7-[full-id].png` |
| Blog hero (woman at cafe) | `hf_20260606_003627_a48f6b6e-[full-id].png` |

### Local Assets (`/assets/` directory)
```
F-fun-logo.gif        — animated running F logo (1.4MB) — nav + hero
F-fun-2-1.gif         — alternate F animation (3.5MB)
Logo_fotr.svg         — secondary wordmark — footer
At-the-bar-scaled.jpg — hero section fallback background
sweet-life-unsplash-scaled.jpg — lifestyle section
jade-masri-unsplash.jpg        — social proof section
priscilla-du-preez-unsplash.jpg — connection section
aloneonthanksgiving.jpg        — problem section (backup)
happy-man-fitness-city.avif    — CTA section
image-6.png           — app UI screenshot — download section
IMG_7429.jpeg         — Danny Bush founder photo
IMG_7430.jpeg         — Danny Bush photo 2
IMG_7437.jpeg         — Danny Bush photo 3
IMG_8644.jpg          — Danny Bush photo 4
1.svg–5.svg           — How It Works step icons
```

### FOTR CDN Videos
```
Promo video: https://funontherun.co/wp-content/uploads/2024/09/FOTRP1Video.mp4
Story reel:  https://funontherun.co/wp-content/uploads/2024/07/Copy-of-Beige-Modern-Photo-Collage-Mobile-Mockup-Instagram-Story-1050-x-1920-px.mp4
```

---

## PAGE 1: HOMEPAGE (`/`)

### Section 1 — HERO
- Layout: fullscreen (100vh), centered content, video background
- Video: Kling 3.0 mp4, autoplay muted loop, poster=start frame
- Overlay: `linear-gradient(to bottom, rgba(10,7,5,0.3) 0%, #0A0705 100%)`
- Logo entrance: `F-fun-logo.gif` animates in from left edge on load (translateX: -100vw → 0, duration 1.2s)
- Headline: `"Stop Scrolling.\nStart Living."` — Syne 900, clamp(56px, 8vw, 112px), color `#F7F3EE`
- Subheadline: `"Fun on the Run connects you with real people doing the things you love — right in your city, right now."` — DM Sans 400, 20px, color `#9C8E82`
- CTAs: `[Join the Beta →]` (accent `#FF6B35` filled pill) + `[Watch the Story]` (ghost, liquid glass)
- Scroll indicator: animated chevron, color `#FF6B35`

### Section 2 — PROBLEM
- Layout: 2-col split, `bg: #13100D`
- Left: Problem image (Higgsfield alone-on-couch)
- Right: headline `"Millions of people. Nobody to hang with."`, body copy, 3 neumorphic stat cards
- Stat cards: `"67% of adults report chronic loneliness"` / `"2.3hrs avg. daily screen time replacing social time"` / `"83% say they want more spontaneous plans"`
- ScrollTrigger fade-up stagger on stats (delay: 0.1s each)

### Section 3 — HOW IT WORKS
- Layout: horizontal scroll snap, GSAP pinned, `bg: #0A0705`
- 5 steps using `1.svg–5.svg` icons
- Step labels: Browse Activities → Find Your Crew → Join or Host → Show Up → Rate & Repeat
- Each step: glassmorphic card, icon top, number badge `#FF6B35`, title Syne 700, body DM Sans
- ScrollTrigger: `scrub: 1`, horizontal translate on scroll

### Section 4 — FEATURES
- Layout: alternating image/text rows, 3 features
- Feature 1: Go-karts image left / "Race into your weekend" text right
- Feature 2: Dinner image right / "Table for strangers, friends by dessert" text left  
- Feature 3: Movies image left / "Find your film tribe" text right
- Image hover: `scale(1.05)` + `box-shadow: 0 30px 80px rgba(255,107,53,0.3)`
- Accent: `#FF6B35` underline on feature headlines (animated width 0→100% on scroll enter)

### Section 5 — SAFETY & TRUST
- Layout: centered, dark `#13100D`, max-width 720px
- Skeuomorphic shield badge (use safety Higgsfield image)
- Headline: `"Your safety is the feature."` — Syne 800
- 4 trust pillars: Verified Profiles / Activity Reviews / Report & Block / Real People Only
- Each pillar: neumorphic pill with `#FFD166` icon accent

### Section 6 — TESTIMONIALS
- Layout: horizontal scroll carousel, no arrows, drag-enabled
- 4 glassmorphic cards: Mason Mitchell, Sophia Taylor, Ethan Davis, Jackson Walker
- Each card: avatar (Higgsfield), name, city, star rating `#FFD166`, quote
- Card hover: `translateY(-8px)` + glow

### Section 7 — APP DOWNLOAD
- Layout: `bg: linear-gradient(135deg, #FF6B35 0%, #FFD166 100%)`, centered
- App screenshot (`image-6.png`) floating with neumorphic shadow, slight rotate `-3deg`
- Headline: `"Fun is waiting."` — Syne 900, color `#0A0705`
- App Store + Google Play badges
- Floating UI elements around phone: activity cards, notification badges (CSS/SVG)

### Section 8 — FOOTER
- `bg: #0A0705`, `Logo_fotr.svg` wordmark
- Running F gif small in corner (16px height, loops)
- Links: Home / Vendors / Blog / Privacy / Terms
- Social icons: Instagram, TikTok, Twitter/X
- Copy: `"© 2024 Fun on the Run. Made for people who show up."`

---

## PAGE 2: VENDORS (`/vendors`)

### Section 1 — HERO
- Vendor hero image (Higgsfield bar owner) — fullscreen, same overlay treatment as homepage
- Headline: `"Bring your venue to life."` — Syne 900
- Sub: `"List your bar, bowling alley, restaurant, or experience on Fun on the Run and fill your slow nights with real customers."`
- CTA: `[Partner With Us]` — `#FF6B35` filled

### Section 2 — VALUE PROPS
- 3-column glassmorphic grid on `#13100D`
- Col 1: Zero upfront cost / Col 2: Real-time activity feed / Col 3: Built-in social proof
- Vendor crowd image (Higgsfield) as section background at 15% opacity

### Section 3 — VENDOR CTA
- Neumorphic form card: Business name, venue type, city, email, Submit
- `bg: #0A0705`, centered max-width 560px

---

## PAGE 3: BLOG (`/blog`)

### Section 1 — HERO
- Blog hero image (Higgsfield woman at cafe) — fullscreen
- Headline: `"Stories from the Run."` — Syne 900
- Sub: `"Dispatches from people who decided to show up."`

### Section 2 — ARTICLE GRID
- 3-column glassmorphic card grid
- Seed with 3 placeholder articles:
  1. `"I met my best friend at a stranger's bowling night"` — lifestyle category
  2. `"Why spontaneous plans beat scheduled ones every time"` — culture category
  3. `"How Fun on the Run is changing the lonely city"` — community category
- Card hover: `translateY(-6px)` + border glow `#FF6B35`
- Use `sweet-life-unsplash-scaled.jpg`, `jade-masri-unsplash.jpg`, `priscilla-du-preez-unsplash.jpg` as article hero images

---

## TYPOGRAPHY SYSTEM

```ts
// Install via npm, import in layout.tsx
import '@fontsource/syne/800.css'
import '@fontsource/syne/900.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'

// Tailwind config
fontFamily: {
  heading: ['Syne', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
}
```

---

## NAV BEHAVIOR

- Transparent on load
- On scroll > 80px: liquid glass treatment kicks in
  ```css
  background: rgba(10,7,5,0.85);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  ```
- Logo: `F-fun-logo.gif` at 32px height, links to `/`
- Links: Home, How It Works, Vendors, Blog
- CTA: `[Join Beta]` — `#FF6B35` pill
- Mobile: hamburger → fullscreen overlay, same glass treatment

---

## DEPLOYMENT CHECKLIST

- [ ] `npm install` all dependencies
- [ ] Verify all Higgsfield CDN image URLs load (check network tab)
- [ ] Verify Kling video autoplays on mobile (needs `muted playsinline`)
- [ ] Test Lenis scroll on iOS Safari
- [ ] Test GSAP ScrollTrigger How It Works pin on mobile (disable pin on < 768px, stack vertically instead)
- [ ] Lighthouse score target: Performance > 85, Accessibility > 95
- [ ] Deploy: `npx vercel deploy --prod --token=$VERCEL_TOKEN`
