---
name: sa-scroll-cinematics
display_name: "SPACE AGE — GSAP/Lenis/Three.js Scroll Cinematics"
version: "1.0"
last_updated: "2026-06"
description: >
  Reusable scroll-animation and WebGL shader patterns reverse-engineered from two
  Awwwards-tier reference builds (Lenis + GSAP ScrollTrigger + Three.js DOM-synced
  planes, and a pure Three.js spiral-gallery scrollytelling site). Provides drop-in
  boilerplate for smooth scroll, masked text reveals, scroll-velocity-driven GLSL
  shaders, scroll-position title cascades, parallax media planes, and custom cursors.
  TRIGGER on: "scroll animation", "GSAP", "ScrollTrigger", "Lenis", "smooth scroll",
  "parallax", "shader effect on scroll", "text reveal", "cinematic site",
  "make it feel like an Awwwards site", or any cinematic-website-builder build that
  needs scroll-driven motion.
pipeline_position: "Phase 3 helper — used inside cinematic-website-builder when the
  build calls for scroll-driven motion, custom shaders, or WebGL media planes"
---

# SA-SCROLL-CINEMATICS SKILL
## Space Age AI Solutions — Scroll Motion & Shader Layer
### v1.0 | June 2026

> Source material: two production builds analyzed directly from their shipped JS
> bundles (`main.js` / `app.js`, fetched via curl — not minified, fully readable).
> Saved locally at `/home/user/fable-samples/`. This skill distills the reusable
> *techniques*, not the specific content.

---

## THE TWO REFERENCE ARCHITECTURES

There are two distinct ways these sites combine WebGL with scroll. Pick based on
the brief — don't mix unless you know why.

### Architecture A — "DOM-synced planes" (Mercer & Vane / sample-4)
- Normal HTML/CSS page, scrolled normally (Lenis smooths the native scroll).
- A fixed fullscreen `<canvas id="gl">` sits behind everything (`position: fixed; z-index: 1; pointer-events: none`).
- For every `.media` div in the DOM, a Three.js `PlaneGeometry` is created and
  **positioned every frame to match that div's `getBoundingClientRect()`** — so
  it looks like a normal image, but it's actually a textured WebGL plane that can
  run a shader.
- GSAP ScrollTrigger drives normal reveal/parallax tweens on real DOM elements.
- Best for: marketing/agency sites where most content is text/layout but a few
  hero images/sections need a shader treatment (RGB-split, curtain bend, grain).

### Architecture B — "Full WebGL scrollytelling" (Lena Voss / sample-1)
- `<body>` has `overflow: hidden` — there is **no real page scroll**. Wheel/drag
  events are captured and mapped into a virtual scroll value that drives an
  entire Three.js scene (a spiral gallery in this case).
- DOM is just a thin overlay (title, nav, labels) layered on top of the canvas.
- Best for: portfolio/showcase sites where the "scroll" IS the 3D experience.

**Decision rule:** if the client needs normal scrollable content (services,
clients, footer, forms) → Architecture A. If the whole site is one immersive
canvas experience → Architecture B.

---

## CORE STACK

```html
<script src="https://unpkg.com/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
<script type="module" src="three" ...></script> <!-- via import map or bundler -->
```

```js
gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const lenis = new Lenis({ duration: 1.15 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop(); // hold scroll until the preloader finishes, then lenis.start()
```

Always gate scroll behind a preloader → `lenis.start()` + `ScrollTrigger.refresh()`
inside the intro timeline. Without `refresh()` after layout-affecting reveals,
trigger positions drift.

---

## PATTERN 1 — Masked Text Reveal (used everywhere)

Markup: wrap each line in `overflow:hidden`, inner span does the transform.

```html
<h2><span class="mask"><span class="line">Let's</span></span></h2>
```

```css
.mask { display: block; overflow: hidden; padding-bottom: 0.06em; }
.line { display: block; }
```

```js
gsap.from('.statement .line', {
  yPercent: 115,
  duration: 1.1,
  stagger: 0.09,
  ease: 'power4.out',
  scrollTrigger: { trigger: '.statement', start: 'top 75%' },
});
```

For character-level reveals (hero titles), split at runtime:

```js
const heroTitle = document.getElementById('heroTitle');
const text = heroTitle.textContent;
heroTitle.textContent = '';
for (const ch of text) {
  const wrap = document.createElement('span');
  wrap.className = 'char-wrap'; // overflow:hidden
  const inner = document.createElement('span');
  inner.className = 'char';     // the thing that animates
  inner.innerHTML = ch === ' ' ? '&nbsp;' : ch;
  wrap.appendChild(inner);
  heroTitle.appendChild(wrap);
}
gsap.set('.hero__title .char', { yPercent: 115 });
// then in the intro timeline:
// gsap.to('.hero__title .char', { yPercent: 0, duration: 1.2, stagger: 0.045, ease: 'power4.out' })
```

---

## PATTERN 2 — Scroll-Scrubbed Parallax

```js
gsap.fromTo('.services__list--left', { y: -70 }, {
  y: 70, ease: 'none',
  scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'bottom top', scrub: true },
});
```

