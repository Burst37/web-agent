---
name: gsap-reference
description: >
  Complete GSAP animation reference built from official docs + source zip. Covers full
  Tween API, Timeline, keyframes (3 syntaxes), staggers (full object + function form),
  ScrollTrigger (full API + 11 common mistakes), ScrollSmoother, SplitText, Flip,
  CSS transforms, React/Next.js integration (useGSAP, contextSafe, SSR), eases,
  all plugins, utility methods, installation (npm/CDN/ESM), and universal patterns.
  Apply to any site type. Trigger on: "gsap", "scrolltrigger", "scrollsmoother",
  "splittest", "flip", "animation", "scroll pin", "stagger", "parallax",
  "kinetic type", "horizontal scroll", "tween", "timeline", "keyframes",
  "counter animate", "page transition", "greensock", "useGSAP", "react gsap",
  "next.js animation", "css transforms", "autoAlpha", "clearProps".
source:
  - https://github.com/greensock/GSAP.git
  - https://gsap.com/docs/v3/GSAP/Tween
  - https://gsap.com/docs/v3/Plugins/ScrollTrigger
  - https://gsap.com/docs/v3/Plugins/ScrollSmoother
  - https://gsap.com/docs/v3/Plugins/SplitText
  - https://gsap.com/docs/v3/Plugins/Flip
  - https://gsap.com/docs/v3/GSAP/CorePlugins/CSS
  - https://gsap.com/resources/React/
  - https://gsap.com/resources/keyframes
  - https://gsap.com/resources/getting-started/Staggers
  - https://gsap.com/resources/st-mistakes
  - https://gsap.com/cheatsheet
author: GreenSock
version: gsap@3.15
---

# GSAP Reference — Universal Animation Implementation

Complete reference for any coding agent implementing GSAP on any site type. All patterns use generic selectors — swap in your actual class names.

---

## Space Age Integration

Required on every cinematic/animated site build. Always paired with Framer Motion (entrance animations) and Lenis (smooth scroll). GSAP owns:
- Scroll-pinned horizontal sections (How It Works, Steps, Process)
- Counter animations (stat sections)
- Kinetic typography (hero headlines, SplitText)
- Parallax layers
- Layout flip transitions (Flip plugin)

Framer Motion owns: component entrance animations, hover states.  
Lenis owns: global smooth scroll wrapper (`lerp: 0.1, duration: 1.2`).

---

## Installation

### npm

```bash
npm install gsap @gsap/react
```

```js
// Standard ESM (recommended)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
```

### ESM CDN (no build tool)

```html
<script type="module">
  import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.x/dist/gsap.mjs';
  import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.x/dist/ScrollTrigger.mjs';
  gsap.registerPlugin(ScrollTrigger);
</script>
```

### All exports from gsap source zip

```js
// ESM — every public plugin available from gsap package
export { gsap, TweenMax, TweenLite, TimelineMax, TimelineLite,
  Power0, Power1, Power2, Power3, Power4, Linear,
  Quad, Cubic, Quart, Quint, Strong, Elastic, Back, SteppedEase, Bounce,
  Sine, Expo, Circ, CSSPlugin, CustomEase, Draggable, CSSRulePlugin,
  EaselPlugin, EasePack, Flip, MotionPathPlugin, Observer, PixiPlugin,
  ScrollToPlugin, ScrollTrigger, TextPlugin, DrawSVGPlugin,
  Physics2DPlugin, PhysicsPropsPlugin, ScrambleTextPlugin,
  CustomBounce, CustomWiggle, GSDevTools, InertiaPlugin,
  MorphSVGPlugin, MotionPathHelper, ScrollSmoother, SplitText };
// + all gsap.utils: wrap, wrapYoyo, distribute, random, snap, normalize,
//   getUnit, clamp, splitColor, toArray, mapRange, pipe, unitize,
//   interpolate, shuffle, selector
```

> Club GSAP plugins (ScrollSmoother, SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin, MotionPathHelper, GSDevTools, InertiaPlugin, ScrambleTextPlugin, CustomBounce, CustomWiggle) require a club membership or local file from the downloaded zip.

---

## Basics

