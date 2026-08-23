/* ============================================================================
   boot.js — dependency loading + the dev contract every lab page implements.

   Dev contract (the verification harness depends on all four):
     window.__ready  — true only after deps loaded, fonts settled, first layout
                       done and ScrollTrigger refreshed. A screenshot of a page
                       that never sets this is not proof of anything.
     window.__lab    — live handles (timelines, carousel API, split instances)
                       so tests can assert against real objects, not pixels.
     ?jump=<px>      — land pre-scrolled and settled at an exact scroll position.
     ?motion=off     — force the reduced-motion branch without OS emulation.

   Dependency strategy: local lab/vendor/ first (offline, deterministic), CDN
   second (works before `npm run setup`). Order matters — GSAP core must land
   before its plugins, so this loads sequentially rather than in parallel.
   ========================================================================== */

const CDN = 'https://cdn.jsdelivr.net/npm';

const SOURCES = {
  gsap: ['../vendor/gsap.min.js', `${CDN}/gsap@3.13.0/dist/gsap.min.js`],
  ScrollTrigger: [
    '../vendor/ScrollTrigger.min.js',
    `${CDN}/gsap@3.13.0/dist/ScrollTrigger.min.js`,
  ],
  SplitText: ['../vendor/SplitText.min.js', `${CDN}/gsap@3.13.0/dist/SplitText.min.js`],
  Observer: ['../vendor/Observer.min.js', `${CDN}/gsap@3.13.0/dist/Observer.min.js`],
  Flip: ['../vendor/Flip.min.js', `${CDN}/gsap@3.13.0/dist/Flip.min.js`],
  Draggable: ['../vendor/Draggable.min.js', `${CDN}/gsap@3.13.0/dist/Draggable.min.js`],
  InertiaPlugin: [
    '../vendor/InertiaPlugin.min.js',
    `${CDN}/gsap@3.13.0/dist/InertiaPlugin.min.js`,
  ],
  CustomEase: ['../vendor/CustomEase.min.js', `${CDN}/gsap@3.13.0/dist/CustomEase.min.js`],
  DrawSVGPlugin: [
    '../vendor/DrawSVGPlugin.min.js',
    `${CDN}/gsap@3.13.0/dist/DrawSVGPlugin.min.js`,
  ],
  MotionPathPlugin: [
    '../vendor/MotionPathPlugin.min.js',
    `${CDN}/gsap@3.13.0/dist/MotionPathPlugin.min.js`,
  ],
  EmblaCarousel: [
    '../vendor/embla-carousel.umd.js',
    `${CDN}/embla-carousel@8.6.0/embla-carousel.umd.js`,
  ],
  Lenis: ['../vendor/lenis.min.js', `${CDN}/lenis@1.3.11/dist/lenis.min.js`],
};

const params = new URLSearchParams(location.search);

export const flags = {
  jump: params.has('jump') ? Number(params.get('jump')) : null,
  motionOff:
    params.get('motion') === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches,
};

// Created up front so page code can publish handles before ready() is reached.
window.__lab = Object.assign(window.__lab || {}, { flags });

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve(src);
    el.onerror = () => reject(new Error(`failed: ${src}`));
    document.head.appendChild(el);
  });
}

async function loadOne(name) {
  const [local, cdn] = SOURCES[name];
  try {
    await loadScript(local);
  } catch {
    await loadScript(cdn);
  }
  if (!window[name]) throw new Error(`${name} did not register on window`);
  return window[name];
}

/** Load the named dependencies in order. Returns the window globals. */
export async function loadDeps(names) {
  for (const name of names) {
    if (!SOURCES[name]) throw new Error(`unknown dependency: ${name}`);
    if (!window[name]) await loadOne(name);
  }
  return names.reduce((acc, n) => ((acc[n] = window[n]), acc), {});
}

/** Fonts + two frames. Prevents measuring a layout the browser hasn't settled. */
export async function settled() {
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/**
 * A scrubbed timeline deliberately lags its trigger (that lag is the weight you
 * feel while scrolling). After a programmatic jump the playhead is therefore
 * still travelling, and anything measured now is a frame of the transition, not
 * the state. Wait until every scrubbed animation has caught up with its trigger.
 */
export async function scrubsSettled(timeout = 3000) {
  const ST = window.ScrollTrigger;
  if (!ST) return;
  const deadline = performance.now() + timeout;
  const caughtUp = () =>
    ST.getAll().every((st) => {
      if (!st.vars?.scrub || !st.animation) return true;
      return Math.abs(st.animation.progress() - st.progress) < 0.002;
    });
  while (!caughtUp() && performance.now() < deadline) {
    await new Promise((r) => requestAnimationFrame(r));
  }
}

/**
 * Finish the boot sequence: honour ?jump=, refresh ScrollTrigger against the
 * final layout, then raise __ready. Call once, at the end of each page's setup.
 */
export async function ready(handles = {}) {
  window.__lab = Object.assign(window.__lab || {}, handles, { flags });

  await settled();

  if (window.ScrollTrigger) window.ScrollTrigger.refresh();

  if (flags.jump !== null) {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, flags.jump);
    if (window.ScrollTrigger) window.ScrollTrigger.update();
    await new Promise((r) => setTimeout(r, 120));
    window.scrollTo(0, flags.jump);
    if (window.ScrollTrigger) window.ScrollTrigger.update();
    await scrubsSettled();
    await settled();
    html.style.scrollBehavior = prev;
  }

  window.__ready = true;
  document.documentElement.dataset.ready = 'true';
  dispatchEvent(new CustomEvent('lab:ready'));
}

/** Reports whether a CSS feature is live, for the support matrix in the report. */
export function support() {
  return {
    scrollTimeline: CSS.supports('animation-timeline', 'view()'),
    scrollState: CSS.supports('container-type', 'scroll-state'),
    textBoxTrim: CSS.supports('text-box-trim', 'trim-both'),
    interpolateSize: CSS.supports('interpolate-size', 'allow-keywords'),
    viewTransition: typeof document.startViewTransition === 'function',
    backdropFilter: CSS.supports('backdrop-filter', 'blur(1px)'),
    anchorPosition: CSS.supports('anchor-name', '--a'),
    registeredProperty: typeof CSS.registerProperty === 'function',
  };
}
