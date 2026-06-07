---
name: gsap-reference
description: >
  Complete GSAP animation reference for any web build. Covers full Tween API, Timeline,
  ScrollTrigger (full API), ScrollSmoother, CSS transforms, React/Next.js integration
  (useGSAP hook, contextSafe, SSR), eases, plugins, utility methods, and universal
  ready-to-drop patterns for horizontal scroll pins, staggered entrances, parallax,
  kinetic typography, counters, hover scales, page transitions, and Next.js cleanup.
  Apply to any site type — consumer app, HVAC, portfolio, SaaS, landing page.
  Trigger on: "gsap", "scrolltrigger", "scrollsmoother", "animation", "scroll pin",
  "stagger", "parallax", "kinetic type", "horizontal scroll", "tween", "timeline",
  "counter animate", "page transition", "greensock", "useGSAP", "react gsap",
  "next.js animation", "css transforms", "autoAlpha", "clearProps".
source:
  - https://github.com/greensock/GSAP.git
  - https://github.com/greensock/gsap-skills.git
  - https://gsap.com/docs/v3/GSAP/Tween
  - https://gsap.com/docs/v3/Plugins/ScrollTrigger
  - https://gsap.com/docs/v3/Plugins/ScrollSmoother
  - https://gsap.com/docs/v3/GSAP/CorePlugins/CSS
  - https://gsap.com/resources/React/
author: GreenSock
version: gsap@3.x
---

# GSAP Reference — Universal Animation Implementation

Complete cheat sheet for any coding agent implementing GSAP on any site type. All patterns use generic selectors — swap in your actual class names.

---

## Space Age Integration

Required on every cinematic/animated site build. Always paired with Framer Motion (entrance animations) and Lenis (smooth scroll). GSAP owns:
- Scroll-pinned horizontal sections (How It Works, Steps, Process)
- Counter animations (stat sections)
- Kinetic typography (hero headlines)
- Parallax layers

Framer Motion owns: component entrance animations, hover states.  
Lenis owns: global smooth scroll wrapper (`lerp: 0.1, duration: 1.2`).

---

## Installation

```bash
npm install gsap @gsap/react
```

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);
```

---

## Basics

```js
gsap.to(".selector", {
  x: 100,
  backgroundColor: "red",   // camelCase
  duration: 1,               // seconds (default 0.5)
  delay: 0.5,
  ease: "power2.inOut",
  stagger: 0.1,              // offset start times across targets
  paused: false,
  overwrite: "auto",         // false | true | "auto"
  repeat: 2,                 // -1 = infinite
  repeatDelay: 1,
  repeatRefresh: true,       // re-records values each repeat
  yoyo: true,                // A→B→B→A
  immediateRender: false,    // true by default for from()/fromTo()
  onComplete: () => {},
  // callbacks: onStart, onUpdate, onRepeat, onReverseComplete
});

gsap.from('.selector', { fromVars });
gsap.fromTo('.selector', { fromVars }, { toVars }); // special props go in toVars
gsap.set('.selector', { toVars });                  // instant, no animation
```

---

## Tween Special Properties (full)

| Property | Type | Default | Notes |
|---|---|---|---|
| `callbackScope` | Object | — | Scope for all callbacks |
| `data` | * | — | Arbitrary data on instance |
| `delay` | Number | 0 | Seconds before starting |
| `duration` | Number | 0.5 | Seconds |
| `ease` | String\|Function | `"power1.out"` | Rate of change |
| `easeReverse` | Boolean\|String | false | Ease for reverse direction (v3.15+) |
| `id` | String | — | Retrieve via `gsap.getById()` |
| `immediateRender` | Boolean | false (to), true (from/fromTo) | Force render on instantiation |
| `inherit` | Boolean | true | Inherit parent timeline defaults |
| `keyframes` | Array | — | Array of vars objects → sequential to() tweens |
| `lazy` | Boolean | true | Delay value writes to end of tick |
| `onComplete` | Function | — | Fires on completion |
| `onCompleteParams` | Array | — | Params for onComplete |
| `onRepeat` | Function | — | Fires each repeat |
| `onRepeatParams` | Array | — | Params for onRepeat |
| `onReverseComplete` | Function | — | Fires when reaching start from reverse |
| `onStart` | Function | — | Fires on start |
| `onUpdate` | Function | — | Fires every tick |
| `overwrite` | Boolean\|String | false | `true` kills all, `"auto"` kills conflicting |
| `paused` | Boolean | false | Pause on creation |
| `repeat` | Number | 0 | Extra iterations; -1 = infinite |
| `repeatDelay` | Number | 0 | Seconds between repeats |
| `repeatRefresh` | Boolean | — | Re-record start/end each repeat |
| `reversed` | Boolean | — | Start reversed |
| `runBackwards` | Boolean | — | Invert start/end (makes to() behave like from()) |
| `stagger` | Number\|Object | — | Offset start times across targets |
| `startAt` | Object | — | Set initial values before animating |
| `yoyo` | Boolean | false | Alternate direction each repeat |
| `yoyoEase` | String\|Function | — | DEPRECATED (v3.15) — use easeReverse |

---

## Tween Methods

```js
let anim = gsap.to(...);

