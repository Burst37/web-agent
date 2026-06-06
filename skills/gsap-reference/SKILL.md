---
name: gsap-reference
description: >
  Complete GSAP animation reference for any web build. Covers tweens, timelines,
  ScrollTrigger, eases, plugins, utility methods, and universal ready-to-drop patterns
  for horizontal scroll pins, staggered entrances, parallax, kinetic typography, counters,
  hover scales, page transitions, and Next.js cleanup. Apply to any site type — consumer
  app, HVAC, portfolio, SaaS, landing page. Trigger on: "gsap", "scrolltrigger",
  "animation", "scroll pin", "stagger", "parallax", "kinetic type", "horizontal scroll",
  "tween", "timeline", "counter animate", "page transition", "greensock".
source:
  - https://github.com/greensock/GSAP.git
  - https://github.com/greensock/gsap-skills.git
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

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, SplitText);
```

---

## Basics

```js
// "to" tween - animate to provided values
gsap.to(".selector", { // selector text, Array, or object
  x: 100,
  backgroundColor: "red", // camelCase
  duration: 1, // seconds
  delay: 0.5,
  ease: "power2.inOut",
  stagger: 0.1, // stagger start times
  paused: true, // default is false
  overwrite: "auto", // default is false
  repeat: 2, // number of repeats (-1 for infinite)
  repeatDelay: 1, // seconds between repeats
  repeatRefresh: true, // invalidates on each repeat
  yoyo: true, // if true > A-B-B-A, if false > A-B-A-B
  yoyoEase: true, // or ease like "power2"
  immediateRender: false,
  onComplete: () => { console.log("finished") },
  // other callbacks: onStart, onUpdate, onRepeat, onReverseComplete
});

// "from" tween - animate from provided values
gsap.from('.selector', { fromVars });

// "fromTo" tween (define both start and end values)
gsap.fromTo('.selector', { fromVars }, { toVars });
// special properties (duration, ease, etc.) go in toVars

// set values immediately (no animation)
gsap.set('.selector', { toVars });
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
  defaults: {
    duration: 1,
    ease: 'none'
  },
  smoothChildTiming: true,
  autoRemoveChildren: true,
  onComplete: () => { console.log("finished") },
  // other callbacks: onStart, onUpdate, onRepeat, onReverseComplete
});

// Sequence multiple tweens
tl.to('.selector', { duration: 1, x: 50, y: 0 })
  .to('#id', { autoAlpha: 0 })
  .to(elem, { duration: 1, backgroundColor: 'red' })
  .to([elem, elem2], { duration: 3, x: 100 });

// position parameter (controls placement)
tl.to(target, { toVars }, positionParameter);

0.7           // exactly 0.7 seconds into the timeline (absolute)
'-=0.7'       // overlap with previous by 0.7 sec
'myLabel'     // insert at "myLabel" position
'myLabel+=0.2'// 0.2 seconds after "myLabel"
'<'           // align with start of most recently-added child
'<0.2'        // 0.2 seconds after ^^
'-=50%'       // overlap half of inserting animation's duration
'<25%'        // 25% into the previous animation (from its start)
```

### Nesting Timelines

```js
function scene1() {
  let tl = gsap.timeline();
  tl.to(...).to(...);
  return tl;
}

function scene2() {
  let tl = gsap.timeline();
  tl.to(...).to(...);
  return tl;
}

let master = gsap.timeline()
  .add(scene1())
  .add(scene2(), "-=0.5") // overlap slightly
```

---

## Control Methods

```js
let anim = gsap.to(...); // or gsap.timeline(...)

anim.play()
    .pause()
    .resume()         // respects direction
    .reverse()
    .restart()
    .timeScale(2)     // 2 = double speed, 0.5 = half speed
    .seek(1.5)        // jump to a time (in seconds) or label
    .progress(0.5)    // jump to halfway
    .totalProgress(0.8) // includes repeats

// other useful methods
.kill()           // immediately destroy
.isActive()       // true if currently animating
.then()           // Promise
.invalidate()     // clear recorded start/end values
.eventCallback()  // get/set an event callback