```js
gsap.to(".selector", {
  x: 100,
  backgroundColor: "red",   // camelCase CSS
  duration: 1,               // seconds (default 0.5)
  delay: 0.5,
  ease: "power2.inOut",
  stagger: 0.1,
  paused: false,
  overwrite: "auto",         // false | true | "auto"
  repeat: -1,                // -1 = infinite
  repeatDelay: 1,
  repeatRefresh: true,
  yoyo: true,
  immediateRender: false,    // true by default for from()/fromTo()
  onComplete: () => {},
});

gsap.from('.selector', { fromVars });
gsap.fromTo('.selector', { fromVars }, { toVars }); // special props in toVars
gsap.set('.selector', { toVars });                  // instant, no animation
```

---

## Tween Special Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `callbackScope` | Object | — | Scope for all callbacks |
| `data` | * | — | Arbitrary data stored on instance |
| `delay` | Number | 0 | Seconds before starting |
| `duration` | Number | 0.5 | Seconds |
| `ease` | String\|Function | `"power1.out"` | Rate of change |
| `easeReverse` | Boolean\|String | false | Ease for reverse direction (v3.15+) |
| `id` | String | — | Retrieve via `gsap.getById()` |
| `immediateRender` | Boolean | false (to), true (from/fromTo) | Force render on instantiation |
| `inherit` | Boolean | true | Inherit parent timeline defaults |
| `keyframes` | Array\|Object | — | Multi-step animation (see Keyframes section) |
| `lazy` | Boolean | true | Delay value writes to end of tick |
| `onComplete` | Function | — | Fires on completion |
| `onCompleteParams` | Array | — | |
| `onRepeat` | Function | — | Each repeat |
| `onReverseComplete` | Function | — | Reaching start from reverse |
| `onStart` | Function | — | On start |
| `onUpdate` | Function | — | Every tick |
| `overwrite` | Boolean\|String | false | `true` kills all, `"auto"` kills conflicting |
| `paused` | Boolean | false | |
| `repeat` | Number | 0 | Extra iterations; -1 = infinite |
| `repeatDelay` | Number | 0 | |
| `repeatRefresh` | Boolean | — | Re-record start/end each repeat |
| `reversed` | Boolean | — | Start reversed |
| `runBackwards` | Boolean | — | Invert start/end (to() acts like from()) |
| `stagger` | Number\|Object\|Function | — | Offset start times (see Staggers section) |
| `startAt` | Object | — | Set initial values before animating |
| `yoyo` | Boolean | false | Alternate direction each repeat |

---

## Tween Instance Methods

```js
let anim = gsap.to(...);

anim.play()          .pause()        .resume()       // respects direction
    .reverse()       .restart()      .kill()
    .revert()        // kill + restore pre-animation state
    .timeScale(2)    // 2x speed; 0.5 = half
    .seek(1.5)       // jump to time or label
    .progress(0.5)   // 0–1
    .totalProgress(0.8) // includes repeats
    .invalidate()    // flush cached start/end values
    .isActive()      // true if animating
    .then(cb)        // Promise
    .targets()       // Array of animated objects
    .duration()      // get/set
    .delay()         .repeat()       .yoyo()
    .paused()        .reversed()
    .time()          // get/set playhead
    .totalTime()     // playhead including repeats
    .totalDuration() // full duration including repeats
    .ratio           // read-only: eased progress 0–1
    .vars            // original config
    .scrollTrigger   // associated ScrollTrigger (if any)
    .data            // custom data from vars.data
    .eventCallback("onComplete", fn) // get/set callback
```

---

## Timelines

```js
let tl = gsap.timeline({
  delay: 0.5,
  paused: true,
  repeat: 2,
  repeatDelay: 1,
  yoyo: true,
  defaults: { duration: 1, ease: 'power2.out' }, // inherited by all children
  smoothChildTiming: true,
  autoRemoveChildren: true,
  onComplete: () => {},
});

tl.to('.a', { x: 100 })
  .to('.b', { y: 50 })
  .to('.c', { opacity: 0 });
```

### Position parameter

```js
tl.to(target, { vars }, positionParameter);

// Absolute
3              // exactly 3s into timeline
// Relative
'+=1'          // 1s after previous end (gap)
'-=0.5'        // overlap previous by 0.5s
'+=50%'        // gap = 50% of inserting anim duration
'-=25%'        // overlap 25% of inserting anim duration
// Labels
'myLabel'      // at label
'myLabel+=0.2' // 0.2s after label
// Relative to previous child
'<'            // align with START of previous child
'<0.2'         // 0.2s after start of previous child
'<25%'         // 25% into previous child
```

