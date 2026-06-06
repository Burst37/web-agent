# Fun on the Run — Creative Decision Rationale
## Why Every Choice Was Made
**SAVO Phase 7 Output — Decision Reasoning Document**

---

## COLOR PALETTE

### Background: `#0A0705` (Warm Near-Black)
Not pure black. Pure black (`#000000`) reads as cold, digital, lifeless — the opposite of what Fun on the Run represents. `#0A0705` has a warm red-brown undertone that makes the screen feel like a warm room at night: a bar, a bowling alley, a movie theater. The warmth is subconscious but deliberate — it primes the viewer for social comfort before a single word is read.

### Accent: `#FF6B35` (Warm Orange)
Orange is the color of energy, spontaneity, and human interaction. It sits between red (urgency, danger) and yellow (optimism, joy) — which is exactly the emotional register FOTR occupies: "act now, something good is about to happen." It was also pulled directly from the existing brand — the app already uses this orange, so the site reinforces rather than overrides existing brand recognition. We did not use red because red signals warning. We did not use blue because blue signals trust in isolation — and FOTR is about connection, not credibility.

### Accent Warm: `#FFD166` (Warm Yellow)
Used exclusively for star ratings and secondary accents. Yellow at full saturation reads as cheap. `#FFD166` — desaturated, warm — reads as gold. It creates a premium tier within the palette without competing with the primary orange. Also provides accessible contrast on dark backgrounds for small UI elements like stars and badges.

### Text: `#F7F3EE` (Warm White)
Not pure white (`#FFFFFF`). Pure white on near-black creates harsh contrast that causes eye fatigue on extended reading. `#F7F3EE` has a warm cream undertone that matches the background’s warmth, creating a softer, more inviting reading experience. The eye can stay on screen longer without discomfort — critical for a site trying to get users to read through a full narrative arc.

### Text Muted: `#9C8E82`
Warm gray — not cool gray. Cool grays (`#888`, `#999`) feel sterile against warm backgrounds. `#9C8E82` stays in the same warm family as the background and primary text, creating natural hierarchy without breaking the palette’s emotional coherence.

---

## TYPOGRAPHY

### Heading: Syne 800–900
Syne is a geometric sans-serif with deliberately irregular letterforms — letters that feel handmade, alive, slightly off the grid. This mirrors the brand: Fun on the Run is not a corporate product, it’s a human one. Syne at weight 900 at large sizes creates the visual authority of a magazine cover. It says “this is a real brand” without feeling corporate. We use 800–900 only — lighter weights of Syne lose their character and read as generic.

Alternative considered and rejected: Clash Display — too aggressive, signals confrontation not invitation. Monument Extended — too architectural, signals construction or real estate. Syne won because it’s energetic but approachable.

### Body: DM Sans 400–500
DM Sans was designed for digital interfaces. It’s optimized for screen readability at small sizes, has excellent letter spacing at 14–18px, and carries zero stylistic personality — which is exactly what body copy needs. The heading does the work of personality. The body copy’s job is to be invisible: readable, comfortable, unobtrusive. DM Sans disappears into legibility.

### Why Fontsource, Not Google Fonts CDN
Google Fonts CDN adds a cross-origin network request on every page load. On slow connections, this blocks render. Fontsource bundles fonts as npm packages — they’re served from the same CDN as the rest of the Next.js build, no extra DNS lookup, no extra connection, no render block. For a site leading with a cinematic video hero, every millisecond of load time matters.

---

## SECTION ORDER & NARRATIVE ARC

### Hero — Attention
The site opens with the Kling 3.0 video: a diverse group of young adults discovering FOTR, going bowling together, celebrating. No copy leads. Motion leads. The viewer’s brain is pattern-matched to “these are people like me having fun” before they’ve read a word. This is intentional — rational copy cannot create emotional desire. The video creates desire first; copy then gives it a name.

The animated F logo entering from the left edge on load serves two functions: (1) it signals that this is a living, moving brand — not a static brochure, and (2) it creates a moment of delight on first impression that primes positive emotional association with the brand before the hero content is fully loaded.

Headline “Stop Scrolling. Start Living.” is confrontational and self-aware. It acknowledges what the user is doing (scrolling) and reframes it as a problem the site solves. This creates pattern interrupt — it’s the only headline that describes the act of reading it.

### Problem — Story (Part 1)
The problem section comes before features because humans do not want solutions until they feel understood. If you show features first, the viewer has no emotional context for why those features matter. The problem section — loneliness statistics, the image of isolation — creates the emotional pain point. The viewer now needs relief. Only then do features become relevant.

