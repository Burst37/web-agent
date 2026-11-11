---
name: cinematic-website-builder
description: >
  Build cinematic, production-grade websites using 31 scroll, cursor, click, and ambient effect
  modules. Use when the user asks to build a landing page, website, hero section, portfolio,
  product page, or any web experience that should feel premium, dynamic, or visually
  extraordinary. Output is one self-contained HTML file (no frameworks, no build step) plus an
  `/assets/` folder whenever the build uses real images or video. GSAP + ScrollTrigger via CDN only. This skill is the PRODUCTION LAYER of a three-skill pipeline —
  it receives a Handoff Package from UI/UX Designer and/or a Build Brief from Google Stitch.
  If the user hasn't gone through those skills yet and the design direction is unclear, trigger
  ui-ux-designer first.
---

# CINEMATIC WEBSITE BUILDER SKILL
## Space Age AI Solutions — Production Web Experience Layer

This skill is the **final stage** of the three-skill website pipeline. It takes a locked design direction and produces the real, animated, production-grade single-file HTML. Never skip to this skill without knowing the moodboard, color system, font stack, and section structure — if those are unclear, load ui-ux-designer first.

---

## THE PIPELINE (READ THIS FIRST)

Google Stitch is **conditional**, not a fixed middle stage. Most builds — any
scraped-lead / Standard-path build — skip it entirely:

```
╔══════════════════╗                              ╔══════════════════════════╗
║  UI/UX DESIGNER  ║ ────────────────────────────► ║  CINEMATIC WEBSITE       ║
║                  ║   (Standard path — default)   ║  BUILDER  ← YOU ARE HERE ║
║  • Brand audit   ║                                ║                          ║
║  • Moodboard A–N ║   ╔══════════════════╗         ║  • 30 effect modules     ║
║  • Design system ║ ─►║  GOOGLE STITCH   ║────────►║  • GSAP animations       ║
║  • User flow map ║   ║  (Premium path   ║         ║  • Single-file HTML      ║
║  • Handoff pkg   ║   ║   only)          ║         ║  • Production delivery   ║
╚══════════════════╝   ╚══════════════════╝         ╚══════════════════════════╝
```

Stitch has no API — it's a human pasting a prompt into stitch.withgoogle.com and
reviewing 3-5 variations, ~5-10 minutes per site. That's the right tradeoff for a
named Premium client and the wrong one at lead-gen volume, where the Standard
path's moodboard lookup + this skill's own Composition Rules already function as
the layout decision without a human reviewing a mockup first.

### When to call other skills:
- **User says "I don't know what I want"** → Load `ui-ux-designer` first
- **Design + layout is locked, Standard path** → Build directly in this skill
- **Named Premium client, or user explicitly wants to SEE layout options first**
  → `ui-ux-designer` sets `build_path: premium` → Load `google-stitch` before this skill

### If arriving with a Handoff Package, read these fields:
```yaml
# From UI/UX Designer:
handoff_package.brand_personality.moodboard    → apply as visual language
handoff_package.design_system                  → set CSS variables
handoff_package.modules_selected               → use these modules
handoff_package.user_flow                      → build these sections

# From Google Stitch:
website_build_brief.stitch_variation_chosen    → reference the layout
website_build_brief.sections[].layout_notes    → honor Stitch decisions
website_build_brief.sections[].modules         → confirmed module assignments
```

---

## BEFORE YOU CODE — MANDATORY DIRECTION PHASE

Answer these before writing a single line:

1. **Has a Handoff Package or Build Brief arrived?** If YES — skip to the package. If NO — run these 5 questions:
2. **What is the brand's personality?** (Dark/luxury? Clean/tech? Organic/human? Aggressive/edgy?)
3. **What is the #1 feeling on first load?** (Awe? Trust? Excitement? Intrigue?)
4. **What are the 3-5 modules that serve this feeling best?** (Pick from the 30 below)
5. **What is the scroll story?** (Map out: Hero → Problem → Solution → Proof → CTA)
6. **What stays in memory?** (One effect should be so good users mention it)

**Never use more than 6-8 modules per page. Restraint is cinematic. Pile-on is noise.**

### Moodboard Quick Reference — NON-AUTHORITATIVE

**Canonical source: `ui-ux-designer` → Moodboard Registry.** This is a convenience copy
for reading a Handoff Package at a glance; if it ever disagrees with the registry, the
registry wins. Do not add, rename, or re-letter entries here.

| Letter | Aesthetic | Primary Use |
|--------|-----------|-------------|
| A | Space Age Dark Data-Viz | LoyaltyBot, dashboards |
| B | Hardware Console | Developer tools ⚠ |
| C | 3D Clay | Consumer apps |
| D | Liquid Glass | Music, luxury |
| E | Exploded Diagram | Tech hardware ⚠ |
| F | Urban Street/Hip-Hop | Record Exec, music ⚠ |
| G | Forest/Organic | Terra Root, wellness ⚠ |
| H | Fashion Editorial | Portfolio, luxury brands, DTC |
| I | Brutalist | Art, anti-establishment |
| J | Cinematic Film | Film, portfolios, agency work |
| K | Neon Cyberpunk | Gaming, nightlife ⚠ |
| L | Silicon Valley Clean | SaaS, B2B, minimal editorial |
| M | Maximalist Luxury | Space Age Credit |
| N | Retro Futurist | Space Age AI brand ⚠ |

⚠ = named but **no full aesthetic spec exists yet**. Building against one of these means
improvising palette/type/texture from the name alone — flag it, don't do it silently.

`FF` and `HH` are retired letters (folded into `D` and `H`). A brief citing either is
using a stale mapping.

---

## TECH STACK (ALWAYS USE THESE CDNs)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Fonts: Fontsource via jsDelivr. NEVER Google Fonts — design-taste-frontend bans it. -->
<!-- Use WEIGHT-SPECIFIC files. index.css ships weight 400 ONLY — linking it and then
     writing font-weight:900 silently falls back to a synthesized fake bold. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/orbitron@5/900.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/400.css">
```

Pattern: `https://cdn.jsdelivr.net/npm/@fontsource/{font-slug}@5/{weight}.css` — slug is
lowercase-hyphenated (`dm-sans`, not `DM Sans`). Load one `<link>` per weight actually
used; every weight in the design brief needs its own line.

Always register ScrollTrigger: `gsap.registerPlugin(ScrollTrigger);`

**No other library gets added to this list.** If a build needs an atmospheric or
shader background, load the **shader-effects** skill — it provides CSS (Tier 1)
and inline raw-WebGL (Tier 2) implementations that add zero dependencies. Pulling
Three.js is Tier 3: approval-gated, Premium path only, and it fails the QA gate's
fast-load requirement by default.

Bento grid layouts have a numeric spec (exact gap, radius, padding, and the
column-span table per content count) in **design-taste-frontend** →
*Layout Architecture → Bento Grid Rules*. Use those values; do not improvise
spacing.

---

## THE 31 MODULES

---

### MODULE 01 — TEXT MASK REVEAL
**Category:** Scroll-Driven | **Best for:** Hero headlines, section titles, manifesto text

```html
<style>
.mask-text-wrap { position: relative; overflow: hidden; }
.mask-text {
  font-size: clamp(3rem, 8vw, 9rem);
  font-weight: 900;
  line-height: 1;
  color: #1a1a1a;
  position: relative;
}
.mask-text-fill {
  position: absolute;
  inset: 0;
  color: #fff;
  clip-path: inset(0 100% 0 0);
  pointer-events: none;
}
</style>

<div class="mask-text-wrap">
  <div class="mask-text">YOUR HEADLINE HERE</div>
  <div class="mask-text-fill" aria-hidden="true">YOUR HEADLINE HERE</div>
</div>

<script>
gsap.to(".mask-text-fill", {
  clipPath: "inset(0 0% 0 0)",
  ease: "none",
  scrollTrigger: {
    trigger: ".mask-text-wrap",
    start: "top 80%",
    end: "top 20%",
    scrub: 1
  }
});
</script>
```

---

### MODULE 02 — STICKY STACK NARRATIVE
**Category:** Scroll-Driven | **Best for:** Product feature walkthroughs, service explanations
**Canonical source:** `gsap-supercharged` skill (with `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`) — prefer its Sticky Stack implementation; the snippet below is the inline fallback.