### Timeline methods

```js
tl.add(thing, position)          // label, tween, timeline, or callback
  .call(func, params, position)  // execute function at point
  .getChildren()                 // Array of children
  .clear()                       // empty timeline
  .tweenTo(timeOrLabel, {vars})
  .tweenFromTo(from, to, {vars})
  .addLabel('myLabel', position)
  .removeLabel('myLabel')
  .currentLabel()                // get nearest label
  .nextLabel()                   // get next label
  .previousLabel()               // get previous label
```

### Nesting

```js
const master = gsap.timeline()
  .add(scene1())          // returns a timeline
  .add(scene2(), "-=0.5"); // overlap 0.5s
```

---

## Keyframes

Three syntaxes. Only available in `gsap.to()`.

### Object array (v3.0)

```js
gsap.to(".el", {
  keyframes: [
    { x: 100, duration: 1, ease: 'sine.out' },
    { y: 200, duration: 1, delay: 0.5 },        // 0.5s gap
    { rotation: 360, duration: 2, delay: -0.25 } // -0.25s overlap
  ],
  ease: 'expo.inOut' // applies across entire sequence
});
```

### Percentage (v3.9)

```js
gsap.to(".el", {
  keyframes: {
    "0%":   { x: 0, y: 0 },
    "75%":  { x: 100, y: 0, ease: 'sine.out' },
    "100%": { x: 100, y: 100 },
    easeEach: 'power1.inOut' // default ease between each keyframe
  },
  duration: 2
});
```

### Array shorthand (v3.9)

```js
gsap.to(".el", {
  keyframes: {
    x: [0, 100, 50],  // distributed evenly across duration
    y: [0, 50, 100],
    easeEach: 'power2.out'
  },
  duration: 2
});
```

> `easeEach` controls easing between keyframes. Per-keyframe `ease` overrides it for that step. Tween-level `ease` applies over the whole sequence.

---

## Staggers

```js
// Simple
stagger: 0.1  // 0.1s between each element

// Object form
stagger: {
  each: 0.1,        // seconds between each (use each OR amount, not both)
  amount: 1,        // total time distributed across all elements
  from: "center",   // "start" | "end" | "center" | "edges" | "random" | index number
  grid: "auto",     // or [rows, cols] e.g. [9, 15]
  axis: "x",        // "x" | "y" — focus on one axis for grid layouts
  ease: "power2.in",// easing for stagger distribution (not animation)
  repeat: 2,        // per-element repeat
  yoyo: true,       // per-element yoyo
}

// Function form (return total delay from start)
stagger: function(index, target, list) {
  return index * 0.1;
}
```

> Placing `repeat`/`yoyo`/callbacks **inside** `stagger` makes them per-element. At the top level they apply to the entire sequence.

---

## Eases

```js
ease: 'none'          // linear

// core (each has .in .out .inOut)
'power1' 'power2' 'power3' 'power4'
'circ' 'expo' 'sine'
// e.g. "power2.inOut"

// expressive core
'elastic' 'back' 'bounce' 'steps(n)'

// EasePack (not core)
'rough' 'slow' 'expoScale(1, 2)'

// custom
CustomEase.create("myEase", "M0,0 C0.14,0 0.242,0.438 0.272,0.561...")
CustomWiggle.create("myWiggle", { wiggles: 8 })
CustomBounce.create("myBounce", { strength: 0.6, endAtStart: false })
```

---

## CSS Plugin — Transforms & Special Props

### Transform aliases (always prefer over CSS strings)

```js
// 2D
x: 100          // translateX(100px)
y: 100          // translateY(100px)
xPercent: 50    // translateX(50%)
yPercent: 50    // translateY(50%)
scale: 2        scaleX: 2    scaleY: 2
rotation: 90    // degrees; or "1.25rad"
skew: 30        skewX: 30    skewY: 30
transformOrigin: "center 40%"

// 3D
z: 100          rotationX: 45    rotationY: 45    rotationZ: 45
perspective: 500        // on parent element
transformPerspective: 500 // on individual element
```

**Transform order (always):** translate → scale → rotationX → rotationY → skew → rotationZ

