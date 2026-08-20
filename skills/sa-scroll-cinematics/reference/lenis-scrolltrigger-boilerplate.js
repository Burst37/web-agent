/* ================================================================
   Architecture A boilerplate — Lenis smooth scroll + GSAP ScrollTrigger
   Drop this in as the top of your main entry script. Pair with
   three-dom-synced-planes.js if the build needs WebGL media planes.
   ================================================================ */

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------------- Smooth scroll ---------------- */

const lenis = new Lenis({ duration: 1.15 });

let scrollPos = window.scrollY;
let velTarget = 0;
let velCurrent = 0;

lenis.on('scroll', (e) => {
  scrollPos = e.scroll;
  velTarget = Math.max(-60, Math.min(60, e.velocity));
  ScrollTrigger.update();
});

gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop(); // re-enable from the intro timeline once the preloader finishes

/* in-page anchor links should route through lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return e.preventDefault();
    e.preventDefault();
    lenis.scrollTo(href === '#top' ? 0 : href);
  });
});

/* ---------------- Per-frame velocity smoothing ----------------
   Feed velCurrent into any shader's uVelocity uniform, or into
   CSS-driven effects via a custom property. */

gsap.ticker.add(() => {
  velTarget *= 0.95; // decay toward 0 between scroll events
  velCurrent += (velTarget - velCurrent) * 0.12;
  // world?.update(scrollPos, velCurrent);  // if using three-dom-synced-planes.js
});

/* ---------------- Hero character split (for masked title reveals) ---------------- */

export function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  for (const ch of text) {
    const wrap = document.createElement('span');
    wrap.className = 'char-wrap';
    const inner = document.createElement('span');
    inner.className = 'char';
    inner.innerHTML = ch === ' ' ? '&nbsp;' : ch;
    wrap.appendChild(inner);
    el.appendChild(wrap);
  }
  gsap.set(el.querySelectorAll('.char'), { yPercent: 115 });
}

/* ---------------- Standard scroll-triggered reveals ----------------
   Call once after all sections exist in the DOM. */

export function buildScrollAnimations() {
  // Generic: any `.mask .line` reveals on scroll into view
  document.querySelectorAll('section').forEach((section) => {
    const lines = section.querySelectorAll('.mask .line');
    if (!lines.length) return;
    gsap.from(lines, {
      yPercent: 115,
      duration: 1.1,
      stagger: 0.09,
      ease: 'power4.out',
      scrollTrigger: { trigger: section, start: 'top 75%' },
    });
  });

  // Generic: fade/slide-up groups marked with [data-reveal]
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 88%' },
    });
  });

  // Generic: opposite-direction parallax pair, e.g. two columns over a media block
  const left = document.querySelector('[data-parallax="left"]');
  const right = document.querySelector('[data-parallax="right"]');
  const parallaxHost = document.querySelector('[data-parallax-host]');
  if (left && parallaxHost) {
    gsap.fromTo(left, { y: -70 }, {
      y: 70, ease: 'none',
      scrollTrigger: { trigger: parallaxHost, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
  if (right && parallaxHost) {
    gsap.fromTo(right, { y: 90 }, {
      y: -90, ease: 'none',
      scrollTrigger: { trigger: parallaxHost, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}

/* ---------------- Preloader / intro gate ---------------- */

export function buildIntro({ counterEl, progress, onDone }) {
  const tl = gsap.timeline();
  tl.to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 0.45)
    .add(() => {
      lenis.start();
      ScrollTrigger.refresh();
      onDone?.();
    }, 0.9)
    .from('.work-title .line', { yPercent: 115, duration: 1.2, stagger: 0.09, ease: 'power4.out' }, 0.85)
    .from('.site-nav a, .side-label', { opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power2.out' }, 1.1)
    .set('.loader', { display: 'none' });
  return tl;
}

export function bumpProgress(counterEl, progress, done, total) {
  gsap.to(progress, {
    shown: (done / total) * 100,
    duration: 0.6,
    ease: 'power2.out',
    overwrite: true,
    onUpdate: () => {
      counterEl.textContent = String(Math.round(progress.shown)).padStart(3, '0');
    },
  });
}

export { lenis, scrollPos, velCurrent };