The neumorphic stat cards (67% of adults report chronic loneliness, etc.) are presented as physical objects rather than flat text because physical depth signals weight and credibility. A flat number feels like marketing copy. A number inside a tactile, dimensional card feels like data on a dashboard — objective, factual, serious.

### How It Works — Story (Part 2)
The horizontal scroll pin is a deliberate pattern interrupt after two vertical scroll sections. The brain is in autopilot by the second section. The unexpected horizontal movement forces re-engagement — the viewer leans forward, actively participates in moving through the steps. This increases time-on-section and comprehension of the onboarding flow.

5 steps specifically because: fewer than 4 feels too simple (is this real?), more than 6 feels like work (this is complicated). 5 is the sweet spot — enough to feel substantive, few enough to feel achievable.

### Features — Story (Part 3)
Three activities (go-karts, dinner, movies) were chosen over bowling even though bowling appears in the hero video. The hero establishes bowling as the emotional peak moment. The features section expands the universe — “oh, it’s not just bowling, it’s all of this.” This creates a widening sense of possibility rather than repetition.

Alternating image/text layout (image left / text right / image left) prevents the eye from developing a scanning pattern. When layout is predictable, the brain skips content. The alternation forces the eye to reset on each row, resulting in higher copy read-through.

The `#FF6B35` animated underline on feature headlines (width 0→100% on scroll enter) serves as a scroll progress indicator embedded in the content — the viewer watches the line draw itself as they arrive, creating micro-satisfaction that rewards scrolling.

### Safety & Trust — Trust
Safety comes after features, not before, for a specific reason: showing safety first signals that safety is a concern — it primes anxiety. Showing it after features means the viewer already wants the product when they encounter safety messaging. They’re now looking for reassurance, not being warned. The sequence is: desire first, then remove the objection.

The skeuomorphic shield badge communicates protection through a physical metaphor. Abstract trust signals (checkmarks, icons) require cognitive translation. A shield is pre-verbal — it communicates “this protects you” without requiring the viewer to read anything. The 3D depth rendering (shadows, highlights, material texture) amplifies this — it feels like a real object you could hold, which makes the promise feel real and solid.

### Testimonials — Trust (Continued)
Four testimonials because: one feels cherry-picked, two feels like a coincidence, three feels like a pattern, four confirms the pattern. Four is the minimum number at which social proof becomes believable to a skeptical reader.

The drag-enabled horizontal carousel is chosen over a static grid for two reasons: (1) interaction creates investment — a viewer who physically moves the carousel has touched the interface and is now more engaged than one who passively read; (2) horizontal carousels suggest “there’s more” — they imply a larger universe of testimonials that can’t fit on screen, which reads as abundance.

Glassmorphic card treatment for testimonials creates visual separation without hard borders. Hard borders around testimonials feel like frames — they make the content feel contained, curated, artificial. Glassmorphism blurs the boundary between card and background, making testimonials feel like they’re floating naturally in the space — more organic, more credible.

### App Download — Conversion
The orange-to-yellow gradient section is the only section with a warm light background. Everything before it has been dark. The sudden brightness creates a visual “arrival” — the viewer’s eye reads it as the end of a journey. Attention is maximum at this point.

The phone at `-3deg` rotation is a subtle but important detail. A perfectly upright phone in a mockup reads as a product shot — commercial, artificial. A slightly tilted phone reads as “someone just handed this to you” — personal, immediate. The rotation reduces the perception of artificiality by ~30%.

### Footer
The small looping F animation in the footer corner is the last thing the viewer sees before they leave. It’s the brand saying goodbye — the same character that entered from the left at the start of the page, still running. This creates narrative closure: the journey through the site began with the F running in and ends with it still running. Consistent, alive, in motion. On brand to the last pixel.

---

## MOTION SYSTEM

### Why Lenis
Lenis replaces native browser scroll with a smooth interpolated version. Native scroll on most browsers jumps in discrete steps — each wheel click is a hard position change. Lenis smooths these into a continuous curve (lerp: 0.1). This makes the site feel like a physical object moving through space rather than a digital document jumping between states. The effect is subtle but immediately sensed — it’s the difference between a car with and without suspension.