Two columns drifting opposite directions at different ranges reads as "depth"
even with zero 3D. Cheapest high-impact effect in the toolkit.

---

## PATTERN 3 — Manual Scroll-Position Choreography (title cascade)

When ScrollTrigger's trigger/start/end model isn't expressive enough (e.g. an
element needs to travel through 3 distinct phases with different easing per
phase), drive it manually from `lenis`'s scroll value instead:

```js
const easeInOutCubic = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2);

function updateTitles(scroll) {
  for (const t of titles) {
    const { el, S, dx, H } = t;            // S = section's doc-top, dx = dock x offset
    const start = S - 2.6 * H;
    const end   = S + 0.8 * H;
    let p = Math.max(0, Math.min(1, (scroll - start) / (end - start)));

    // phase 1 (0-47%): fast drop-in, phase 2: slow approach, phase 3: exit
    let y;
    if (p < 0.47)       y = (p / 0.47) * 1.36 * H;
    else if (p < 0.735) y = 1.36*H + ((p-0.47)/0.265) * 0.44*H;
    else                y = 1.8*H  + ((p-0.735)/0.265) * 0.5*H;

    // dock horizontally only in the second half, eased
    const x = p > 0.5 ? dx * easeInOutCubic(Math.min(1, (p-0.5)/0.235)) : 0;

    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}
// call updateTitles(scrollPos) every gsap.ticker tick, recompute `titles` (S, dx) on resize.
```

Precompute the per-element constants (`S`, `dx`) once on load/resize via
`getBoundingClientRect()`, then the per-frame update is pure arithmetic — cheap
enough to run on every tick alongside Three.js rendering.

---

## PATTERN 4 — "Repulsion" Effects (clients list parting around a fixed mark)

A fixed-position element (e.g. a big "&") and a scrolling list of items: items
near the fixed element's vertical position get pushed horizontally, gaussian
falloff so the effect fades smoothly.

```js
function updateClients(scroll) {
  const vh = innerHeight;
  const R = vh * 0.11;             // pocket radius
  const M = innerWidth * 0.06;     // max push
  for (const it of clientItems) {
    const dy = it.baseY - scroll - vh * 0.5;
    if (Math.abs(dy) > vh) { it.el.style.transform = 'translateX(0px)'; continue; }
    const g = Math.exp(-(dy * dy) / (R * R));
    const x = it.dir * M * g;       // dir = -1 (left col) or +1 (right col)
    it.el.style.transform = `translateX(${x.toFixed(2)}px)`;
  }
}
```

Generalizable to any "elements avoid a fixed UI element while scrolling" need.

---

## PATTERN 5 — Velocity-Reactive Shaders (Architecture A)

Feed Lenis's scroll velocity into shader uniforms for motion-blur / RGB-split /
curtain-bend effects that only activate while scrolling fast.

```glsl
// vertex — curtain bend
uniform float uVelocity;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.y += sin(uv.x * 3.14159265) * uVelocity * 0.35;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

```glsl
// fragment — RGB channel split by velocity, + cover-fit UV + subtle zoom/parallax
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uPlaneSize;
uniform vec2 uTextureSize;
uniform float uVelocity;
uniform float uParallax;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 plane, vec2 tex) {
  vec2 s = plane / tex;
  float scale = max(s.x, s.y);
  vec2 scaled = tex * scale;
  vec2 offset = (scaled - plane) * 0.5 / scaled;
  return uv * (plane / scaled) + offset;
}

