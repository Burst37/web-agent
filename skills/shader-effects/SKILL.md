---
name: shader-effects
display_name: SPACE AGE — Shader Effects
version: 0.1.0
last_updated: 2026-07-30
description: >
  Canonical implementation source for every shader/atmospheric background effect
  named by ui-ux-designer. Maps each named effect to exactly one approved
  implementation at a defined cost tier, with working code. This skill owns
  shader IMPLEMENTATION only — it never picks the aesthetic. Trigger on:
  "aurora background", "liquid distortion", "glow field", "mesh gradient",
  "shader", "atmospheric background", or when a build's style system names a
  shader effect.
---

# SHADER EFFECTS
## Space Age AI Solutions — Canonical Shader Implementation Layer

`ui-ux-designer` names *which* shader effect a build gets. This skill defines
*exactly how* that effect is implemented, so the same named effect produces the
same result on every build instead of a fresh improvisation each run.

Same role `gsap-supercharged` plays for GSAP: single canonical source, no
duplicate implementations anywhere else.

---

## HARD CONSTRAINT — WHAT THESE BUILDS ACTUALLY ARE

`cinematic-website-builder` ships **single-file HTML, no build step, no external
dependencies beyond CDNs**, and it must pass the Stage 4 QA gate item *"loads
fast (no oversized assets)"*. That constraint drives the entire tier system
below. A 600KB 3D library for a background gradient fails the gate.

**Default to the cheapest tier that achieves the effect.** Tier escalation is a
decision with a cost, not a default.

---

## TIER SYSTEM

| Tier | Implementation | Cost | Approval |
| :---- | :---- | :---- | :---- |
| **1** | CSS only — layered gradients, blurred pseudo-elements, pointer-driven custom properties | ~0KB, no JS | Default. Always allowed. |
| **2** | One raw WebGL fragment shader, inline, no library | ~2KB inline | Allowed for hero / one section per page. |
| **3** | Three.js via CDN | ~600KB | **Explicit approval required. NEVER on the Standard mass-production path.** |

---

## EFFECT → TIER MAP (the decision table)

Every effect named in `ui-ux-designer`'s SHADER EFFECTS list resolves here.
No effect gets an implementation that isn't in this table.

| Named effect | Tier | Implementation |
| :---- | :---- | :---- |
| Aurora background | 1 | Two blurred radial-gradient blobs, transform-animated (§1A). Escalate to Tier 2 (§2A) only when it is the hero's primary focal point. |
| Glow field | 1 | Static radial-gradient stack, no animation (§1A, blobs without keyframes) |
| Interactive gradient | 1 | Pointer → CSS custom properties (§1B) |
| Mesh gradient | 1 | 3–4 layered radial-gradients, static or slow drift (§1A) |
| Grain / noise overlay | 1 | SVG `feTurbulence` or repeating noise PNG at low opacity (§1C) |
| Hover glow (card interior) | 1 | Cursor-follow radial blob, shared rAF-throttled listener (§1D) |
| Moving border glow | 1 | `@property --border-angle` conic-gradient orbit (§1E) |
| Liquid distortion | 2 | fbm-driven UV displacement (§2B) |
| Noise distortion | 2 | Same harness, fbm field (§2A/§2B) |
| Atmospheric motion | 2 | fbm band drift (§2A) |
| Dynamic reflections | 3 | Genuine 3D geometry required — Three.js, approval-gated |

**If an effect isn't in this table, it isn't approved.** Ask, don't invent one.

---

## §1 — TIER 1: CSS IMPLEMENTATIONS

### §1A Aurora / mesh / glow field

Max **2 blurred blobs**. The blur is static (rasterized once); only `transform`
animates, so this stays GPU-composited and satisfies the motion skill's ban on
animating layout properties.

```css
.aurora { position: relative; overflow: hidden; isolation: isolate;
          background: var(--bg-base); }

.aurora::before, .aurora::after {
  content: ''; position: absolute; z-index: -1;
  width: 60vmax; height: 60vmax; border-radius: 50%;
  filter: blur(80px); opacity: 0.45;
  will-change: transform;
}
.aurora::before {
  background: radial-gradient(circle, var(--accent-1) 0%, transparent 65%);
  top: -20vmax; left: -10vmax;
  animation: auroraA 22s ease-in-out infinite alternate;
}
.aurora::after {
  background: radial-gradient(circle, var(--accent-2) 0%, transparent 65%);
  bottom: -25vmax; right: -15vmax;
  animation: auroraB 28s ease-in-out infinite alternate;
}
@keyframes auroraA {
  from { transform: translate3d(0,0,0) scale(1); }
  to   { transform: translate3d(12vmax, 8vmax, 0) scale(1.15); }
}
@keyframes auroraB {
  from { transform: translate3d(0,0,0) scale(1.1); }
  to   { transform: translate3d(-10vmax,-6vmax,0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora::before, .aurora::after { animation: none; }
}
```