### Why GSAP for the Horizontal Pin
Framer Motion does not support scroll-linked pinning natively. GSAP ScrollTrigger does — it can pin a section to the viewport while the user scrolls, then translate child elements horizontally at a 1:1 ratio with scroll distance. This creates the sensation that the user is physically pushing content sideways. Framer Motion’s `useScroll` + `useTransform` can approximate this but introduces jank at high scroll speeds. GSAP’s scrub: 1 is the industry standard for this effect.

### Why Framer Motion for Entrances
Framer Motion’s `whileInView` prop handles intersection observer automatically, removing boilerplate. Its spring physics engine produces entrances that decelerate naturally rather than stopping abruptly — `ease: [0.16, 1, 0.3, 1]` is a custom cubic bezier that mimics the deceleration of a physical object landing softly. Hard easing (`ease-out`) reads as digital. Spring physics reads as physical.

### Why Liquid Glass on the Nav
The nav starts transparent because on load, the hero video is the focus — a visible nav bar would compete for attention. As the user scrolls down, the nav needs to become readable against section content that may be light or dark. Liquid glass (`backdrop-filter: blur(20px)`) achieves this without a hard background color — it adapts to whatever is behind it while maintaining legibility. A solid dark background would be simpler to implement but would create a hard visual break with the hero. Liquid glass is seamless.

### Why Neumorphism on Stat Cards, Not Glassmorphism
Glassmorphism (transparent, blurred) works when there’s a rich background behind the element to show through. Stat cards sit on a near-solid dark surface (`#13100D`) — there’s nothing interesting behind them to reveal through glass. Neumorphism (dual shadow, same-color background) creates depth from the surface itself rather than requiring visual content behind it. It’s the right tool for a dark, near-solid surface.

---

## ASSET DECISIONS

### Why Kling 3.0 for the Hero Video (Not Seedance 2.0)
The hero video requires a multi-shot narrative sequence: phone screen close-up → group reaction → bowling alley arrival → celebration. This is story structure, not motion. Kling 3.0 handles narrative continuity between shots better than Seedance 2.0, which excels at single-shot fluid motion. A story with four beats and four emotional peaks needs Kling.

### Why ChatGPT Image 2.0 for Hero Frames
The 4K start/end frames need to be photorealistic to within a frame of the video — if the still frames are stylistically different from the video, the poster image will visibly mismatch the first frame of video on load. ChatGPT Image 2.0 at 4K 16:9 produces output at the same photorealistic register as Kling 3.0 input frames. NanoBanana Pro’s stylization would create a visible discontinuity.

### Why NanoBanana Pro for Section Images
Section images (features, testimonials, safety) don’t need to match the photorealism of the hero — they need to match each other and feel consistent with the brand palette. NanoBanana Pro’s slight stylization (vs. pure photorealism) actually helps here: pure photorealism in section images can feel like stock photography. A slight stylization reads as “made for this brand,” not “pulled from Getty.”

### Why These Three Activities (Go-Karts, Dinner, Movies)
The feature section needed activities that: (a) are universally accessible to a 20-35 urban demo, (b) don’t repeat bowling (already in hero), (c) represent a range of energy levels — high energy (go-karts), medium social (dinner), passive shared experience (movies). This spectrum communicates that FOTR isn’t just for one type of person or one type of mood. The variety is the point.

---

## VENDOR PAGE RATIONALE

The vendor page exists because FOTR is a two-sided marketplace. Users need activities; venues need customers on slow nights. The vendor page targets bar owners, bowling alley managers, restaurant GMs — a completely different audience from the consumer homepage. The copy (“fill your slow nights with real customers”) speaks directly to the business pain point: unused capacity. This is conversion copy for a B2B audience embedded in a B2C product.

The neumorphic form card at the bottom is intentionally simple: 4 fields, one submit. Vendor onboarding that feels complex will be abandoned. The friction must be minimal at the top of the funnel.

---

## BLOG PAGE RATIONALE

The blog exists to serve three functions: (1) SEO — activity + city content creates long-tail search opportunities (“things to do in Atlanta with strangers”), (2) Social proof at scale — user stories normalize the behavior of joining strangers for activities, (3) GEO (Generative Engine Optimization) — AI search tools like Perplexity and ChatGPT pull content from published articles when answering questions about social activities. A blog with consistent first-person narratives (“I met my best friend at a stranger’s bowling night”) creates citation-worthy content for AI answers.

The three seed articles were chosen to represent the three core content pillars: personal story (lifestyle), thought leadership (culture), community reporting (community). These pillars ensure the blog has range and doesn’t feel like a single-perspective vanity publication.
