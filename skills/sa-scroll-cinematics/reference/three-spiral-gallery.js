/* ================================================================
   Architecture B — full WebGL scrollytelling gallery.
   No real page scroll: wheel/drag accumulates into `scrollTarget`,
   smoothed toward `scrollCurrent`, which drives a spiral layout that
   can morph into a linear list. Generalized from the spiral-gallery
   reference (sample-1).
   ================================================================ */

import * as THREE from 'three';

/* ---- geometry constants — tune per project ---- */
export function makeLayout(itemCount, {
  angleStep = 0.62,
  radius = 5.4,
  pitch = 0.92,
  planeW = 2.15,
  planeH = 2.85,
  gap = 0.65,
} = {}) {
  const total = itemCount * angleStep;
  const half = total / 2;
  const spacing = planeW + gap;
  const totalW = itemCount * spacing;
  const halfW = totalW / 2;
  const linearFactor = totalW / total; // converts scroll "radians" -> list units
  return { angleStep, total, half, radius, pitch, planeW, planeH, spacing, totalW, halfW, linearFactor };
}

export const wrap = (v, total) => ((v % total) + total) % total;

/* ---- duotone / motion-blur / hover shader with SDF rounded corners ---- */

export const VERT = /* glsl */ `
  uniform float uVel;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float w = sin(uv.y * 3.14159265);
    pos.z -= w * uVel * 1.35;
    pos.x += w * uVel * 0.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uVel;
  uniform float uHover;
  uniform float uDim;
  varying vec2 vUv;

  float gray(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    float blur = clamp(abs(uVel), 0.0, 1.0) * 0.06;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      float t = float(i) / 4.0 - 0.5;
      acc += texture2D(uMap, vUv + vec2(uVel * 0.012, t * blur)).rgb;
    }
    acc /= 5.0;

    float g = smoothstep(0.02, 0.92, gray(acc));
    g = pow(g, 0.72);
    vec3 duo = mix(vec3(0.045, 0.045, 0.055), vec3(0.96, 0.94, 0.89), g);
    vec3 col = mix(duo, acc, uHover);
    col *= uDim;

    vec2 r = vec2(0.05, 0.0375);
    vec2 q = abs(vUv - 0.5) - (vec2(0.5) - r);
    float d = length(max(q / r, 0.0));
    float alpha = 1.0 - step(1.0, d);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ---- per-frame layout: call once per mesh, per frame ----
   `layoutProgress` in [0,1]: 0 = spiral, 1 = linear list (drive with
   gsap.to(layoutState, { progress: 1, duration: 1.4, ease: 'expo.inOut' })
   on a view-toggle click). */

export function placeMesh(mesh, index, scrollCurrent, layout, layoutProgress) {
  const { angleStep, total, half, radius, pitch, spacing, totalW, halfW, linearFactor } = layout;
  const u = mesh.userData;

  const theta = wrap(index * angleStep - scrollCurrent + half, total) - half;
  u.theta = theta;
  const sx = -Math.sin(theta) * radius;
  const sy = -theta * pitch;
  const sz = Math.cos(theta) * radius - radius;
  const sRotY = -theta;

  const linearScroll = scrollCurrent * linearFactor;
  const lx = wrap(index * spacing - linearScroll + halfW, totalW) - halfW;
  u.listX = lx;

  mesh.position.x = THREE.MathUtils.lerp(sx, lx, layoutProgress);
  mesh.position.y = THREE.MathUtils.lerp(sy, 0, layoutProgress);
  mesh.position.z = THREE.MathUtils.lerp(sz, 0, layoutProgress);
  mesh.rotation.y = THREE.MathUtils.lerp(sRotY, 0, layoutProgress);

  // depth dimming (spiral only — fades out as list-progress -> 1)
  const depthDim = THREE.MathUtils.clamp(
    THREE.MathUtils.mapLinear(sz, -radius * 2, 0, 0.34, 1), 0.34, 1);
  return THREE.MathUtils.lerp(depthDim, 1, layoutProgress);
}

/* ---- scroll input wiring: wheel + drag -> scrollTarget, exponential smoothing ----
   const scrollSmoothing = (dt) => 1 - Math.pow(0.0015, dt); // frame-rate independent lerp factor

   addEventListener('wheel', (e) => { scrollTarget += e.deltaY * 0.0016; }, { passive: true });

   // in tick(): scrollCurrent += (scrollTarget - scrollCurrent) * scrollSmoothing(dt);
   //            velocity = scrollTarget - scrollCurrent;
   //            smoothVel += (velocity - smoothVel) * 0.08;
   //            uniforms.uVel.value = THREE.MathUtils.clamp(smoothVel, -0.9, 0.9);
*/

/* ---- "click to focus" — smoothly scroll a clicked item to center ---- */
export function focusItem(mesh, scrollTargetRef, layout, layoutProgress) {
  const u = mesh.userData;
  const offset = layoutProgress > 0.5 ? u.listX / layout.linearFactor : u.theta;
  const proxy = { value: scrollTargetRef.value };
  gsap.to(proxy, {
    value: scrollTargetRef.value + offset,
    duration: 1.1,
    ease: 'power3.inOut',
    overwrite: true,
    onUpdate: () => { scrollTargetRef.value = proxy.value; },
  });
}