```html
<style>
.sticky-section { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; min-height: 100vh; }
.sticky-left { position: sticky; top: 10vh; height: 80vh; display: flex; align-items: center; }
.sticky-img { width: 100%; border-radius: 16px; }
.features-right { padding: 20vh 0; display: flex; flex-direction: column; gap: 60vh; }
.feature-card { opacity: 0; transform: translateY(40px); }
.feature-card h3 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
.feature-card p { font-size: 1.1rem; line-height: 1.7; color: #888; }
</style>

<section class="sticky-section">
  <div class="sticky-left">
    <img class="sticky-img" src="YOUR-IMAGE.jpg" alt="Product">
  </div>
  <div class="features-right">
    <div class="feature-card"><h3>Feature One</h3><p>Description...</p></div>
    <div class="feature-card"><h3>Feature Two</h3><p>Description...</p></div>
    <div class="feature-card"><h3>Feature Three</h3><p>Description...</p></div>
  </div>
</section>

<script>
gsap.utils.toArray(".feature-card").forEach(card => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 0.8,
    scrollTrigger: { trigger: card, start: "top 70%", end: "top 30%", scrub: false }
  });
});
</script>
```

---

### MODULE 03 — LAYERED ZOOM PARALLAX
**Category:** Scroll-Driven | **Best for:** Hero sections, dramatic openings

```html
<style>
.parallax-scene { position: relative; height: 100vh; overflow: hidden; }
.parallax-layer { position: absolute; inset: -20%; will-change: transform; }
.layer-bg { z-index: 1; background: url('bg.jpg') center/cover; }
.layer-mid { z-index: 2; background: url('mid.png') center/cover; }
.layer-fg { z-index: 3; background: url('fg.png') center/cover; }
.parallax-content { position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; height: 100%; }
</style>

<section class="parallax-scene">
  <div class="parallax-layer layer-bg"></div>
  <div class="parallax-layer layer-mid"></div>
  <div class="parallax-layer layer-fg"></div>
  <div class="parallax-content"><h1>YOUR HERO TEXT</h1></div>
</section>

<script>
const layers = [
  { el: ".layer-bg",  speed: 0.2 },
  { el: ".layer-mid", speed: 0.5 },
  { el: ".layer-fg",  speed: 0.9 }
];
layers.forEach(({ el, speed }) => {
  gsap.to(el, {
    yPercent: -30 * speed,
    ease: "none",
    scrollTrigger: { trigger: ".parallax-scene", start: "top top", end: "bottom top", scrub: true }
  });
});
</script>
```

---

### MODULE 04 — HORIZONTAL SCROLL HIJACK
**Category:** Scroll-Driven | **Best for:** Portfolios, product galleries, timelines
**Canonical source:** `gsap-supercharged` skill (with `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`) — prefer its Horizontal Pan implementation; the snippet below is the inline fallback.

```html
<style>
.h-scroll-wrapper { overflow: hidden; }
.h-scroll-track { display: flex; width: max-content; }
.h-scroll-panel { width: 100vw; height: 100vh; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
</style>

<div class="h-scroll-wrapper">
  <div class="h-scroll-track">
    <div class="h-scroll-panel" style="background:#111">Panel 1</div>
    <div class="h-scroll-panel" style="background:#1a1a1a">Panel 2</div>
    <div class="h-scroll-panel" style="background:#222">Panel 3</div>
    <div class="h-scroll-panel" style="background:#2a2a2a">Panel 4</div>
  </div>
</div>

<script>
const track = document.querySelector(".h-scroll-track");
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".h-scroll-wrapper",
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    scrub: 1,
    pin: true
  }
});
</script>
```

---

### MODULE 05 — STICKY CARD STACK
**Category:** Scroll-Driven | **Best for:** Testimonials, process steps, pricing tiers

```html
<style>
.stack-card {
  position: sticky;
  height: 70vh;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}
</style>

<section class="stack-section">
  <div class="stack-card" style="background:#1a1a1a; top: 10vh; z-index:1;">Card 1</div>
  <div class="stack-card" style="background:#222; top: 13vh; z-index:2;">Card 2</div>
  <div class="stack-card" style="background:#2a2a2a; top: 16vh; z-index:3;">Card 3</div>
  <div class="stack-card" style="background:#333; top: 19vh; z-index:4;">Card 4</div>
</section>
```

**Note:** Pure CSS sticky stacking. Adjust `top` values by ~3vh per card for stagger depth.

---

### MODULE 06 — SCROLL SVG DRAW
**Category:** Scroll-Driven | **Best for:** Diagrams, process flows, decorative dividers

```html
<style>
.draw-svg { width: 100%; max-width: 800px; overflow: visible; }
.draw-path { fill: none; stroke: #FF6B00; stroke-width: 3; stroke-linecap: round; }
</style>

<svg class="draw-svg" viewBox="0 0 800 200">
  <path class="draw-path" id="drawPath" d="M0,100 C200,0 400,200 800,100"/>
</svg>

<script>
const path = document.getElementById("drawPath");
const len = path.getTotalLength();
gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
gsap.to(path, {
  strokeDashoffset: 0,
  ease: "none",
  scrollTrigger: { trigger: ".draw-svg", start: "top 80%", end: "top 20%", scrub: 1 }
});
</script>
```

---

### MODULE 07 — CURTAIN REVEAL
**Category:** Scroll-Driven | **Best for:** Hero sections, dramatic content reveals

```html
<style>
.curtain-wrap { position: relative; height: 100vh; overflow: hidden; }
.curtain-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1; }
.curtain { position: absolute; top: 0; width: 50%; height: 100%; z-index: 2; background: #0a0a0a; }
.curtain-left { left: 0; transform-origin: left; }
.curtain-right { right: 0; transform-origin: right; }
</style>

<div class="curtain-wrap">
  <div class="curtain-content"><h1>REVEALED CONTENT</h1></div>
  <div class="curtain curtain-left"></div>
  <div class="curtain curtain-right"></div>
</div>

<script>
const tl = gsap.timeline({
  scrollTrigger: { trigger: ".curtain-wrap", start: "top 60%", end: "top 10%", scrub: 1 }
});
tl.to(".curtain-left", { x: "-100%", ease: "power2.inOut" })
  .to(".curtain-right", { x: "100%", ease: "power2.inOut" }, "<");
</script>
```

---

### MODULE 08 — SPLIT SCREEN SCROLL
**Category:** Scroll-Driven | **Best for:** Before/after, compare/contrast, dual brand stories

```html
<style>
.split-wrap { display: grid; grid-template-columns: 1fr 1fr; height: 200vh; overflow: hidden; }
.split-col { height: 200vh; }
.split-panel { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
</style>

<div class="split-wrap">
  <div class="split-col split-left">
    <div class="split-panel" style="background:#111">Left A</div>
    <div class="split-panel" style="background:#1a1a1a">Left B</div>
  </div>
  <div class="split-col split-right">
    <div class="split-panel" style="background:#222">Right A</div>
    <div class="split-panel" style="background:#2a2a2a">Right B</div>
  </div>
</div>

<script>
gsap.to(".split-left", { yPercent: -50, ease: "none", scrollTrigger: { trigger: ".split-wrap", start: "top top", end: "bottom bottom", scrub: true } });
gsap.to(".split-right", { yPercent: 50, ease: "none", scrollTrigger: { trigger: ".split-wrap", start: "top top", end: "bottom bottom", scrub: true } });
</script>
```

---

### MODULE 09 — SCROLL COLOR SHIFT
**Category:** Scroll-Driven | **Best for:** Multi-section storytelling, mood progression

```html
<style>
body { transition: background-color 0.1s; }
.color-section { height: 100vh; display: flex; align-items: center; justify-content: center; }
</style>

<div class="color-section" data-bg="#0a0a0a" data-text="#ffffff">Section 1 — Dark</div>
<div class="color-section" data-bg="#1a0a00" data-text="#FF6B00">Section 2 — Warm</div>
<div class="color-section" data-bg="#00101a" data-text="#00CFFF">Section 3 — Cool</div>

<script>
document.querySelectorAll(".color-section").forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onEnter: () => {
      gsap.to("body", { backgroundColor: section.dataset.bg, duration: 0.8 });
      gsap.to("body", { color: section.dataset.text, duration: 0.8 });
    },
    onEnterBack: () => {
      gsap.to("body", { backgroundColor: section.dataset.bg, duration: 0.8 });
    }
  });
});
</script>
```