// timeline-specific methods
.add(thing, position)         // add label, tween, timeline, or callback
.call(func, params, position) // calls function at given point
.getChildren()                // get Array of the timeline's children
.clear()                      // empties the timeline
.tweenTo(timeOrLabel, {vars})
.tweenFromTo(from, to, {vars})
```

---

## Eases

```js
ease: 'none' // no ease (same as "linear")

// basic core eases
'power1', 'power2', 'power3', 'power4', 'circ', 'expo', 'sine'
// each has .in, .out, and .inOut extensions → "power1.inOut"

// expressive core eases
'elastic', 'back', 'bounce', 'steps(n)'

// EasePack plugin (not core)
'rough', 'slow', 'expoScale(1, 2)'

// expressive plugin eases
CustomEase, CustomWiggle, CustomBounce
```

---

## ScrollTrigger

```js
scrollTrigger: {
  trigger: ".selector",       // selector or element
  start: "top center",        // [trigger] [scroller] positions
  end: "20px 80%",            // [trigger] [scroller] positions
  // or relative amount: "+=500"
  scrub: true,                // or time (in seconds) to catch up
  pin: true,                  // or selector or element to pin
  markers: true,              // only during development!
  toggleActions: "play pause resume reset",
  // other actions: complete reverse none
  toggleClass: "active",
  fastScrollEnd: true,        // or velocity number
  containerAnimation: tween, // linear animation
  id: "my-id",
  anticipatePin: 1,           // may help avoid jump
  snap: {
    snapTo: 1 / 10,           // progress increment
    // or "labels" or function or Array
    duration: 0.5,
    directional: true,
    ease: "power3",
    onComplete: callback,
    // other callbacks: onStart, onInterrupt
  },
  pinReparent: true,          // moves to documentElement during pin
  pinSpacing: false,
  pinType: "transform",       // or "fixed"
  pinnedContainer: ".selector",
  preventOverlaps: true,      // or arbitrary string
  once: true,
  endTrigger: ".selector",
  horizontal: true,           // switches mode
  invalidateOnRefresh: true,  // clears start values on refresh
  refreshPriority: 1,         // influence refresh order
  onEnter: callback
  // other callbacks:
  // onLeave, onEnterBack, onLeaveBack, onUpdate,
  // onToggle, onRefresh, onRefreshInit, onScrubComplete
}
```

---

## Plugins

```js
// Register GSAP plugins (once) before using them
gsap.registerPlugin(Draggable, TextPlugin);

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
// accessible through gsap.utils.foo()
gsap.utils.checkPrefix()   // get relevant browser prefix for property
gsap.utils.clamp()         // clamp value to range
gsap.utils.distribute()    // distribute value among an array
gsap.utils.getUnit()       // get unit of string
gsap.utils.interpolate()   // interpolate between values
gsap.utils.mapRange()      // map one range to another
gsap.utils.normalize()     // map a range to the 0-1 range
gsap.utils.pipe()          // sequence function calls
gsap.utils.random()        // generates a random value
gsap.utils.selector()      // get a scoped selector function
gsap.utils.shuffle()       // shuffles an array in-place
gsap.utils.snap()          // snap a value to either increment or array
gsap.utils.splitColor()    // splits color into RGB array
gsap.utils.toArray()       // convert array-like thing to array
gsap.utils.unitize()       // adds specified unit to function results
gsap.utils.wrap()          // place number in range, wrapping to start
gsap.utils.wrapYoyo()      // place number in range, wrapping in reverse
```

---

## Misc

```js
// Get the current value of a property
gsap.getProperty("#id", "x");        // 20
gsap.getProperty("#id", "x", "px");  // "20px"

// Set GSAP's global tween defaults
gsap.defaults({ ease: "power2.in", duration: 1 });

// Configure GSAP's non-tween-related settings
gsap.config({
  autoSleep: 60,
  force3D: false,
  nullTargetWarn: false,
  trialWarn: false,
  units: { left: "%", top: "%", rotation: "rad" }
});