anim.play()            .pause()             .resume()      // respects direction
    .reverse()         .restart()           .kill()
    .timeScale(2)      // 2x speed, 0.5 = half
    .seek(1.5)         // jump to time (seconds) or label
    .progress(0.5)     // jump to halfway
    .totalProgress(0.8)// includes repeats
    .invalidate()      // flush cached start/end values
    .revert()          // kill + restore pre-animation state
    .isActive()        // true if animating
    .then(cb)          // Promise
    .targets()         // Array of animated objects
    .duration()        // get/set duration
    .delay()           // get/set delay
    .repeat()          // get/set repeat count
    .yoyo()            // get/set yoyo state
    .paused()          // get/set paused
    .reversed()        // get/set reversed
    .time()            // get/set playhead position
    .totalTime()       // playhead including repeats
    .totalDuration()   // full duration including repeats
    .ratio             // read-only: eased progress (0–1)
    .vars              // original config object
    .scrollTrigger     // associated ScrollTrigger (if any)
```

---

## Timelines

```js
let tl = gsap.timeline({
  delay: 0.5,
  paused: true,
  repeat: 2,
  repeatDelay: 1,
  repeatRefresh: true,
  yoyo: true,
  defaults: { duration: 1, ease: 'none' },
  smoothChildTiming: true,
  autoRemoveChildren: true,
  onComplete: () => {},
});

tl.to('.selector', { duration: 1, x: 50 })
  .to('#id', { autoAlpha: 0 })
  .to([elem, elem2], { duration: 3, x: 100 });

// Position parameter
tl.to(target, { vars }, positionParameter);
// 0.7          absolute time
// '-=0.7'      overlap previous by 0.7s
// 'myLabel'    at label
// 'myLabel+=0.2'
// '<'          start of most recently added child
// '<0.2'       0.2s after ^^
// '-=50%'      overlap half of inserting anim duration
// '<25%'       25% into previous anim
```

### Timeline-specific methods

```js
tl.add(thing, position)         // label, tween, timeline, or callback
  .call(func, params, position) // call function at given point
  .getChildren()                // Array of children
  .clear()                      // empty the timeline
  .tweenTo(timeOrLabel, {vars})
  .tweenFromTo(from, to, {vars})
```

### Nesting

```js
const master = gsap.timeline()
  .add(scene1())             // scene1() returns a timeline
  .add(scene2(), "-=0.5");   // overlap by 0.5s
```

---

## Eases

```js
// none / linear
ease: 'none'

// core (each has .in .out .inOut)
'power1' 'power2' 'power3' 'power4' 'circ' 'expo' 'sine'
// e.g. "power2.inOut"

// expressive core
'elastic' 'back' 'bounce' 'steps(n)'

// EasePack (not core)
'rough' 'slow' 'expoScale(1, 2)'