---

### MODULE 10 — CURSOR REACTIVE
**Category:** Cursor & Hover | **Best for:** Premium brands, portfolios, any hero

```html
<style>
* { cursor: none; }
.cursor-dot { position: fixed; width: 8px; height: 8px; background: #FF6B00; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); }
.cursor-ring { position: fixed; width: 36px; height: 36px; border: 1px solid rgba(255,107,0,0.5); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s; }
.cursor-ring.hover { width: 56px; height: 56px; background: rgba(255,107,0,0.1); }
</style>

<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"></div>

<script>
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
function lerp(a, b, t) { return a + (b - a) * t; }
(function animate() {
  rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animate);
})();
document.querySelectorAll('a, button, .magnetic').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => {
    ring.classList.remove('hover');
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)" });
  });
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top + r.height/2);
    gsap.to(el, { x: dx * 0.3, y: dy * 0.3, duration: 0.3 });
  });
});
</script>
```

---

### MODULE 11 — ACCORDION SLIDER
**Category:** Cursor & Hover | **Best for:** Team sections, service offerings, image galleries

```html
<style>
.accordion-slider { display: flex; height: 60vh; gap: 4px; }
.acc-strip { flex: 1; overflow: hidden; position: relative; transition: flex 0.7s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
.acc-strip:hover { flex: 4; }
.acc-strip img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6) grayscale(0.3); transition: filter 0.5s; }
.acc-strip:hover img { filter: brightness(0.9) grayscale(0); }
.acc-label { position: absolute; bottom: 20px; left: 20px; color: white; font-weight: 700; font-size: 1.4rem; opacity: 0; transform: translateY(10px); transition: opacity 0.4s 0.2s, transform 0.4s 0.2s; white-space: nowrap; }
.acc-strip:hover .acc-label { opacity: 1; transform: translateY(0); }
</style>

<div class="accordion-slider">
  <div class="acc-strip"><img src="img1.jpg" alt=""><div class="acc-label">Service One</div></div>
  <div class="acc-strip"><img src="img2.jpg" alt=""><div class="acc-label">Service Two</div></div>
  <div class="acc-strip"><img src="img3.jpg" alt=""><div class="acc-label">Service Three</div></div>
  <div class="acc-strip"><img src="img4.jpg" alt=""><div class="acc-label">Service Four</div></div>
</div>
```

---

### MODULE 12 — CURSOR IMAGE REVEAL / BEFORE-AFTER
**Category:** Cursor & Hover | **Best for:** Portfolio work, before/after showcases

```html
<style>
.compare-wrap { position: relative; width: 100%; height: 60vh; overflow: hidden; cursor: ew-resize; user-select: none; }
.compare-after { position: absolute; inset: 0; background: url('after.jpg') center/cover; }
.compare-before { position: absolute; inset: 0; background: url('before.jpg') center/cover; clip-path: inset(0 50% 0 0); }
.compare-divider { position: absolute; top: 0; bottom: 0; width: 2px; background: white; left: 50%; transform: translateX(-50%); pointer-events: none; }
</style>

<div class="compare-wrap" id="compareWrap">
  <div class="compare-after"></div>
  <div class="compare-before" id="compareBefore"></div>
  <div class="compare-divider" id="compareDivider"></div>
</div>

<script>
const wrap = document.getElementById('compareWrap');
wrap.addEventListener('mousemove', e => {
  const r = wrap.getBoundingClientRect();
  const pct = ((e.clientX - r.left) / r.width) * 100;
  document.getElementById('compareBefore').style.clipPath = `inset(0 ${100-pct}% 0 0)`;
  document.getElementById('compareDivider').style.left = pct + '%';
});
</script>
```

---

### MODULE 13 — HOVER IMAGE TRAIL
**Category:** Cursor & Hover | **Best for:** Creative agencies, portfolios, luxury brands

```html
<style>
.trail-zone { position: relative; height: 80vh; overflow: hidden; }
.trail-img { position: absolute; width: 200px; height: 260px; object-fit: cover; border-radius: 8px; pointer-events: none; transform: translate(-50%, -50%) scale(0.8) rotate(-5deg); opacity: 0; will-change: transform; }
</style>

<div class="trail-zone" id="trailZone"></div>

<script>
const zone = document.getElementById('trailZone');
const images = ['img1.jpg','img2.jpg','img3.jpg','img4.jpg','img5.jpg'];
let idx = 0, lastX = 0, lastY = 0;
zone.addEventListener('mousemove', e => {
  const r = zone.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  if (Math.hypot(x - lastX, y - lastY) < 80) return;
  lastX = x; lastY = y;
  const img = document.createElement('img');
  img.className = 'trail-img';
  img.src = images[idx % images.length];
  img.style.left = x + 'px'; img.style.top = y + 'px';
  zone.appendChild(img);
  gsap.to(img, { opacity: 1, scale: 1, rotate: (Math.random()-0.5)*20, duration: 0.3 });
  gsap.to(img, { opacity: 0, scale: 0.8, duration: 0.5, delay: 0.8, onComplete: () => img.remove() });
  idx++;
});
</script>
```

---

### MODULE 14 — 3D FLIP CARDS
**Category:** Cursor & Hover | **Best for:** Team bios, service features, product specs

```html
<style>
.flip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; }
.flip-card { perspective: 1000px; height: 320px; cursor: pointer; }
.flip-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); }
.flip-card:hover .flip-inner { transform: rotateY(180deg); }
.flip-front, .flip-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
.flip-front { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); }
.flip-back { background: linear-gradient(135deg, #FF6B00, #FF9500); transform: rotateY(180deg); }
</style>

<div class="flip-grid">
  <div class="flip-card">
    <div class="flip-inner">
      <div class="flip-front"><h3>Card Title</h3><p>Hover to flip</p></div>
      <div class="flip-back"><h3>Back Content</h3><p>Hidden detail revealed</p></div>
    </div>
  </div>
</div>
```

---

### MODULE 15 — MAGNETIC REPEL GRID
**Category:** Cursor & Hover | **Best for:** Skills grids, logo walls, navigation menus

```html
<style>
.repel-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 4rem; }
.repel-tile { aspect-ratio: 1; background: #1a1a1a; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #555; }
</style>

<div class="repel-grid" id="repelGrid"></div>

<script>
const grid = document.getElementById('repelGrid');
for (let i = 0; i < 36; i++) {
  const tile = document.createElement('div');
  tile.className = 'repel-tile';
  tile.textContent = '●';
  grid.appendChild(tile);
}
// ONE layout read per frame, not 36 per pointer event. The original read every tile's
// rect inside mousemove (~36 layout queries per event); measured max frame delta 20ms on
// desktop — survivable, since GSAP only writes transforms so no read/write thrash cycle
// forms, but it's the first thing to fall over on a weak device or a busier page.
//
// Tile offsets relative to the grid are static, so cache those and read only the grid's
// own rect each frame. That also avoids needing a scroll listener to invalidate the
// cache — design-motion-principles bans those, and this way none is required.
const tiles = Array.from(grid.querySelectorAll('.repel-tile'));
let offsets = [];
const measure = () => {
  offsets = tiles.map(t => ({
    ox: t.offsetLeft + t.offsetWidth / 2,
    oy: t.offsetTop + t.offsetHeight / 2,
  }));
};
measure();
addEventListener('resize', measure, { passive: true });

let lastX = 0, lastY = 0, queued = false;
grid.addEventListener('mousemove', e => {
  lastX = e.clientX; lastY = e.clientY;
  if (queued) return;              // coalesce: at most one update per frame
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    const g = grid.getBoundingClientRect();   // the ONE layout read per frame
    const maxDist = 120;
    tiles.forEach((tile, i) => {
      const cx = g.left + offsets[i].ox, cy = g.top + offsets[i].oy;
      const dx = lastX - cx, dy = lastY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 30;
        gsap.to(tile, { x: -dx / dist * force, y: -dy / dist * force, duration: 0.4, ease: "power2.out" });
      } else if (gsap.getProperty(tile, 'x') !== 0) {
        gsap.to(tile, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
      }
    });
  });
}, { passive: true });
grid.addEventListener('mouseleave', () => {
  gsap.to(tiles, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.5)", stagger: 0.02 });
});
</script>
```