void main() {
  vec2 uv = coverUv(vUv, uPlaneSize, uTextureSize);
  uv = (uv - 0.5) / 1.18 + 0.5;       // zoom in slightly, leaves room to pan
  uv.y += uParallax * 0.07;
  float shift = clamp(uVelocity, -40.0, 40.0) * 0.00035;
  float r = texture2D(uTexture, uv + vec2(0.0, shift)).r;
  vec4  c = texture2D(uTexture, uv).rgba;
  float b = texture2D(uTexture, uv - vec2(0.0, shift)).b;
  gl_FragColor = vec4(r, c.g, b, 1.0);
}
```

Wire-up per frame:
```js
gsap.ticker.add(() => {
  velTarget *= 0.95;                              // decay
  velCurrent += (velTarget - velCurrent) * 0.12;  // smooth
  plane.mat.uniforms.uVelocity.value = velCurrent;
});
lenis.on('scroll', (e) => {
  velTarget = Math.max(-60, Math.min(60, e.velocity));
});
```

For a duotone/motion-blur hover variant (Architecture B style), see
`reference/three-spiral-gallery.js` — multi-sample blur along travel direction,
duotone↔full-color mix driven by a hover uniform, SDF rounded corners in-shader.

---

## PATTERN 6 — DOM-Synced WebGL Planes (Architecture A core)

```js
class Plane {
  constructor(el, texture, scene) {
    this.el = el;
    this.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { /* ... */ } });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 32), this.mat);
    scene.add(this.mesh);
    this.measure();
  }
  measure() {
    const r = this.el.getBoundingClientRect();
    this.docTop = r.top + window.scrollY;
    this.left = r.left; this.w = r.width; this.h = r.height;
    this.mesh.scale.set(this.w, this.h, 1);
    this.mat.uniforms.uPlaneSize.value.set(this.w, this.h);
  }
  update(scroll, vel, vw, vh) {
    const y = this.docTop - scroll;
    if (y + this.h < -80 || y > vh + 80) { this.mesh.visible = false; return; } // cull offscreen
    this.mesh.visible = true;
    this.mesh.position.x = -vw/2 + this.left + this.w/2;
    this.mesh.position.y =  vh/2 - y - this.h/2;
    this.mat.uniforms.uVelocity.value = vel;
    this.mat.uniforms.uParallax.value = (y + this.h/2 - vh/2) / vh;
  }
}
```

Camera setup that maps Three.js units 1:1 to CSS pixels (so plane sizes = element
sizes, no scaling math elsewhere):

```js
const CAMZ = 600;
const fov = () => (2 * Math.atan(innerHeight/2 / CAMZ) * 180) / Math.PI;
const camera = new THREE.PerspectiveCamera(fov(), innerWidth/innerHeight, 100, 2000);
camera.position.z = CAMZ;
```

Re-run `measure()` for all planes on resize, recall `fov()`.

---

## PATTERN 7 — Preloader + Intro Gate

Always: (1) load assets, animating a counter toward real progress with easing
(never snap), (2) on 100%, play a GSAP intro timeline that wipes the loader away
and staggers in hero content, (3) only then `lenis.start()` + `started = true`.

```js
function bumpProgress(done, total) {
  gsap.to(progress, { shown: (done/total)*100, duration: 0.6, ease: 'power2.out', overwrite: true,
    onUpdate: () => { counterEl.textContent = String(Math.round(progress.shown)).padStart(3,'0'); } });
}

function intro() {
  const tl = gsap.timeline();
  tl.to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 0.45)
    .add(() => { lenis.start(); ScrollTrigger.refresh(); }, 0.9)
    .from('.work-title .line', { yPercent: 115, duration: 1.2, stagger: 0.09, ease: 'power4.out' }, 0.85)
    .from('.site-nav a, .side-label', { opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power2.out' }, 1.1)
    .set('.loader', { display: 'none' });
}
```

Safety valve: `setTimeout(() => { realProgress = 1; }, 8000)` so a stalled
network never strands the user on the loader.

---

## PATTERN 8 — Custom Cursor

```js
const dotX = gsap.quickTo(cursorEl, 'x', { duration: 0.12, ease: 'power3' });
const dotY = gsap.quickTo(cursorEl, 'y', { duration: 0.12, ease: 'power3' });
const ringX = gsap.quickTo(cursorRing, 'x', { duration: 0.45, ease: 'power3' });
const ringY = gsap.quickTo(cursorRing, 'y', { duration: 0.45, ease: 'power3' });

addEventListener('mousemove', (e) => { dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY); });

document.querySelectorAll('[data-cursor]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
});
```

`gsap.quickTo` is the key — far cheaper than `gsap.to` for per-frame mousemove,
and the two different durations (dot snappy, ring lagging) give the
follower-ring feel for free.

---

## EASING CONVENTIONS (consistent across both references)

- Reveals / intros: `power4.out` or `expo.out`
- UI state changes (menu open/close, view toggles): `expo.inOut`
- Small hover/label transitions: `power2.out` / `power3.out`
- Scrubbed parallax: `ease: 'none'` (linear — scrub already provides the easing via scroll)
- **Never** use default ease for anything visible; always specify.

---

## REFERENCE FILES

Full extracted source (readable, unminified) saved at:
- `/home/user/fable-samples/sample-1/main.js` — Architecture B, spiral gallery, custom cursor, raycasting hover, view-toggle morph (spiral↔list via `gsap.to(layoutState, {progress: ...})` lerped in the render loop)
- `/home/user/fable-samples/sample-4/app.js` — Architecture A, Lenis+ScrollTrigger, DOM-synced planes, title cascade, client repulsion

Generalized/annotated snippets in this skill:
- `reference/lenis-scrolltrigger-boilerplate.js` — drop-in setup for Architecture A
- `reference/three-dom-synced-planes.js` — Plane class + world + resize handling
- `reference/three-spiral-gallery.js` — Architecture B spiral/list layout math + shader
- `reference/scroll-choreography.js` — title cascade + repulsion helpers
- `reference/text-reveal.css` — mask/line CSS used by every reveal

---

## WHEN BUILDING A NEW SITE WITH THIS SKILL

1. Decide Architecture A vs B (see decision rule above).
2. Copy `lenis-scrolltrigger-boilerplate.js` (A) or the spiral gallery scaffold (B).
3. Mark up sections with `.mask > .line` for any text that should reveal on scroll/intro.
4. Identify 1-3 hero media elements to promote to WebGL planes with a shader —
   don't shader everything, it's a accent not a default.
5. Build the preloader + intro timeline last, once all sections exist, so stagger
   timings can be tuned against real content height.
6. Run `ScrollTrigger.refresh()` after any intro reveal that changes layout height.