// custom
CustomEase.create("myEase", "M0,0 C0.14,0 0.242,0.438 0.272,0.561...")
```

---

## CSS Plugin — Transforms & Special Props

### Transform aliases (prefer these over CSS strings)

```js
// 2D
x: 100          // translateX(100px)
y: 100          // translateY(100px)
xPercent: 50    // translateX(50%)
yPercent: 50    // translateY(50%)
scale: 2        // scale(2)
scaleX: 2
scaleY: 2
rotation: 90    // rotate(90deg) — or "1.25rad"
skew: 30        // skew(30deg)
skewX: 30
skewY: 30
transformOrigin: "center 40%"

// 3D
z: 100
rotationX: 45
rotationY: 45
rotationZ: 45   // same as rotation
perspective: 500         // on parent
transformPerspective: 500 // on individual element
```

**Transform order:** translate → scale → rotationX → rotationY → skew → rotation(Z). Always consistent.

### Directional rotation

```js
rotation: "-170_short"   // shortest path
rotation: "+=90_cw"      // clockwise relative
rotation: "-=30_ccw"     // counter-clockwise relative
```

### Special properties

```js
autoAlpha: 0     // opacity + visibility (sets visibility:hidden at 0 for perf)
clearProps: "scale,left"  // remove inline styles on complete
clearProps: "all"
autoRound: false  // disable default pixel rounding (default: true)
force3D: true     // force translate3d (default: "auto")

// SVG
svgOrigin: "250 100"   // transformOrigin in SVG global coords
smoothOrigin: true     // prevent jump when changing SVG transformOrigin
```

### camelCase all CSS properties
```js
fontSize: "2rem"       // font-size
backgroundColor: "red" // background-color
borderRadius: "50%"
boxShadow: "0px 0px 20px 20px red"
```

Non-animatable properties (e.g. `position: "absolute"`) apply at tween start.  
Exception: `display: "none"` applies at tween **end**.

---

## ScrollTrigger

### Config object (full)

```js
scrollTrigger: {
  trigger: ".selector",         // element whose position determines start
  start: "top bottom",          // default — [trigger edge] [scroller edge]
  end: "bottom top",            // default — also accepts px number, "+=500", function
  scrub: true,                  // true = direct link; number = seconds to catch up
  pin: true,                    // pin trigger; or selector/element
  markers: true,                // dev only

  // toggleActions: onEnter onLeave onEnterBack onLeaveBack
  // values: play pause resume reset reverse complete none
  toggleActions: "play none none none",

  toggleClass: "active",        // or { targets: ".el", className: "active" }
  anticipatePin: 1,
  fastScrollEnd: true,          // or velocity number
  containerAnimation: tween,    // for elements inside horizontal scroll container
  id: "my-id",

  snap: {
    snapTo: 1 / 10,             // or "labels" or Array or Function
    duration: { min: 0.2, max: 3 },
    delay: 0.1,
    directional: true,
    ease: "power3",
    inertia: true,
    onStart: cb, onInterrupt: cb, onComplete: cb,
  },

  pinReparent: true,
  pinSpacing: true,
  pinType: "transform",         // or "fixed"
  pinnedContainer: ".parent",
  scroller: window,
  horizontal: true,
  endTrigger: ".other",
  once: true,
  preventOverlaps: true,
  refreshPriority: 0,
  invalidateOnRefresh: true,

  // all callbacks receive ScrollTrigger instance
  onEnter: (self) => {},
  onLeave: (self) => {},
  onEnterBack: (self) => {},
  onLeaveBack: (self) => {},
  onUpdate: (self) => {},       // self.progress, self.direction, self.getVelocity()
  onToggle: (self) => {},
  onRefresh: (self) => {},
  onScrubComplete: (self) => {},
  onSnapComplete: (self) => {},
}
```

### Instance properties

```js
st.animation    // Tween or Timeline
st.direction    // 1 = forward, -1 = backward
st.end          // end scroll position in px
st.isActive     // between start and end?
st.pin          // pinned element
st.progress     // 0–1
st.scroller     // scroller element or window
st.start        // start scroll position in px
st.trigger      // trigger element
st.vars         // original config
```

### Instance methods

```js
st.disable(revert, allowAnimation)
st.enable(reset)
st.getTween(snap)        // scrub tween; true = snap tween
st.getVelocity()         // px/sec
st.kill(revert, allowAnimation)
st.labelToScroll("label")
st.next() / st.previous()
st.refresh()
st.scroll()              // get position
st.scroll(300)           // set position
```

### Static methods

```js
ScrollTrigger.addEventListener("scrollStart", cb)  // scrollStart scrollEnd refresh refreshInit revert matchMedia
ScrollTrigger.removeEventListener("scrollStart", cb)