- **Glow field** = the same block with the `animation` lines removed.
- **Mesh gradient** = same, 3–4 blobs max, durations ≥30s.
- Durations are deliberately 20–30s. Anything under 12s reads as a screensaver.

### §1B Interactive gradient (pointer-following)

```css
.glow-follow {
  background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%),
              rgba(255,255,255,0.06), transparent 40%);
}
```

```js
// rAF-throttled. Writes a custom property directly — never component state.
let px = 0, py = 0, queued = false;
el.addEventListener('pointermove', (e) => {
  const r = el.getBoundingClientRect();
  px = ((e.clientX - r.left) / r.width) * 100;
  py = ((e.clientY - r.top) / r.height) * 100;
  if (!queued) { queued = true; requestAnimationFrame(() => {
    el.style.setProperty('--mx', px + '%');
    el.style.setProperty('--my', py + '%');
    queued = false;
  }); }
}, { passive: true });
```

Pointer only — never bind this to touch. On touch devices it does nothing, which
is correct (matches the QA gate's "no cursor-dependent effects on mobile").

### §1C Grain overlay

```css
.grain::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  opacity: 0.035; z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Opacity ceiling **0.05**. Never animate grain — animated grain is an instant
AI-slop flag and destroys video compression on any screen recording.

### §1D Hover glow (cursor-follow blob, card interior)

For bento cells and feature cards. Pointer-only — never touch.

```css
.card { position: relative; overflow: hidden; isolation: isolate; }
.card .hover-glow {
  position: absolute; width: 250px; height: 80%;
  left: calc(50% - 125px); top: 10%;
  border-radius: 50%; filter: blur(40px); z-index: -1;
  background: radial-gradient(circle, var(--accent-1) 0%, transparent 70%);
  opacity: 0; transition: opacity 300ms ease;
  will-change: transform;
}
.card:hover .hover-glow { opacity: 0.5; }
```

```js
// One shared rAF-throttled listener for ALL cards — never one listener per card,
// and never getBoundingClientRect() inside the mousemove handler (layout thrash).
// Cache each card's rect once on enter/resize, not on every pointer event.
const cards = document.querySelectorAll('.card');
const rects = new WeakMap();
const glows = new WeakMap();
cards.forEach((card) => {
  const glow = card.querySelector('.hover-glow');
  glows.set(card, glow);
  card.addEventListener('pointerenter', () => rects.set(card, card.getBoundingClientRect()));
});
let queued = false, lastEvent = null;
document.addEventListener('pointermove', (e) => {
  lastEvent = e;
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    cards.forEach((card) => {
      const r = rects.get(card);
      if (!r || lastEvent.clientX < r.left || lastEvent.clientX > r.right ||
          lastEvent.clientY < r.top || lastEvent.clientY > r.bottom) return;
      const glow = glows.get(card);
      glow.style.transform = `translate(${lastEvent.clientX - r.left - 125}px, ${lastEvent.clientY - r.top - r.height / 2}px)`;
    });
  });
}, { passive: true });
```

### §1E Moving border glow (conic-gradient orbit)

```css
@property --border-angle {
  syntax: '<angle>'; inherits: false; initial-value: 0deg;
}
.card {
  --border-speed: 3s;
  position: relative; overflow: hidden;
}
.card::before {
  content: ''; position: absolute; inset: 0; padding: 2px;
  border-radius: inherit; pointer-events: none; z-index: 5;
  opacity: 0.75; transition: opacity 250ms ease;
  background: conic-gradient(from var(--border-angle),
    transparent 0deg, transparent 275deg,
    color-mix(in srgb, var(--accent-1) 40%, transparent) 300deg,
    var(--accent-1) 325deg,
    color-mix(in srgb, var(--accent-1) 70%, white) 340deg,
    transparent 360deg);
  animation: border-orbit var(--border-speed) linear infinite;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.card:hover::before { opacity: 1; }
@keyframes border-orbit { to { --border-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) {
  .card::before { animation: none; opacity: 0.4; }
}
```

- `--border-angle` animating via `@property` is GPU-composited — no JS timer.
- Swap `var(--accent-1)` for the build's real accent token; never hardcode a color here.
- Reserve for 1–2 hero elements per page — every card with an orbiting border
  reads as busy, not premium.

---

## §2 — TIER 2: RAW WEBGL FRAGMENT SHADER

One canvas, one fullscreen triangle, one fragment shader, no library.

### §2-HARNESS (mandatory — use verbatim)

```css
.fx-canvas { position: absolute; inset: 0; width: 100%; height: 100%;
             display: block; z-index: -1; }
```

```html
<canvas class="fx-canvas" id="fx" aria-hidden="true"></canvas>
<script>
(() => {
  const canvas = document.getElementById('fx');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bail = () => { canvas.style.background = 'var(--shader-fallback)'; };

  // Mobile and reduced-motion never run a shader — they get a static gradient.
  if (reduce || innerWidth < 768) return bail();

  const gl = canvas.getContext('webgl', {
    antialias: false, alpha: false, powerPreference: 'low-power'
  });
  if (!gl) return bail();

  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
  const FRAG = /* one body from §2A / §2B */ ``;

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s)); return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return bail();

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  // Single oversized triangle covers clip space — cheaper than a quad.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  const DPR_CAP = 1.5;                     // never render at full retina DPR
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }
  }
  addEventListener('resize', resize, { passive: true });

  let raf = null, last = 0, elapsed = 0, running = false, inView = false;
  const frame = (now) => {
    if (!last) last = now;
    elapsed += (now - last) / 1000; last = now;   // accumulator: pausing never jumps
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop  = () => { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } };

  // MANDATORY: pause offscreen and on tab hide. Non-negotiable for infinite loops.
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; inView ? start() : stop(); },
                           { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : (inView && start());
  });
})();
</script>
```

### §2-COMMON (GLSL header — prepend to every body)

```glsl
precision mediump float;
uniform vec2  u_res;
uniform float u_time;