---

### MODULE 16 — SPOTLIGHT BORDER CARDS
**Category:** Cursor & Hover | **Best for:** Feature cards, pricing, testimonials

```html
<style>
.spotlight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.spot-card { position: relative; background: #111; border-radius: 12px; padding: 2rem; overflow: hidden; }
.spot-card::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,107,0,0.6), transparent 60%);
  opacity: 0; transition: opacity 0.4s; z-index: 0;
}
.spot-card:hover::before { opacity: 1; }
.spot-card-inner { position: relative; z-index: 1; background: #111; border-radius: 11px; padding: 2rem; height: 100%; }
</style>

<div class="spotlight-grid">
  <div class="spot-card"><div class="spot-card-inner"><h3>Feature</h3><p>Description here</p></div></div>
  <div class="spot-card"><div class="spot-card-inner"><h3>Feature</h3><p>Description here</p></div></div>
  <div class="spot-card"><div class="spot-card-inner"><h3>Feature</h3><p>Description here</p></div></div>
</div>

<script>
document.querySelectorAll('.spot-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});
</script>
```

---

### MODULE 17 — DRAG-TO-PAN GRID
**Category:** Cursor & Hover | **Best for:** Project galleries, infinite canvases, mood boards

```html
<style>
.pan-viewport { width: 100vw; height: 100vh; overflow: hidden; cursor: grab; }
.pan-viewport.dragging { cursor: grabbing; }
.pan-canvas { display: grid; grid-template-columns: repeat(6, 300px); gap: 16px; padding: 40px; width: max-content; will-change: transform; }
.pan-item { width: 300px; height: 220px; border-radius: 12px; background: #1a1a1a; }
</style>

<div class="pan-viewport" id="panViewport"><div class="pan-canvas" id="panCanvas"></div></div>

<script>
const vp = document.getElementById('panViewport');
const cv = document.getElementById('panCanvas');
for (let i = 0; i < 24; i++) { const el = document.createElement('div'); el.className = 'pan-item'; cv.appendChild(el); }
let isDragging = false, startX, startY, translateX = 0, translateY = 0, velX = 0, velY = 0;
vp.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX - translateX; startY = e.clientY - translateY; vp.classList.add('dragging'); });
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const nx = e.clientX - startX, ny = e.clientY - startY;
  velX = nx - translateX; velY = ny - translateY;
  translateX = nx; translateY = ny;
  cv.style.transform = `translate(${translateX}px, ${translateY}px)`;
});
window.addEventListener('mouseup', () => {
  isDragging = false; vp.classList.remove('dragging');
  function momentum() {
    if (Math.abs(velX) < 0.5 && Math.abs(velY) < 0.5) return;
    velX *= 0.94; velY *= 0.94; translateX += velX; translateY += velY;
    cv.style.transform = `translate(${translateX}px, ${translateY}px)`;
    requestAnimationFrame(momentum);
  }
  momentum();
});
</script>
```

---

### MODULE 18 — VIEW TRANSITION MORPHING
**Category:** Click & Tap | **Best for:** Product detail reveals, page-like state changes
**⚠ Progressive enhancement only — NOT at parity with the other modules.**
`document.startViewTransition` is Chromium-only; Safari/iOS gets no transition at all,
just an instant show/hide. Since local-business traffic skews heavily mobile-Safari,
never count this module as "the one unforgettable moment" — the majority of visitors
won't see it. Use it as a bonus on top of an effect that works everywhere, and give
the fallback a real CSS transition (below) rather than a bare display flip.

```html
<style>
.morph-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.morph-card { view-transition-name: card; aspect-ratio: 3/2; border-radius: 12px; background: #1a1a1a; cursor: pointer; }
.morph-expanded { position: fixed; inset: 0; z-index: 100; border-radius: 0; view-transition-name: card; background: #111;
  /* Fallback path (Safari/iOS): opacity+transform transition instead of an instant flip.
     Uses visibility, not display:none — display can't be transitioned. */
  visibility: hidden; opacity: 0; transform: scale(0.98);
  transition: opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1), visibility 280ms; }
.morph-expanded.open { visibility: visible; opacity: 1; transform: scale(1); }
@media (prefers-reduced-motion: reduce) { .morph-expanded { transition-duration: 1ms; } }
</style>

<div class="morph-grid">
  <div class="morph-card" onclick="expandCard(this)">Card 1</div>
  <div class="morph-card" onclick="expandCard(this)">Card 2</div>
</div>
<div class="morph-expanded" id="expanded" onclick="collapseCard()"><button>Close</button></div>

<script>
const expanded = document.getElementById('expanded');
const openIt  = () => expanded.classList.add('open');
const closeIt = () => expanded.classList.remove('open');

function expandCard(card) {
  if (!document.startViewTransition) return openIt();   // CSS transition carries it
  document.startViewTransition(openIt);
}
function collapseCard() {
  if (!document.startViewTransition) return closeIt();
  document.startViewTransition(closeIt);
}
// Escape must close it — a fixed full-screen overlay with no keyboard exit is a trap.
document.addEventListener('keydown', e => { if (e.key === 'Escape') collapseCard(); });
</script>
```

---

### MODULE 19 — PARTICLE EXPLOSION BUTTON
**Category:** Click & Tap | **Best for:** Primary CTAs, form submits, purchase buttons

```html
<style>
.particle-btn-wrap { position: relative; display: inline-block; }
.particle-btn { padding: 16px 42px; font-size: 1.1rem; font-weight: 700; letter-spacing: 2px; background: #FF6B00; color: white; border: none; border-radius: 6px; cursor: pointer; text-transform: uppercase; }
.particle { position: absolute; border-radius: 50%; pointer-events: none; }
</style>

<div class="particle-btn-wrap">
  <button class="particle-btn" id="pBtn">Get Started</button>
</div>

<script>
document.getElementById('pBtn').addEventListener('click', function() {
  const colors = ['#FF6B00','#FF9500','#FFD700','#FF2040','#fff'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 10 + 4;
    p.style.cssText = `width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};left:50%;top:50%;`;
    this.parentNode.appendChild(p);
    const angle = (Math.PI * 2 * i) / 20;
    const dist = 60 + Math.random() * 80;
    gsap.fromTo(p,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      { x: Math.cos(angle)*dist, y: Math.sin(angle)*dist, opacity: 0, scale: 0, duration: 0.6 + Math.random()*0.4, ease: "power2.out", onComplete: () => p.remove() }
    );
  }
});
</script>
```

---

### MODULE 20 — ODOMETER COUNTER
**Category:** Click & Tap | **Best for:** Stats sections, social proof, metrics dashboards

```html
<style>
.stats-row { display: flex; gap: 4rem; justify-content: center; flex-wrap: wrap; }
.odometer { font-size: 5rem; font-weight: 900; font-variant-numeric: tabular-nums; color: #FF6B00; line-height: 1; }
.stat-label { font-size: 0.9rem; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-top: 8px; }
</style>

<div class="stats-row">
  <div class="stat-item"><div class="odometer" data-target="524" data-suffix="">0</div><div class="stat-label">Brands Enrolled</div></div>
  <div class="stat-item"><div class="odometer" data-target="37" data-suffix="%">0</div><div class="stat-label">Success Rate</div></div>
</div>

<script>
document.querySelectorAll('.odometer').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: "top 80%", once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: parseInt(el.dataset.target), duration: 2, ease: "power2.out",
        onUpdate: function() { el.textContent = Math.round(this.targets()[0].val).toLocaleString() + (el.dataset.suffix || ''); }
      });
    }
  });
});
</script>
```

---

### MODULE 21 — 3D COVERFLOW CAROUSEL
**Category:** Click & Tap | **Best for:** Testimonials, featured products, portfolio pieces
**Inputs:** click, touch swipe, and keyboard. Keyboard-only was the original
implementation — that left this module completely inert on mobile, which fails the
QUALITY CHECK's own "works on mobile" requirement. All three are now wired.