ScrollTrigger.batch(".card", {
  onEnter: (els) => gsap.to(els, { opacity: 1, stagger: 0.1 }),
  onLeave: (els) => gsap.set(els, { opacity: 0 }),
  start: "top 85%",
  batchMax: 5,
});

ScrollTrigger.config({
  limitCallbacks: true,
  syncInterval: 40,
  ignoreMobileResize: true,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
});

ScrollTrigger.create({ /* vars */ })        // standalone, no animation
ScrollTrigger.defaults({ scroller: "#app" })
ScrollTrigger.getAll()
ScrollTrigger.getById("my-id")
ScrollTrigger.isInViewport(el, 0.5)        // true if 50%+ visible
ScrollTrigger.isScrolling()
ScrollTrigger.killAll()
ScrollTrigger.matchMedia({ "(max-width: 768px)": () => {} }) // DEPRECATED — use gsap.matchMedia()
ScrollTrigger.maxScroll(window)
ScrollTrigger.normalizeScroll(true)         // JS-thread scroll, fixes mobile lag
ScrollTrigger.positionInViewport(el, "top") // 0–1
ScrollTrigger.refresh(safe)
ScrollTrigger.saveStyles(".el, .other")     // snapshot inline styles
ScrollTrigger.scrollerProxy("#scroller", { // custom scroll container
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
});
ScrollTrigger.sort()
ScrollTrigger.update()