### Directional rotation

```js
rotation: "-170_short"  // shortest path
rotation: "+=90_cw"     // clockwise relative
rotation: "-=30_ccw"    // counter-clockwise relative
```

### Special properties

```js
autoAlpha: 0          // opacity + visibility (hidden at 0 for perf)
clearProps: "scale,x" // remove inline styles on complete
clearProps: "all"
autoRound: false       // disable pixel rounding (default: true)
force3D: true          // force translate3d (default: "auto")

// SVG
svgOrigin: "250 100"   // transformOrigin in SVG global coords
smoothOrigin: true     // prevent jump when changing SVG transformOrigin
```

### Rules
- camelCase all CSS properties (`backgroundColor`, `fontSize`)
- Non-animatable props apply at tween **start** (e.g. `position: "absolute"`)
- Exception: `display: "none"` applies at tween **end**
- Unit conversion is automatic (e.g. `50%` → `200px`)
- Default unit: px for position, deg for rotation

---

## ScrollTrigger

### Config object

```js
scrollTrigger: {
  trigger: ".selector",
  start: "top bottom",          // default — [trigger edge] [scroller edge]
  end: "bottom top",            // also: px number, "+=500", function
  scrub: true,                  // true = direct; number = seconds to catch up
  pin: true,                    // or selector/element
  markers: true,                // dev only

  toggleActions: "play none none none", // onEnter onLeave onEnterBack onLeaveBack
  // values: play pause resume reset reverse complete none

  toggleClass: "active",        // or { targets: ".el", className: "active" }
  anticipatePin: 1,
  fastScrollEnd: true,          // or velocity threshold in px/s
  containerAnimation: tween,
  id: "my-id",

  snap: {
    snapTo: 1 / 10,             // or "labels" | "labelsDirectional" | Array | Function
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

### Instance

```js
st.animation  .direction  .end  .isActive  .pin
st.progress   .scroller   .start  .trigger  .vars

st.disable(revert, allowAnimation)
st.enable(reset)
st.getTween(snap)        // scrub tween; true = snap tween
st.getVelocity()         // px/sec
st.kill(revert, allowAnimation)
st.labelToScroll("label")
st.next()  .previous()
st.refresh()
st.scroll()              // get
st.scroll(300)           // set
```

### Static

```js
ScrollTrigger.addEventListener("scrollStart", cb)   // scrollStart scrollEnd refresh refreshInit revert matchMedia
ScrollTrigger.removeEventListener("scrollStart", cb)

ScrollTrigger.batch(".card", {
  onEnter: (els) => gsap.to(els, { opacity: 1, stagger: 0.1 }),
  start: "top 85%", batchMax: 5,
});

ScrollTrigger.config({
  limitCallbacks: true,
  syncInterval: 40,
  ignoreMobileResize: true,
});