```html
<style>
.coverflow-wrap { perspective: 1200px; width: 100%; height: 420px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.coverflow-track { display: flex; gap: 20px; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
.coverflow-item { width: 280px; height: 360px; border-radius: 16px; background: #1a1a1a; flex-shrink: 0; transition: transform 0.5s, opacity 0.5s; }
.coverflow-item.active { transform: scale(1.1); opacity: 1; }
.coverflow-item.prev1, .coverflow-item.next1 { opacity: 0.6; }
</style>

<div class="coverflow-wrap">
  <div class="coverflow-track" id="cfTrack">
    <div class="coverflow-item">1</div>
    <div class="coverflow-item">2</div>
    <div class="coverflow-item active">3</div>
    <div class="coverflow-item">4</div>
    <div class="coverflow-item">5</div>
  </div>
</div>

<script>
let current = 2;
const items = document.querySelectorAll('.coverflow-item');
function update() {
  items.forEach((el, i) => {
    el.className = 'coverflow-item';
    const d = i - current;
    if (d === 0) el.classList.add('active');
    else if (d === -1) { el.classList.add('prev1'); el.style.transform = 'rotateY(30deg) translateX(-30px) scale(0.9)'; }
    else if (d === 1) { el.classList.add('next1'); el.style.transform = 'rotateY(-30deg) translateX(30px) scale(0.9)'; }
  });
}
function go(n) { current = Math.max(0, Math.min(items.length - 1, n)); update(); }

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); go(current - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
});

// Click — tapping a side card brings it to front
items.forEach((el, i) => {
  el.style.cursor = 'pointer';
  el.setAttribute('tabindex', '0');
  el.addEventListener('click', () => go(i));
});

// Touch swipe — without this the module is dead on mobile
const track = document.getElementById('cfTrack');
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });

update();
</script>
```

---

### MODULE 22 — DYNAMIC ISLAND NAV
**Category:** Click & Tap | **Best for:** Minimal navigation, modern nav bars

```html
<style>
.island-wrap { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; }
.island { background: #0a0a0a; border-radius: 100px; padding: 12px 24px; display: flex; align-items: center; gap: 24px; transition: all 0.5s cubic-bezier(0.4,0,0.2,1); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; white-space: nowrap; }
.island.expanded { padding: 16px 32px; gap: 32px; }
.island-logo { font-weight: 900; letter-spacing: 2px; font-size: 0.85rem; color: #FF6B00; }
.island-nav { display: flex; gap: 24px; opacity: 0; width: 0; overflow: hidden; transition: opacity 0.3s, width 0.5s; }
.island.expanded .island-nav { opacity: 1; width: auto; }
.island-nav a { color: #888; text-decoration: none; font-size: 0.85rem; }
</style>

<div class="island-wrap">
  <div class="island" id="island">
    <div class="island-logo">SPACE AGE AI</div>
    <nav class="island-nav">
      <a href="#">Services</a><a href="#">Clients</a><a href="#">Pricing</a><a href="#">Contact</a>
    </nav>
    <button style="background:none;border:none;color:#555;cursor:pointer;" onclick="document.getElementById('island').classList.toggle('expanded')">☰</button>
  </div>
</div>
```

---

### MODULE 23 — macOS DOCK NAV
**Category:** Click & Tap | **Best for:** App-style navigation, bottom nav

```html
<style>
.dock { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 8px; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 20px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.1); }
.dock-item { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; transform-origin: bottom center; background: rgba(255,255,255,0.08); position: relative; }
</style>

<div class="dock" id="dock">
  <div class="dock-item">►</div>
  <div class="dock-item">👤</div>
  <div class="dock-item">📊</div>
  <div class="dock-item">⚙️</div>
</div>

<script>
const dockItems = document.querySelectorAll('.dock-item');
document.getElementById('dock').addEventListener('mousemove', e => {
  dockItems.forEach(item => {
    const r = item.getBoundingClientRect();
    const dist = Math.abs(e.clientX - (r.left + r.width/2));
    const scale = dist < 100 ? 1 + (1 - dist/100) * 0.8 : 1;
    item.style.transform = `scale(${scale})`;
  });
});
document.getElementById('dock').addEventListener('mouseleave', () => {
  dockItems.forEach(item => item.style.transform = 'scale(1)');
});
</script>
```

---

### MODULE 24 — TEXT SCRAMBLE DECODE
**Category:** Ambient & Auto | **Best for:** Hero headlines, loading states, tech brands

```html
<style>
.scramble-text { font-size: clamp(2.5rem, 6vw, 6rem); font-weight: 900; font-family: monospace; letter-spacing: 2px; }
</style>

<h1 class="scramble-text" id="scrambleEl" data-text="SPACE AGE AI">SPACE AGE AI</h1>

<script>
class TextScramble {
  constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}=+*^?#@$%&'; }
  setText(newText) {
    const len = Math.max(this.el.innerText.length, newText.length);
    return new Promise(resolve => {
      let queue = [], frame = 0;
      for (let i = 0; i < len; i++) {
        const from = this.el.innerText[i] || '', to = newText[i] || '';
        const start = Math.floor(Math.random() * 20), end = start + Math.floor(Math.random() * 20) + 10;
        queue.push({ from, to, start, end });
      }
      const update = () => {
        let output = '', complete = 0;
        for (let i = 0; i < queue.length; i++) {
          const { from, to, start, end } = queue[i];
          let char = '';
          if (frame >= end) { complete++; char = to; }
          else if (frame >= start) char = this.chars[Math.floor(Math.random() * this.chars.length)];
          else char = from;
          output += char;
        }
        this.el.innerText = output;
        if (complete === queue.length) { resolve(); } else { frame++; requestAnimationFrame(update); }
      };
      requestAnimationFrame(update);
    });
  }
}
// Reduced-motion: show the final text immediately. This is a raw rAF loop, so the
// GSAP-focused guard in OUTPUT STANDARDS does not cover it — guard it here.
const scrambleEl = document.getElementById('scrambleEl');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  scrambleEl.innerText = scrambleEl.dataset.text;
} else {
  new TextScramble(scrambleEl).setText(scrambleEl.dataset.text);
}
</script>
```

---

### MODULE 25 — KINETIC MARQUEE
**Category:** Ambient & Auto | **Best for:** Client logos, skill lists, social proof banners

```html
<style>
.marquee-wrap { overflow: hidden; white-space: nowrap; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
.marquee-track { display: inline-flex; gap: 60px; will-change: transform; }
.marquee-item { font-size: 1.1rem; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #333; }
</style>

<div class="marquee-wrap">
  <div class="marquee-track" id="marqueeTrack">
    <div class="marquee-item">LoyaltyBot <span style="color:#FF6B00">&#9733;</span></div>
    <div class="marquee-item">Space Age AI <span style="color:#FF6B00">&#9733;</span></div>
    <div class="marquee-item">Auto Signups <span style="color:#FF6B00">&#9733;</span></div>
    <div class="marquee-item">Record Exec <span style="color:#FF6B00">&#9733;</span></div>
    <div class="marquee-item">LoyaltyBot <span style="color:#FF6B00">&#9733;</span></div>
    <div class="marquee-item">Space Age AI <span style="color:#FF6B00">&#9733;</span></div>
  </div>
</div>

<script>
// Velocity comes from ScrollTrigger.getVelocity(), NOT a scroll listener.
// design-motion-principles bans window.addEventListener('scroll', ...) outright.
let x = 0, speed = 1.5, targetSpeed = 1.5, running = true;
const track = document.getElementById('marqueeTrack');
const trackWidth = track.scrollWidth / 2;

ScrollTrigger.create({
  trigger: '.marquee-wrap',
  start: 'top bottom',
  end: 'bottom top',
  onUpdate: (self) => {
    targetSpeed = 1.5 + Math.min(Math.abs(self.getVelocity()) / 200, 12);
  },
  onToggle: (self) => { running = self.isActive; }   // stop work when offscreen
});

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) {
  (function animate() {
    if (running) {
      speed += (targetSpeed - speed) * 0.1;
      targetSpeed = Math.max(1.5, targetSpeed * 0.95);
      x -= speed;
      if (Math.abs(x) >= trackWidth) x = 0;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  })();
}
// Pause on hidden tab — required for every infinite loop.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) running = false;
});
</script>
```

---

### MODULE 26 — MESH GRADIENT BACKGROUND
**Category:** Ambient & Auto | **Best for:** Hero backgrounds, section backgrounds