// Static property
ScrollTrigger.isTouch  // 0 = mouse, 1 = touch only, 2 = both
```

### Lenis + ScrollTrigger integration

```js
const lenis = new Lenis({ lerp: 0.1, duration: 1.2 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

## ScrollSmoother

> GSAP's native smooth scroller. Alternative to Lenis. Club GSAP plugin.

### Required HTML structure

```html
<body>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <!-- ALL content here -->
    </div>
  </div>
</body>
```

### Setup

```js
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1,            // seconds to catch up (default 0.8)
  smoothTouch: 0.1,     // touch devices (default: disabled)
  ease: "expo",
  effects: true,        // enable data-speed / data-lag attrs
  effectsPadding: 0,
  normalizeScroll: true,
  ignoreMobileResize: true,
  onUpdate: (self) => {},
  onStop: (self) => {},
});
```

### Parallax via data attributes

```html
<div data-speed="0.5">     <!-- half scroll speed -->
<div data-speed="2">       <!-- double speed -->
<div data-speed="auto">    <!-- auto calc within parent -->
<div data-speed="clamp(0.5)"> <!-- no offset at page top -->
<div data-lag="0.5">       <!-- 0.5s to catch up -->
```

### Instance methods

```js
smoother.scrollTo(".target", true, "top top")  // scroll to element
smoother.scrollTop(300)                         // instant jump
smoother.offset(".el", "top center")           // get px offset
smoother.paused(true)                           // block all scroll
smoother.smooth(2)                              // change smoothing
smoother.getVelocity()                          // px/sec
smoother.effects(".box", { speed: 0.5, lag: 0.1 }) // programmatic
smoother.kill()

ScrollSmoother.get()  // retrieve existing instance
```

> **Note:** `position: fixed` elements must be **outside** the wrapper (CSS transform breaks fixed positioning).

---

## Plugins

```js
gsap.registerPlugin(Draggable, TextPlugin); // register once before use

// Available plugins
Draggable, DrawSVGPlugin, EaselPlugin, Flip,
GSDevTools, InertiaPlugin, MorphSVGPlugin,
MotionPathPlugin, MotionPathHelper, Observer,
Physics2DPlugin, PhysicsPropsPlugin, PixiPlugin,
ScrambleTextPlugin, ScrollToPlugin, ScrollTrigger,
ScrollSmoother, SplitText, TextPlugin
```

---

## Utility Methods

```js
gsap.utils.checkPrefix()   // relevant browser prefix for property
gsap.utils.clamp(0, 100, value)
gsap.utils.distribute()    // distribute value among array
gsap.utils.getUnit("20px") // "px"
gsap.utils.interpolate(a, b, progress)
gsap.utils.mapRange(0, 100, 0, 1, value)
gsap.utils.normalize(0, 100, value) // map to 0–1
gsap.utils.pipe(fn1, fn2, fn3)
gsap.utils.random(0, 100)  // or random(array)
gsap.utils.selector(ref)   // scoped selector function
gsap.utils.shuffle(array)
gsap.utils.snap(5, value)  // snap to nearest 5
gsap.utils.splitColor("rgb(255,0,0)")
gsap.utils.toArray(".selector")
gsap.utils.unitize(fn, "px")
gsap.utils.wrap(0, 10, value)    // wrap within range
gsap.utils.wrapYoyo(0, 10, value)
```

---

## Misc

```js
gsap.getProperty("#id", "x");        // 20
gsap.getProperty("#id", "x", "px");  // "20px"

gsap.defaults({ ease: "power2.in", duration: 1 });

gsap.config({
  autoSleep: 60,
  force3D: false,
  nullTargetWarn: false,
  trialWarn: false,
  units: { left: "%", top: "%", rotation: "rad" }
});

// Register reusable effect
gsap.registerEffect({
  name: "fade",
  effect: (targets, config) =>
    gsap.to(targets, { duration: config.duration, opacity: 0 }),
  defaults: { duration: 2 },
  extendTimeline: true,
});
gsap.effects.fade(".box");
tl.fade(".box", { duration: 3 });

// Ticker
gsap.ticker.add((time, deltaTime, frame) => {});
gsap.ticker.remove(myFunction);
gsap.ticker.lagSmoothing(0); // disable lag smoothing (required with Lenis)

// quickSetter — repeated property sets (mousemove etc)
let setX = gsap.quickSetter("#id", "x", "px");
document.addEventListener("mousemove", e => setX(e.clientX));

// quickTo — repeated animations
let xTo = gsap.quickTo("#id", "x", { duration: 0.4, ease: "power3" });
document.addEventListener("mousemove", e => xTo(e.pageX));

// matchMedia (responsive animations)
let mm = gsap.matchMedia();
mm.add("(min-width: 768px)", () => {
  gsap.to(".el", { x: 100 });
  return () => {}; // optional cleanup
});
```

---

## React & Next.js Integration

### Setup

```bash
npm install @gsap/react
```

```js
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
```

### useGSAP hook

Drops directly into components. Auto-cleans up on unmount using `gsap.context()`. Safe for React 18 strict mode (handles double-invoke).

```js
// 'use client' required in Next.js App Router
'use client';

const container = useRef();

useGSAP(() => {
  gsap.to('.box', { x: 360 });
}, { scope: container }); // scope limits selectors to container children
```

### Config options

```js
useGSAP(() => { /* ... */ }, {
  dependencies: [value],      // re-run when value changes (like useEffect deps)
  scope: containerRef,        // constrain selector text to this element
  revertOnUpdate: true,       // revert + re-run on dep change (default: false)
});

// Shorthand — just pass dep array
useGSAP(() => { /* ... */ }, [endX]);
```

### Interaction-triggered animations (contextSafe)

Animations created outside the hook (click handlers, setTimeout) need `contextSafe` to be properly cleaned up.

```js
// Option 1: destructure from hook
const { contextSafe } = useGSAP({ scope: container });

const onClick = contextSafe(() => {
  gsap.to('.box', { rotation: 180 });
});

// Option 2: inside hook callback
useGSAP((context, contextSafe) => {
  const onClick = contextSafe(() => {
    gsap.to(ref.current, { rotation: 180 });
  });
  ref.current.addEventListener('click', onClick);
  return () => ref.current.removeEventListener('click', onClick);
}, { scope: container });
```

### ScrollTrigger with React

```js
useGSAP(() => {
  gsap.to('.box', {
    x: 300,
    scrollTrigger: {
      trigger: '.box',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
    }
  });
}, { scope: container });
```

### Without useGSAP (manual context)

```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap code here
  }, containerRef);
  return () => ctx.revert();
}, []);
```

### SSR / Next.js App Router

```js
'use client'; // at top of any file using GSAP
```

`useGSAP` uses `useIsomorphicLayoutEffect` — prefers `useLayoutEffect` in browser, falls back to `useEffect` on server. No additional config needed.

---

## Common Patterns

All selectors are generic. Replace with your actual class names.

### Horizontal Scroll Pin

```js
const items = gsap.utils.toArray(".scroll-item");
const track = document.querySelector(".scroll-track");

gsap.to(items, {
  xPercent: -100 * (items.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-section",
    pin: true,
    scrub: 1,
    start: "top top",
    end: () => "+=" + track.offsetWidth,
    invalidateOnRefresh: true,
  }
});
```

### Staggered Fade Up

```js
gsap.from(".card", {
  opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: "power2.out",
  scrollTrigger: { trigger: ".section-container", start: "top 75%" }
});
```

### Animated Underline / Line Draw

```js
gsap.from(".accent-line", {
  width: 0, duration: 0.6, ease: "power2.out",
  scrollTrigger: { trigger: ".headline-container", start: "top 70%" }
});
```

### Parallax Image

```js
gsap.to(".parallax-img", {
  yPercent: -20, ease: "none",
  scrollTrigger: {
    trigger: ".parallax-section",
    start: "top bottom", end: "bottom top", scrub: true,
  }
});
```

### Kinetic Typography — Character Reveal

```js
gsap.registerPlugin(SplitText);
const split = new SplitText(".headline", { type: "chars,words" });

gsap.from(split.chars, {
  opacity: 0, y: 60, rotationX: -90, stagger: 0.02,
  duration: 0.6, ease: "back.out(1.7)",
  scrollTrigger: { trigger: ".headline", start: "top 80%" }
});
```

### Counter / Number Animate Up

```js
gsap.to(".stat-number", {
  innerHTML: 100, duration: 2, ease: "power2.out",
  snap: { innerHTML: 1 },
  scrollTrigger: { trigger: ".stats-section", start: "top 75%", once: true }
});
```

### Image Scale on Hover

```js
document.querySelectorAll(".hover-scale").forEach(el => {
  el.addEventListener("mouseenter", () =>
    gsap.to(el, { scale: 1.05, duration: 0.4, ease: "power2.out" }));
  el.addEventListener("mouseleave", () =>
    gsap.to(el, { scale: 1, duration: 0.4, ease: "power2.out" }));
});
```

### Page Transition (Next.js App Router)

```js
gsap.fromTo("main",
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
);
```

---

## File Map

```
skills/gsap-reference/
  SKILL.md    This file
```

Sources:
- https://gsap.com/docs/v3/GSAP/Tween
- https://gsap.com/docs/v3/Plugins/ScrollTrigger
- https://gsap.com/docs/v3/Plugins/ScrollSmoother
- https://gsap.com/docs/v3/GSAP/CorePlugins/CSS
- https://gsap.com/resources/React/
- https://github.com/greensock/GSAP.git

---

## Trigger This Skill When
- Implementing any GSAP animation on any site type
- User says: "gsap", "scrolltrigger", "scrollsmoother", "scroll pin", "horizontal scroll", "stagger", "parallax", "kinetic type", "counter animate", "greensock", "useGSAP", "react gsap", "autoAlpha", "clearProps", "css transforms"
- Building a scroll-pinned How It Works / Steps / Process section
- Animating stat counters or headline characters
- Setting up page transitions or scroll effects in Next.js App Router
- Any cinematic or animated site build in the Space Age workflow