ScrollTrigger.create({ /* vars */ })         // standalone
ScrollTrigger.defaults({ scroller: "#app" })
ScrollTrigger.getAll()
ScrollTrigger.getById("my-id")
ScrollTrigger.isInViewport(el, 0.5)
ScrollTrigger.isScrolling()
ScrollTrigger.killAll()
ScrollTrigger.maxScroll(window)
ScrollTrigger.normalizeScroll(true)
ScrollTrigger.positionInViewport(el, "top")
ScrollTrigger.refresh(safe)
ScrollTrigger.saveStyles(".el")
ScrollTrigger.scrollerProxy("#scroller", {
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
});
ScrollTrigger.sort()
ScrollTrigger.update()
ScrollTrigger.isTouch  // 0 = mouse, 1 = touch only, 2 = both
```

### Lenis + ScrollTrigger

```js
const lenis = new Lenis({ lerp: 0.1, duration: 1.2 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### 11 Common ScrollTrigger Mistakes

1. **Nesting ScrollTrigger inside a timeline** — you can't have two things controlling the same animation. Fix: keep the tween independent OR put ScrollTrigger on the parent timeline.

2. **Multiple `to()` on same element with different triggers** — starting values cache on creation; element jumps back. Fix: use `immediateRender: false`, use `fromTo()`, or put in one timeline.

3. **One trigger for multiple sections** — all elements animate at the same scroll position. Fix: loop and create individual triggers per element.

4. **Hard-coded viewport-dependent values** — break on resize. Fix: use function values `end: () => "+=" + el.offsetHeight` and set `invalidateOnRefresh: true`.

5. **Asymmetric start/reset** — animation should start at one point and reset at another. Fix: create two ScrollTriggers — one for play, one for reset.

6. **Creating triggers out of order** — pinned sections offset subsequent triggers. Fix: create in scroll order, or use `refreshPriority` to control sequence.

7. **Not refreshing after dynamic content loads** — images/content change layout. Fix: call `ScrollTrigger.refresh()` in your load callback.

8. **Scrub animation jumps on load** — start is before scroll position 0. Fix: adjust start value past 0, or use `clamp()` mode.

9. **Markers misaligned after resize** — caused by `scroll-behavior: smooth` preventing snap-to-zero on refresh. Fix: `html { scroll-behavior: auto !important; }`

10. **Scrub animation not long enough** — increasing `duration` does nothing; scrub always fills start→end. Fix: extend the `end` value further.

11. **ScrollTrigger breaking on SPA navigation** — triggers persist across route changes. Fix: kill triggers in unmount/cleanup, recreate on mount, or call `ScrollTrigger.refresh()`.

---

## ScrollSmoother

> GSAP's native smooth scroller (Club GSAP). Alternative to Lenis.

```html
<!-- Required HTML structure -->
<body>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <!-- ALL content here -->
    </div>
  </div>
</body>
```

```js
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1,              // seconds to catch up (default 0.8)
  smoothTouch: 0.1,       // touch devices (default: off)
  ease: "expo",
  effects: true,          // enable data-speed / data-lag
  normalizeScroll: true,
  ignoreMobileResize: true,
  onUpdate: (self) => {},
  onStop: (self) => {},
});

// Parallax via HTML attrs
// data-speed="0.5"     half speed
// data-speed="auto"    auto calc within parent
// data-speed="clamp(0.5)"  no offset at page top
// data-lag="0.5"       0.5s lag

smoother.scrollTo(".target", true, "top top");
smoother.scrollTop(300);       // instant
smoother.paused(true);         // block all scroll
smoother.smooth(2);            // change smoothing duration
smoother.getVelocity();
smoother.effects(".box", { speed: 0.5, lag: 0.1 });
smoother.kill();
ScrollSmoother.get();          // retrieve existing instance
```

> `position: fixed` elements must be **outside** the wrapper (transform breaks fixed).

---

## SplitText

```js
gsap.registerPlugin(SplitText);

const split = SplitText.create(".target", {
  type: "chars,words,lines",  // any combo
  tag: "div",                 // wrapper element
  charsClass: "char",         // or "char++" for char1, char2...
  wordsClass: "word",
  linesClass: "line",
  mask: "lines",              // clip wrapper: "chars" | "words" | "lines"
  autoSplit: true,            // re-split on resize/font load
  reduceWhiteSpace: true,
  deepSlice: true,            // handle nested elements across lines
  smartWrap: false,           // wrap words in no-break spans
  aria: "auto",               // "auto" | "hidden" | "none"
  ignore: ".icon",            // exclude selector from splitting
  propIndex: false,           // add --char/--word CSS vars
  wordDelimiter: " ",         // custom word boundary
  onSplit(self) {             // fires after each split (inc. autoSplit)
    return gsap.from(self.chars, { opacity: 0, stagger: 0.02 });
  },
  onRevert() {},
});

// Instance
split.chars    // Array of char elements
split.words    // Array of word elements
split.lines    // Array of line elements
split.masks    // Array of mask wrappers
split.isSplit  // Boolean
split.vars     // original config

split.split()  // re-split manually
split.revert() // restore original innerHTML
split.kill()   // destroy instance
```

```js
// Character reveal pattern (kinetic typography)
const split = SplitText.create(".headline", { type: "chars", mask: "chars" });
gsap.from(split.chars, {
  y: "100%", opacity: 0, stagger: 0.03, duration: 0.6,
  ease: "back.out(1.7)",
  scrollTrigger: { trigger: ".headline", start: "top 80%" }
});
```

---

## Flip

```js
gsap.registerPlugin(Flip);

// 1. Capture state before DOM change
const state = Flip.getState(".targets", {
  props: "backgroundColor,color", // also record these CSS props
});

// 2. Change DOM / CSS
el.classList.toggle("active");

// 3. Animate from captured state
Flip.from(state, {
  duration: 0.6,
  ease: "power1.inOut",
  absolute: true,       // position: absolute during flip
  nested: true,         // prevent offset compounding in nested targets
  scale: true,          // scaleX/Y instead of width/height
  simple: false,        // skip rotation/skew calc for perf
  fade: true,           // cross-fade when swapping different elements
  spin: true,           // or number of extra rotations
  prune: true,          // drop non-animating targets
  toggleClass: "flipping",
  zIndex: 100,
  onEnter: (els) => gsap.from(els, { opacity: 0 }),   // newly appearing elements
  onLeave: (els) => gsap.to(els, { opacity: 0 }),     // departing elements
  onComplete: () => {},
});

// Other methods
Flip.to(state, vars)          // animate TO state FROM current
Flip.fit(el, target, vars)    // resize/reposition el to match target
Flip.isFlipping(el)           // Boolean
Flip.killFlipsOf(el)
Flip.makeAbsolute(".targets") // convert to position: absolute in place
Flip.batch(func, vars)        // coordinate multiple flips (useful in React)
```

---

## Plugins

```js
// Register once at app entry point
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, ScrollSmoother);

// Full plugin list
Draggable          DrawSVGPlugin    EaselPlugin      Flip
GSDevTools         InertiaPlugin    MorphSVGPlugin   MotionPathPlugin
MotionPathHelper   Observer         Physics2DPlugin  PhysicsPropsPlugin
PixiPlugin         ScrambleTextPlugin  ScrollToPlugin  ScrollTrigger
ScrollSmoother     SplitText        TextPlugin       CSSRulePlugin
CustomEase         CustomWiggle     CustomBounce     EasePack
```

---

## Utility Methods

```js
gsap.utils.clamp(0, 100, value)
gsap.utils.mapRange(0, 100, 0, 1, value)
gsap.utils.normalize(0, 100, value)       // map to 0–1
gsap.utils.interpolate(a, b, progress)
gsap.utils.snap(5, value)                 // snap to nearest 5
gsap.utils.random(0, 100)
gsap.utils.toArray(".selector")
gsap.utils.selector(ref)                  // scoped selector function
gsap.utils.wrap(0, 10, value)             // wrap within range
gsap.utils.wrapYoyo(0, 10, value)
gsap.utils.distribute({ ... })            // distribute value among array
gsap.utils.getUnit("20px")                // "px"
gsap.utils.pipe(fn1, fn2, fn3)
gsap.utils.splitColor("rgb(255,0,0)")
gsap.utils.shuffle(array)
gsap.utils.unitize(fn, "px")
gsap.utils.checkPrefix("transform")       // browser-prefixed property name
```

---

## Misc

```js
gsap.getProperty("#id", "x");        // 20
gsap.getProperty("#id", "x", "px");  // "20px"

gsap.defaults({ ease: "power2.out", duration: 1 });

gsap.config({
  autoSleep: 60,
  force3D: false,
  nullTargetWarn: false,
  trialWarn: false,
  units: { left: "%", top: "%", rotation: "rad" }
});

// Reusable effect
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
gsap.ticker.remove(fn);
gsap.ticker.lagSmoothing(0); // required with Lenis

// Repeated updates
const setX = gsap.quickSetter("#id", "x", "px");
document.addEventListener("mousemove", e => setX(e.clientX));

const xTo = gsap.quickTo("#id", "x", { duration: 0.4, ease: "power3" });
document.addEventListener("mousemove", e => xTo(e.pageX));

// Responsive animations
const mm = gsap.matchMedia();
mm.add("(min-width: 768px)", () => {
  gsap.to(".el", { x: 100 });
  return () => {}; // cleanup
});
```

---

## React & Next.js Integration

```bash
npm install @gsap/react
```

```js
'use client'; // Next.js App Router — required

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

### useGSAP hook

```js
const container = useRef();

useGSAP(() => {
  gsap.to('.box', { x: 360 });
}, {
  scope: container,         // limit selectors to container
  dependencies: [value],    // re-run on change
  revertOnUpdate: true,     // revert + re-run on dep change
});

// Shorthand
useGSAP(() => { /* ... */ }, [endX]);
```

### Interaction-triggered animations (contextSafe)

```js
// Animations created outside the hook need contextSafe to be cleaned up
const { contextSafe } = useGSAP({ scope: container });

const onClick = contextSafe(() => {
  gsap.to('.box', { rotation: 180 });
});

// Or inside the hook
useGSAP((context, contextSafe) => {
  const onClick = contextSafe(() => gsap.to(ref.current, { x: 100 }));
  ref.current.addEventListener('click', onClick);
  return () => ref.current.removeEventListener('click', onClick);
}, { scope: container });
```

### Manual cleanup (without useGSAP)

```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap code here
  }, containerRef);
  return () => ctx.revert();
}, []);
```

> `useGSAP` uses `useIsomorphicLayoutEffect` — safe for SSR/Next.js. Handles React 18 double-invoke in strict mode.

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
    pin: true, scrub: 1,
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

### Kinetic Typography

```js
const split = SplitText.create(".headline", { type: "chars", mask: "chars" });
gsap.from(split.chars, {
  y: "100%", opacity: 0, stagger: 0.02, duration: 0.6, ease: "back.out(1.7)",
  scrollTrigger: { trigger: ".headline", start: "top 80%" }
});
```

### Parallax

```js
gsap.to(".parallax-img", {
  yPercent: -20, ease: "none",
  scrollTrigger: { trigger: ".section", start: "top bottom", end: "bottom top", scrub: true }
});
```

### Counter Animate

```js
gsap.to(".stat-number", {
  innerHTML: 100, duration: 2, ease: "power2.out", snap: { innerHTML: 1 },
  scrollTrigger: { trigger: ".stats", start: "top 75%", once: true }
});
```

### Animated Line Draw

```js
gsap.from(".accent-line", {
  width: 0, duration: 0.6, ease: "power2.out",
  scrollTrigger: { trigger: ".headline-wrap", start: "top 70%" }
});
```

### Hover Scale

```js
document.querySelectorAll(".hover-scale").forEach(el => {
  el.addEventListener("mouseenter", () => gsap.to(el, { scale: 1.05, duration: 0.4, ease: "power2.out" }));
  el.addEventListener("mouseleave", () => gsap.to(el, { scale: 1, duration: 0.4, ease: "power2.out" }));
});
```

### Page Transition (Next.js)

```js
gsap.fromTo("main",
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
);
```

### Layout Flip

```js
const state = Flip.getState(".card");
el.classList.toggle("expanded");
Flip.from(state, { duration: 0.5, ease: "power2.inOut", nested: true });
```

---

## File Map

```
skills/gsap-reference/
  SKILL.md                      This file
  fame-estate-reference.md      Real-world Lenis/scroll-trigger/parallax pattern
                                mining + build reference, sourced from a live
                                Nuxt + Lenis luxury real-estate site (no GSAP,
                                but directly portable patterns: eases, fluid
                                viewport-ratio scaling, scroll-trigger strings,
                                --speed-factor parallax convention, section anatomy)