```html
<style>
.mesh-bg { position: absolute; inset: 0; overflow: hidden; background: #050505; filter: blur(60px) saturate(1.5); }
.mesh-blob { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: blobDrift var(--dur, 12s) ease-in-out infinite alternate; }
/* CSS-keyframe module — the GSAP guard in OUTPUT STANDARDS does not reach it. */
@media (prefers-reduced-motion: reduce) { .mesh-blob { animation: none; } }
@keyframes blobDrift {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(var(--tx1, 30px), var(--ty1, -40px)) scale(1.15); }
  66% { transform: translate(var(--tx2, -20px), var(--ty2, 30px)) scale(0.9); }
  100% { transform: translate(var(--tx3, 40px), var(--ty3, 20px)) scale(1.2); }
}
</style>

<div class="mesh-bg" id="meshBg"></div>

<script>
const blobs = [
  { color: '#FF6B00', size: 600, x: '20%', y: '20%', dur: '14s' },
  { color: '#FF2040', size: 500, x: '60%', y: '10%', dur: '18s' },
  { color: '#8B00FF', size: 700, x: '30%', y: '60%', dur: '22s' },
  { color: '#00CFFF', size: 400, x: '75%', y: '70%', dur: '16s' },
];
blobs.forEach(b => {
  const el = document.createElement('div');
  el.className = 'mesh-blob';
  el.style.cssText = `width:${b.size}px;height:${b.size}px;left:${b.x};top:${b.y};background:${b.color};--dur:${b.dur};opacity:0.7;`;
  document.getElementById('meshBg').appendChild(el);
});
</script>
```

---

### MODULE 27 — CIRCULAR TEXT PATH
**Category:** Ambient & Auto | **Best for:** Decorative badges, rotating labels

```html
<style>
.circle-text-wrap { display: inline-block; position: relative; width: 180px; height: 180px; }
.circle-text-svg { animation: rotateSlow 12s linear infinite; }
@keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .circle-text-svg { animation: none; } }
.circle-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 1.5rem; }
</style>

<div class="circle-text-wrap">
  <svg class="circle-text-svg" viewBox="0 0 180 180" width="180" height="180">
    <defs>
      <path id="circlePath" d="M 90,90 m -65,0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0"/>
    </defs>
    <text fill="#FF6B00" font-size="11" font-weight="700" letter-spacing="4" font-family="monospace">
      <textPath href="#circlePath">SPACE AGE AI SOLUTIONS • LOYALTYBOT • </textPath>
    </text>
  </svg>
  <div class="circle-center">★</div>
</div>
```

---

### MODULE 28 — GLITCH EFFECT
**Category:** Ambient & Auto | **Best for:** Tech brands, gaming, bold attention-grabbers

```html
<style>
.glitch-wrap { position: relative; display: inline-block; }
.glitch-text { font-size: clamp(3rem, 8vw, 8rem); font-weight: 900; color: white; }
.glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; font-size: inherit; font-weight: inherit; opacity: 0; }
.glitch-text::before { color: #FF2040; animation: glitchR 4s infinite; clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); }
.glitch-text::after { color: #00CFFF; animation: glitchB 4s infinite 0.1s; clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%); }
@keyframes glitchR {
  0%, 90%, 100% { opacity: 0; transform: none; }
  91% { opacity: 1; transform: translate(-3px, 0); }
  92% { opacity: 0; }
  94% { opacity: 1; transform: translate(3px, -2px); }
  95% { opacity: 0; }
}
@keyframes glitchB {
  0%, 90%, 100% { opacity: 0; transform: none; }
  91% { opacity: 1; transform: translate(3px, 0); }
  93% { opacity: 0; }
  95% { opacity: 1; transform: translate(-3px, 2px); }
  96% { opacity: 0; }
}
/* Glitch is exactly the kind of effect reduced-motion exists to suppress —
   rapid stutter/flash is a vestibular and photosensitivity trigger. */
@media (prefers-reduced-motion: reduce) {
  .glitch-text::before, .glitch-text::after { animation: none; opacity: 0; }
}
</style>

<div class="glitch-wrap">
  <div class="glitch-text" data-text="GLITCH">GLITCH</div>
</div>
```

---

### MODULE 29 — TYPEWRITER EFFECT
**Category:** Ambient & Auto | **Best for:** Subheadings, rotating value props, taglines

```html
<style>
.typewriter-wrap { display: inline-flex; align-items: center; gap: 2px; }
.typewriter-text { font-size: clamp(1.2rem, 3vw, 2rem); font-weight: 600; }
.typewriter-cursor { width: 2px; height: 1.2em; background: #FF6B00; animation: blink 0.7s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .typewriter-cursor { animation: none; } }
</style>

<div class="typewriter-wrap">
  <span class="typewriter-text" id="typewriterEl"></span>
  <div class="typewriter-cursor"></div>
</div>

<script>
const phrases = ['Loyalty Programs Automated', 'AI Solutions That Work', 'Your Bot Works While You Sleep', '524 Signups and Counting'];
let phraseIdx = 0, charIdx = 0, deleting = false;
const el = document.getElementById('typewriterEl');
// Reduced-motion: render the first phrase statically, never cycle.
// setTimeout loop — not covered by the GSAP guard in OUTPUT STANDARDS.
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  el.textContent = phrases[0];
} else {
  type();
}
function type() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    el.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
    setTimeout(type, 60);
  } else {
    el.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
    setTimeout(type, deleting ? 30 : 80);
  }
}
</script>
```

---

### MODULE 30 — GRADIENT STROKE TEXT
**Category:** Ambient & Auto | **Best for:** Display headlines, section dividers

```html
<svg width="100%" viewBox="0 0 1200 200" id="strokeTextSvg">
  <defs>
    <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF6B00"><animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite"/></stop>
      <stop offset="50%" stop-color="#FFD700"><animate attributeName="offset" values="0.5;1.5;0.5" dur="3s" repeatCount="indefinite"/></stop>
      <stop offset="100%" stop-color="#FF2040"><animate attributeName="offset" values="1;2;1" dur="3s" repeatCount="indefinite"/></stop>
    </linearGradient>
  </defs>
  <text x="50%" y="75%" text-anchor="middle" font-size="160" font-weight="900" font-family="sans-serif" fill="none" stroke="url(#strokeGrad)" stroke-width="2">SPACE AGE AI</text>
</svg>

<script>
// SMIL <animate> respects neither the GSAP guard nor a CSS animation:none rule.
// pauseAnimations() is the only way to honour reduced-motion here.
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('strokeTextSvg').pauseAnimations();
}
</script>
```

---

### MODULE 31 — SCROLL SCRUB (CANVAS FRAME SEQUENCE)
**Category:** Scroll-Driven | **Best for:** Hero "one continuous shot" openings, product reveals
**Requires:** a source video → extracted JPEG frames in `/assets/frames/`
**Mandatory:** load `motion-verification` and pass its jank test before shipping this module.

> This module previously existed only as dangling references (the asset matrix and the
> FFmpeg step both pointed at a "Scroll Scrub" module that was never actually written).
> Built here so those references resolve.

**Never scrub `<video currentTime>`** — seek latency stutters. The only jank-free path is
pre-extracted frames blitted to a canvas.

Frame extraction (run before building — see ASSET PIPELINE INTEGRATION):
```bash
ffmpeg -i hero.mp4 -vf "fps=30,scale=1280:-1" -q:v 4 assets/frames/f_%04d.jpg
# ~300 frames at 1280px wide is the budget. Dark/grainy footage nearly doubles
# JPEG bytes — resist going wider.
```