// Register an effect for reuse
gsap.registerEffect({
  name: "fade",
  effect: (targets, config) => {
    return gsap.to(targets, { duration: config.duration, opacity: 0 });
  },
  defaults: { duration: 2 },
  extendTimeline: true
});

// Use registered effect
gsap.effects.fade(".box");
tl.fade(".box", { duration: 3 }); // directly on timelines

// Add listener with gsap.ticker
gsap.ticker.add(myFunction);
function myFunction(time, deltaTime, frame) {
  // Executes on every tick after the core engine updates
}
gsap.ticker.remove(myFunction);

// quickSetter — faster way to repeatedly set property than .set()
let setX = gsap.quickSetter("#id", "x", "px");
document.addEventListener("mousemove", e => setX(e.clientX));

// quickTo — for animation
let xTo = gsap.quickTo("#id", "x", { duration: 0.4, ease: "power3" });
document.addEventListener("mousemove", e => xTo(e.pageX));
```

---

## Common Patterns

All selectors are generic. Replace with your actual class names.

### Horizontal Scroll Pin

```js
// Steps / process / how-it-works sections on any site
gsap.registerPlugin(ScrollTrigger);

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
// Any repeating card/grid layout
gsap.from(".card", {
  opacity: 0,
  y: 40,
  duration: 0.8,
  stagger: 0.1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".section-container",
    start: "top 75%",
  }
});
```

### Animated Underline / Line Draw

```js
gsap.from(".accent-line", {
  width: 0,
  duration: 0.6,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".headline-container",
    start: "top 70%",
  }
});
```

### Parallax Image

```js
gsap.to(".parallax-img", {
  yPercent: -20,
  ease: "none",
  scrollTrigger: {
    trigger: ".parallax-section",
    start: "top bottom",
    end: "bottom top",
    scrub: true,
  }
});
```

### Kinetic Typography — Character Reveal

```js
// Requires SplitText plugin
gsap.registerPlugin(SplitText);

const split = new SplitText(".headline", { type: "chars,words" });

gsap.from(split.chars, {
  opacity: 0,
  y: 60,
  rotationX: -90,
  stagger: 0.02,
  duration: 0.6,
  ease: "back.out(1.7)",
  scrollTrigger: {
    trigger: ".headline",
    start: "top 80%",
  }
});
```

### Counter / Number Animate Up

```js
gsap.to(".stat-number", {
  innerHTML: 100, // replace with target number
  duration: 2,
  ease: "power2.out",
  snap: { innerHTML: 1 },
  scrollTrigger: {
    trigger: ".stats-section",
    start: "top 75%",
    once: true,
  }
});
```

### Image Scale on Hover

```js
document.querySelectorAll(".hover-scale").forEach(el => {
  el.addEventListener("mouseenter", () =>
    gsap.to(el, { scale: 1.05, duration: 0.4, ease: "power2.out" })
  );
  el.addEventListener("mouseleave", () =>
    gsap.to(el, { scale: 1, duration: 0.4, ease: "power2.out" })
  );
});
```

### Page Transition (Next.js App Router)

```js
gsap.fromTo("main",
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
);
```

### Cleanup on Unmount (Next.js — always required)

```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap code goes inside here
  }, containerRef);

  return () => ctx.revert();
}, []);
```

---

## File Map

```
skills/gsap-reference/
  SKILL.md    This file — full reference + universal patterns
```

Source repos:
- https://github.com/greensock/GSAP.git
- https://github.com/greensock/gsap-skills.git

---

## Trigger This Skill When
- Implementing any GSAP animation on any site type
- User says: "gsap", "scrolltrigger", "scroll pin", "horizontal scroll", "stagger", "parallax", "kinetic type", "counter animate", "greensock"
- Building a scroll-pinned How It Works / Steps / Process section
- Animating stat counters or headline characters
- Setting up page transitions in Next.js App Router
- Any cinematic or animated site build in the Space Age workflow