Source zip contents (esm/):
  gsap-core.js  CSSPlugin.js  ScrollTrigger.js  ScrollSmoother.js
  SplitText.js  Flip.js  Draggable.js  Observer.js  MotionPathPlugin.js
  MorphSVGPlugin.js  DrawSVGPlugin.js  CustomEase.js  CustomWiggle.js
  CustomBounce.js  EasePack.js  GSDevTools.js  InertiaPlugin.js
  TextPlugin.js  ScrambleTextPlugin.js  PixiPlugin.js  EaselPlugin.js
  Physics2DPlugin.js  PhysicsPropsPlugin.js  CSSRulePlugin.js
  MotionPathHelper.js  index.js  all.js
```

---

## Trigger This Skill When
- Implementing any GSAP animation on any site type
- User says: "gsap", "scrolltrigger", "scrollsmoother", "splittest", "flip", "scroll pin", "horizontal scroll", "stagger", "parallax", "kinetic type", "counter animate", "greensock", "useGSAP", "react gsap", "autoAlpha", "clearProps", "keyframes", "css transforms"
- Building a scroll-pinned Steps / Process / How It Works section
- Animating stat counters, headline characters, or layout transitions
- Setting up page transitions or scroll effects in Next.js App Router
- Any cinematic or animated site build in the Space Age workflow