```html
<style>
.scrub-driver { height: 500vh; position: relative; }           /* ~170vh per beat */
.scrub-stage  { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.scrub-canvas { width: 100%; height: 100%; display: block; object-fit: cover; }
</style>

<div class="scrub-driver" id="scrubDriver">
  <div class="scrub-stage"><canvas class="scrub-canvas" id="scrubCanvas"></canvas></div>
</div>

<script>
(() => {
  const FRAME_COUNT = 300;
  const src = i => `assets/frames/f_${String(i + 1).padStart(4, '0')}.jpg`;
  const driver = document.getElementById('scrubDriver');
  const canvas = document.getElementById('scrubCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const images = new Array(FRAME_COUNT);
  const bitmaps = new Map(), decoding = new Set();
  const B_AHEAD = 18, B_KEEP = 28;
  let bmpCenter = -999, currentFrame = 0, displayed = -1;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);   // 2.0 doubles blit cost for no gain
    canvas.width  = Math.floor(canvas.clientWidth  * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  }
  addEventListener('resize', () => { resize(); drawFrame(Math.round(currentFrame), true); }, { passive: true });

  function nearestLoaded(i) {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (images[i - d]?.complete) return i - d;
      if (images[i + d]?.complete) return i + d;
    }
    return -1;
  }

  function drawFrame(i, force) {
    if (i === displayed && !force) return;
    const bmp = bitmaps.get(i);
    const srcImg = bmp || images[nearestLoaded(i)];
    if (!srcImg) return;
    // cover-fit
    const cw = canvas.width, ch = canvas.height;
    const iw = srcImg.width, ih = srcImg.height;
    const s = Math.max(cw / iw, ch / ih);
    ctx.drawImage(srcImg, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
    displayed = i;
  }

  // THE ANTI-JANK CORE: decode off-thread around the playhead so every draw is a pure
  // GPU blit. drawImage(HTMLImageElement) forces a SYNCHRONOUS JPEG decode on the main
  // thread at first paint and again after cache eviction — those spikes are the
  // "glitchy frame-by-frame" feel.
  function ensureBitmaps(center) {
    if (Math.abs(center - bmpCenter) < 3) return;
    bmpCenter = center;
    const lo = Math.max(0, center - B_AHEAD), hi = Math.min(FRAME_COUNT - 1, center + B_AHEAD);
    for (let i = lo; i <= hi; i++) {
      if (bitmaps.has(i) || decoding.has(i) || !images[i]?.complete) continue;
      decoding.add(i);
      createImageBitmap(images[i]).then(b => {
        decoding.delete(i);
        if (Math.abs(i - bmpCenter) > B_KEEP) { b.close(); return; }
        bitmaps.set(i, b);
        if (i === displayed) drawFrame(i, true);      // repaint if shown frame upgraded
      }).catch(() => decoding.delete(i));
    }
    for (const k of Array.from(bitmaps.keys())) {
      if (k < center - B_KEEP || k > center + B_KEEP) { bitmaps.get(k).close(); bitmaps.delete(k); }
    }
  }

  // Concurrency-capped loader (~10 in flight)
  let next = 0, inFlight = 0;
  function pump() {
    while (inFlight < 10 && next < FRAME_COUNT) {
      const i = next++;
      const img = new Image();
      images[i] = img;
      inFlight++;
      img.onload = img.onerror = () => { inFlight--; if (i === 0) { resize(); drawFrame(0, true); } pump(); };
      img.src = src(i);
    }
  }
  resize(); pump();

  function progress() {
    const r = driver.getBoundingClientRect();
    return Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
  }

  if (reduced) {
    // Static first frame — no scrub loop at all.
    const once = () => drawFrame(0, true);
    setTimeout(once, 300);
  } else {
    (function tick() {
      const target = progress() * (FRAME_COUNT - 1);
      currentFrame += (target - currentFrame) * 0.14;   // lerp = the butter; direct feels mechanical
      const idx = Math.round(currentFrame);
      ensureBitmaps(idx);
      drawFrame(idx);
      requestAnimationFrame(tick);
    })();
  }

  // Dev contract for motion-verification
  window.__ready = true;
})();
</script>
```

**Ordering law:** this is a `position: sticky` stage, but if you combine it with any
`pin: true` ScrollTrigger elsewhere on the page, create the pinned triggers FIRST —
see design-motion-principles → Forbidden Patterns.

**Testing gotcha:** frames loaded over `file://` taint the canvas, so `getImageData`
throws `SecurityError` and any pixel-level QA silently fails. Always test this module
over a local server (`npx serve . -p 3000`), never by opening the HTML file directly.

**Verified behaviour** (headless Chromium, 60-frame fixture): scroll position maps to
the correct frame (0 at top, ~30 at midpoint, 59 at end) and the ImageBitmap window
peaks at ~47 entries then evicts — memory stays bounded rather than growing to the
full frame count, which is the property that makes this safe at 300 frames.

---

## MODULE CONFLICT TABLE (CHECK BEFORE COMBINING)

The 6-8 module cap is about restraint. This table is about modules that actively
break each other. Check it before finalizing a module set.

| Conflict | Why | Resolution |
| :---- | :---- | :---- |
| **10 (Cursor Reactive) + 12 (Before-After)** | Module 10 sets `* { cursor: none }`; Module 12 sets `cursor: ew-resize`. The element rule wins on specificity, so the OS cursor reappears inside the compare zone while Module 10's custom ring keeps trailing on top — two cursors visible at once. | Inside Module 12's zone add `cursor: none` and drive an `ew-resize` affordance visually (the divider handle), or drop Module 10 on that page. |
| **10 (Cursor Reactive) + 17 (Drag-to-Pan)** | Same collision via `cursor: grab` / `grabbing`. | Same fix — keep `cursor: none` and change the custom ring's appearance on drag instead. |
| **10 (Cursor Reactive) + 23 (macOS Dock)** | Both bind `mousemove` and write transforms on shared targets; the dock's magnify fights Module 10's magnetic pull on the same elements. | Exclude `.dock-item` from Module 10's magnetic selector. |
| **04 (Horizontal Hijack) + any snap/pin module** | Both pin. Nested/adjacent pins compute against each other's pin-spacers — the ordering law applies and mis-positioning is silent. | Create all pinned triggers first; never nest two pinned scroll regions. |
| **09 (Scroll Color Shift) + 26 (Mesh Gradient)** | Module 9 animates `body` background; Module 26 paints a full-bleed background layer over it. The color shift becomes invisible. | Pick one background system per page. |
| **Any two `cursor: none` modules** | Two custom cursor elements both tracking the pointer. | One cursor system per page, period. |
| **31 (Scroll Scrub) + 21 (Coverflow) on mobile** | Scrub holds a sticky full-viewport canvas; Coverflow's touch swipe competes with vertical scroll inside it. | Don't place Coverflow inside or immediately adjacent to the scrub stage on touch devices. |

---

## COMPOSITION RULES

**Landing Page (SaaS/Agency):**
- Hero: Module 07 (Curtain) + 24 (Scramble) + 10 (Cursor)
- Features: Module 02 (Sticky Stack) or 16 (Spotlight Cards)
- Social Proof: Module 20 (Odometer) + 25 (Marquee)
- CTA: Module 19 (Particle Button)
- Footer: Module 27 (Circle Text) + 29 (Typewriter)

**Portfolio:**
- Hero: Module 03 (Parallax) + 30 (Stroke Text)
- Gallery: Module 04 (Horizontal Hijack) or 13 (Image Trail)
- Projects: Module 17 (Drag Grid) or 18 (Morphing)
- Skills: Module 15 (Repel Grid) + 20 (Odometer)

**Product Page:**
- Hero: Module 01 (Text Mask) + 26 (Mesh Gradient)
- Features: Module 05 (Card Stack) + 11 (Accordion)
- Specs: Module 14 (Flip Cards)
- Purchase CTA: Module 19 (Particle Button) + 22 (Island Nav)

**Storytelling/Brand:**
- Opening: Module 07 (Curtain) or 08 (Split Screen)
- Narrative: Module 09 (Color Shift) + 06 (SVG Draw)
- Pull Quote: Module 28 (Glitch) or 24 (Scramble)
- Closing: Module 01 (Text Mask) + 19 (Particle CTA)

---

## OUTPUT STANDARDS

Every output HTML file must include:
1. `<!DOCTYPE html>` with `lang="en"`
2. Mobile-responsive viewport meta tag
3. CSS custom properties (variables) at `:root` for all brand colors
4. All fonts from **Fontsource via jsDelivr**, weight-specific files
   (`@fontsource/{slug}@5/{weight}.css`). **Never Google Fonts** — `design-taste-frontend`
   bans it, and `index.css` ships weight 400 only, so linking it while styling
   `font-weight: 900` silently renders a synthesized fake bold.
5. GSAP + ScrollTrigger from cdnjs CDN
6. `gsap.registerPlugin(ScrollTrigger)` before any animation
7. Smooth scroll: `html { scroll-behavior: smooth; }`
8. Respects `prefers-reduced-motion` **across all four animation mechanisms** — a
   GSAP-only guard is not sufficient, and roughly a third of the modules don't use GSAP:
   - **GSAP/JS:** wrap in `if (!matchMedia('(prefers-reduced-motion: reduce)').matches)`
   - **CSS `@keyframes`** (Modules 26, 27, 28, 29): add
     `@media (prefers-reduced-motion: reduce) { animation: none; }`
   - **Raw `rAF` / `setTimeout` loops** (Modules 24, 25, 29, 31): check `matchMedia`
     before starting the loop and render the resting state instead
   - **SVG SMIL `<animate>`** (Module 30): neither guard reaches it — call
     `svgEl.pauseAnimations()`
