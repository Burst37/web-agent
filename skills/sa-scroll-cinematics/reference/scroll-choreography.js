/* ================================================================
   Manual scroll-position choreography helpers (Architecture A).
   Use when ScrollTrigger's trigger/start/end model can't express a
   multi-phase travel path. Driven from `scrollPos` (Lenis scroll value)
   on every gsap.ticker tick — cheap pure-arithmetic per element.
   ================================================================ */

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------------- Title cascade ----------------
   Each title starts parked far below its section, rushes up, then
   "docks" to a fixed left position with eased horizontal motion, then
   exits upward with the section. Three phases: 0-47% / 47-73.5% / 73.5-100%. */

export function buildTitles(titleSelector, itemSelector, sectionSelector) {
  const H = innerHeight;
  const section = document.querySelector(sectionSelector);
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  const items = [...document.querySelectorAll(itemSelector)];
  const titles = [];

  document.querySelectorAll(titleSelector).forEach((el, i) => {
    const item = items[i];
    el.style.transform = 'translate3d(0,0,0)';
    el.style.top = `${item.offsetTop - 1.85 * H}px`;
    const rect = el.getBoundingClientRect();
    const dx = -(rect.left - 0.03 * innerWidth); // dock at left: 3vw — tune per design
    titles.push({ el, S: sectionTop + item.offsetTop, dx, H });
  });

  return titles;
}

export function updateTitles(titles, scroll) {
  for (const t of titles) {
    const { el, S, dx, H } = t;
    const start = S - 2.6 * H;
    const end = S + 0.8 * H;
    let p = Math.max(0, Math.min(1, (scroll - start) / (end - start)));

    let y;
    if (p < 0.47) y = (p / 0.47) * 1.36 * H;
    else if (p < 0.735) y = 1.36 * H + ((p - 0.47) / 0.265) * 0.44 * H;
    else y = 1.8 * H + ((p - 0.735) / 0.265) * 0.5 * H;

    const x = p > 0.5 ? dx * easeInOutCubic(Math.min(1, (p - 0.5) / 0.235)) : 0;

    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}

/* ---------------- Repulsion / "parting" effect ----------------
   Items near a fixed center mark (e.g. a big "&" or logo) get pushed
   away horizontally with a gaussian falloff. `dir` is -1 for items that
   should move left, +1 for items that should move right. */

export function buildRepulsionItems(colSelector) {
  const items = [];
  document.querySelectorAll(colSelector).forEach((col) => {
    const dir = col.dataset.repelDir === 'right' ? 1 : -1;
    [...col.children].forEach((el) => {
      el.style.transform = 'translateX(0px)';
      const r = el.getBoundingClientRect();
      items.push({
        el, dir,
        baseY: r.top + window.scrollY + r.height / 2,
        baseLeft: r.left,
        baseRight: r.right,
      });
    });
  });
  return items;
}

export function updateRepulsion(items, scroll, { edgeFraction = 0.085 } = {}) {
  const vh = innerHeight;
  const R = vh * 0.11;             // pocket radius around the fixed mark
  const M = innerWidth * 0.06;     // max push distance
  const edge = innerWidth * edgeFraction; // keep clear of fixed side labels

  for (const it of items) {
    const dy = it.baseY - scroll - vh * 0.5;
    if (Math.abs(dy) > vh) { it.el.style.transform = 'translateX(0px)'; continue; }
    const g = Math.exp(-(dy * dy) / (R * R));
    let x = it.dir * M * g;
    if (it.dir < 0) x = Math.max(x, Math.min(0, edge - it.baseLeft));
    else x = Math.min(x, Math.max(0, innerWidth - edge - it.baseRight));
    it.el.style.transform = `translateX(${x.toFixed(2)}px)`;
  }
}

/* ---------------- Usage ----------------
const titles = buildTitles('.work-title', '.work-item', '.works');
const clients = buildRepulsionItems('.clients__col');

gsap.ticker.add(() => {
  updateTitles(titles, scrollPos);
  updateRepulsion(clients, scrollPos);
});

window.addEventListener('resize', () => {
  titles.length = 0;
  titles.push(...buildTitles('.work-title', '.work-item', '.works'));
  clients.length = 0;
  clients.push(...buildRepulsionItems('.clients__col'));
});
*/