const vec3 BG = vec3(0.020, 0.020, 0.031);  // #050508 — never pure black
const vec3 A1 = vec3(0.161, 0.475, 1.000);  // #2979FF
const vec3 A2 = vec3(0.659, 1.000, 0.243);  // #A8FF3E

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
```

Swap `A1`/`A2` for the build's actual accent colors from the Stage 2 design
system. **Do not invent accent colors here** — they come from ui-ux-designer.

### §2A Aurora field / atmospheric motion / noise distortion

```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 q  = vec2(uv.x * (u_res.x / u_res.y), uv.y);   // aspect-correct
  float t = u_time * 0.05;                            // slow. never above 0.15

  float n    = fbm(q * 2.0 + vec2(t, t * 0.6));
  float band = smoothstep(0.20, 0.85, n + uv.y * 0.30);

  vec3 col = mix(BG, A1, band * 0.55);
  col += A2 * pow(band, 4.0) * 0.30;

  // Dither — mandatory. Without it, dark gradients band visibly on #050508.
  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
```

### §2B Liquid distortion

```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time * 0.10;

  vec2 d = vec2(fbm(uv * 3.0 + t), fbm(uv * 3.0 - t + 5.2)) - 0.5;
  uv += d * 0.06;                    // strength. Above 0.08 it reads as a bug.

  float g = smoothstep(0.0, 1.0, uv.y + 0.15 * sin(uv.x * 3.0 + t));
  vec3 col = mix(BG, A1, g * 0.5);
  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
```

---

## §3 — TIER 3: THREE.JS (APPROVAL-GATED)

Only justified when the effect requires **real 3D geometry** — dynamic
reflections off a mesh, refractive glass objects, depth-sorted particles.

Conditions, all required:
- Explicit approval for this specific build
- **Never on the Standard mass-production path** — Premium/named clients only
- Lazy-loaded after LCP, never blocking first paint
- Static poster image fallback

If the effect can be faked convincingly at Tier 1 or 2, it must be.

---

## PERFORMANCE BUDGET (enforced at the QA gate)

- **One shader canvas per page. Never two.** Two canvases is an automatic fail.
- Shaders sit behind **hero or section headers only** — never behind body copy.
- Text over a shader **requires a scrim**: `linear-gradient(rgba(5,5,8,0.55), rgba(5,5,8,0.75))`.
  Contrast is measured against the scrimmed result, not the raw shader.
- DPR capped at 1.5. Never full retina.
- `<768px` → static fallback gradient, no WebGL.
- `prefers-reduced-motion` → static fallback gradient.
- Offscreen or hidden tab → **paused**, not throttled.
- Time multipliers stay ≤0.15. Fast shaders look cheap.
- Always define `--shader-fallback` alongside any Tier 2 usage.

---

## NEVER DO

- Never load Three.js for a background gradient — Tier 1 or 2 covers it
- Never run two shader canvases on one page
- Never place a shader behind body copy, or over text without a scrim
- Never animate at full device pixel ratio
- Never ship an infinite shader loop without the IntersectionObserver +
  `visibilitychange` pause pair
- Never omit the dither line — dark gradients band without it
- Never pick the aesthetic here — the effect name comes from ui-ux-designer's
  style system; this skill only implements it
- Never invent an effect that isn't in the tier map — ask instead
- Never use `window.addEventListener('scroll', ...)` to drive a shader
  (design-motion-principles bans it — use ScrollTrigger or IntersectionObserver)

---

## SKILL CONNECTIONS

- **Upstream:** ui-ux-designer (names the effect + supplies accent colors via the
  Stage 2 design system), design-motion-principles (motion principles, audit
  criteria, forbidden patterns)
- **Downstream:** cinematic-website-builder (embeds the chosen implementation
  into the single-file production HTML)
- **Canonical status:** this skill is the single source for shader
  implementations. Other skills reference it; none restate the code.