9. No external dependencies beyond CDNs
10. Every infinite loop (`rAF`, marquee, shader, particle field) pauses on
    `visibilitychange` and when scrolled offscreen — a loop burning CPU on a hidden
    tab is a battery bug
11. **Delivery is one HTML file + an `/assets/` folder** when the build uses real
    images or video. Real media is never inlined as base64 — it blows the fast-load
    gate. When deploying, the assets folder ships with the HTML.

## QUALITY CHECK BEFORE DELIVERING

- [ ] Does the page have ONE unforgettable moment?
- [ ] Are modules serving the content or showing off?
- [ ] Does it load fast? (No images over 500kb placeholder-wise)
- [ ] Does the cursor effect feel premium, not janky?
- [ ] Is the typography actually beautiful (not Arial/Roboto)?
- [ ] Does scroll feel smooth (scrub values tuned, not snappy)?
- [ ] Does it work on mobile? (Touch events, no cursor effects)

---

## PLAYWRIGHT QA INTEGRATION — AUTOMATED DELIVERY PROTOCOL

> **Availability check first.** `playwright-browser-automation` is **not present in this
> skills directory** — nor are `asset-automation` or `animated-website-pipeline`,
> referenced further below. Treat all three as intended-but-unbuilt. Until they exist:
> - **QA:** run the device matrix below directly with Playwright (`npx playwright`),
>   and use the **motion-verification** skill (which does exist) for the jank test and
>   the `?jump=` screenshot harness.
> - **Assets:** generate via the Higgsfield MCP tools directly, following the
>   ASSET PIPELINE INTEGRATION ordering rules below — the ordering is the load-bearing
>   part, not the skill wrapper.
>
> Do not report a QA step as "run" because a skill name was invoked. If the skill isn't
> there, do the work with the tool directly or say the step was skipped.

Run this protocol before every client handoff.

### Pre-Flight: Start Dev Server
```bash
npx serve . -p 3000
# or
python -m http.server 3000
```

### QA Run — Automated
```
DEVICE MATRIX — run all three:
  Desktop  → browser_resize({ width: 1440, height: 900 })
  Tablet   → browser_resize({ device: "iPad Pro 11" })
  Mobile   → browser_resize({ device: "iPhone 15" })

FOR EACH DEVICE:
  1. browser_navigate → http://localhost:3000/[file].html
  2. browser_screenshot → ./qa/[project]-[device]-initial-load.png
  3. Scroll at 25%, 50%, 75%, 100% → screenshot each
  4. Test each module's interaction
  5. browser_console → flag any errors
  6. browser_network_requests → flag any 4xx/5xx

PASS CRITERIA:
  ✅ Zero JS console errors
  ✅ Zero 404s on any asset or CDN request
  ✅ All scroll animations trigger correctly
  ✅ All hover/click interactions respond
  ✅ Fonts loaded (not system fallback)
  ✅ No layout breaks on mobile
  ✅ Custom cursor hidden on touch devices
  ✅ LCP element (usually the hero image/headline) has no animation-driven
     delay — reveal it with pure CSS on load, never gate it behind a JS
     timeline. A hero that fades in via GSAP after a 400ms stagger is a
     Core Web Vitals regression, not a design choice.
  ✅ No layout shift as animated elements enter — reserve their box (fixed
     height/aspect-ratio) before the entrance animation runs; never let a
     fade-in or stagger reflow content around it (CLS)
```

**Jank measurement, not eyeballing.** For any build using pinned scenes (Modules 02,
04, 05), **Module 31 (Scroll Scrub)**, or the section-snap pattern, the screenshot-based
checks above don't catch frame drops. Load the **motion-verification** skill and run its
jank test — it measures real per-frame deltas (p95/max, never average) and
fails the build if `max ≥ 50ms`. A build that "looks smooth" in a screenshot
can still be dropping frames; only the measured harness proves it isn't.

---

## ASSET PIPELINE INTEGRATION

When building sites that require AI-generated images or videos (Higgsfield assets),
**do not build the site first**. The asset pipeline runs before Phase 3.

```
CORRECT ORDER:
  1. Lock design direction (UI/UX Designer + Google Stitch)
  2. Write assets-to-generate.md based on confirmed section list
  3. Run asset-automation skill → generate all assets via Higgsfield
  4. Run FFmpeg frame extraction if hero uses scroll-scrub — command is in Module 31,
     output goes to assets/frames/ (no separate skill needed)
  5. Drop assets into /public/assets/ or reference folder
  6. THEN build the HTML referencing real asset paths
  7. Run Playwright QA

WRONG ORDER (causes rework):
  ❌ Build site with placeholder images → swap assets later
  ❌ Use lorem images → real assets never match placeholder dimensions
  ❌ Reference assets before generation is confirmed complete
```

### Module × Asset Type Matrix
Module names below now match the actual module list. The previous version of this table
listed "12 Video Reveal" and "21 Scroll Scrub" — neither matched Module 12 (a
before/after image compare slider) or Module 21 (a coverflow carousel), and no
"Scroll Scrub" module existed at all. It exists now as Module 31.

| Module | Asset Type Needed | Generation Model |
|---|---|---|
| 03 Parallax | High-res hero image + mid/fg layers | NanoBanana 2 × 3 |
| 07 Curtain Reveal | Full-bleed image | NanoBanana 2 |
| 08 Split Screen | Two contrasting images | NanoBanana 2 × 2 |
| 11 Accordion Slider | 4 tall crops (portrait aspect) | NanoBanana 2 × 4 |
| 12 Cursor Image Reveal / Before-After | Two aligned images, same framing | NanoBanana 2 × 2 |
| 13 Hover Image Trail | 5 small thumbnails | NanoBanana 2 × 5 |
| 16 Spotlight Cards | Product/feature images | NanoBanana 2 |
| 21 3D Coverflow Carousel | 5 card/product images | NanoBanana 2 × 5 |
| 25 Marquee | Brand logos or thumbnails | NanoBanana 2 |
| 31 Scroll Scrub | Hero video (for frame extraction) | Seedance 2.0 / Kling 3.0 |

---

## FULL PIPELINE MAP

```
╔══════════════════╗                              ╔══════════════════════════╗
║  UI/UX DESIGNER  ║ ───────────────────────────► ║  CINEMATIC WEBSITE       ║
║                  ║   Standard path (default)     ║  BUILDER                ║
╚══════════════════╝                              ╚══════════════════════════╝
        │                                                    │
        │ build_path: premium only              ╔══════════════════════╗
        ▼                                        ║  ASSET AUTOMATION    ║
╔══════════════════╗                             ║  + Higgsfield MCP    ║ ──┐
║  GOOGLE STITCH   ║ ────────────────────────────┘  ╚══════════════════════╝  │
╚══════════════════╝                                                          ▼
                                                                ╔══════════════════════════╗
                                                                ║  PLAYWRIGHT QA           ║
                                                                ║  • 3-device matrix       ║
                                                                ║  • Console/network check ║
                                                                ║  • Interaction testing   ║
                                                                ║  • QA report generated   ║
                                                                ╚══════════════════════════╝
                                                                              │
                                                                              ▼
                                                                    CLIENT DELIVERY ✅
```

**Skill load order, Standard path (default — scraped lead-gen volume):**
1. `ui-ux-designer` → design direction (`build_path: standard`)
2. Asset generation (Higgsfield MCP directly — `asset-automation` not built yet)
3. `cinematic-website-builder` → HTML production ← THIS SKILL
4. QA: Playwright device matrix + `motion-verification` jank test

**Skill load order, Premium path (named client, or explicitly requested layout review):**
1. `ui-ux-designer` → design direction (`build_path: premium`)
2. `google-stitch` → layout confirmed (human-reviewed)
3. Asset generation (Higgsfield MCP directly — `asset-automation` not built yet)
4. `cinematic-website-builder` → HTML production ← THIS SKILL
5. QA: Playwright device matrix + `motion-verification` jank test
