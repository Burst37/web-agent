/* ================================================================
   Architecture A — WebGL planes synced to real DOM elements.
   Any element with class="media" and data-tex="N" becomes a textured
   Three.js plane positioned to exactly cover that element.
   Pairs with lenis-scrolltrigger-boilerplate.js (pass scrollPos, velCurrent).
   ================================================================ */

import * as THREE from 'three';

/* ---- shaders: curtain-bend + velocity RGB split, cover-fit UVs ---- */

export const VERT = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y += sin(uv.x * 3.14159265) * uVelocity * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const FRAG = /* glsl */ `
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
    uv = (uv - 0.5) / 1.18 + 0.5;
    uv.y += uParallax * 0.07;
    float shift = clamp(uVelocity, -40.0, 40.0) * 0.00035;
    float r = texture2D(uTexture, uv + vec2(0.0, shift)).r;
    vec4  c = texture2D(uTexture, uv).rgba;
    float b = texture2D(uTexture, uv - vec2(0.0, shift)).b;
    gl_FragColor = vec4(r, c.g, b, 1.0);
  }
`;

export function fallbackTexture(w = 1600, h = 1000, from = '#161616', to = '#4d4d4d') {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Plane {
  constructor(el, texture, scene) {
    this.el = el;
    const img = texture.image;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTexture: { value: texture },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
        uTextureSize: { value: new THREE.Vector2(img?.width || 1600, img?.height || 1000) },
        uVelocity: { value: 0 },
        uParallax: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 32), this.mat);
    scene.add(this.mesh);
    this.measure();
  }

  measure() {
    const r = this.el.getBoundingClientRect();
    this.docTop = r.top + window.scrollY;
    this.left = r.left;
    this.w = r.width;
    this.h = r.height;
    this.mesh.scale.set(this.w, this.h, 1);
    this.mat.uniforms.uPlaneSize.value.set(this.w, this.h);
  }

  update(scroll, vel, vw, vh) {
    const y = this.docTop - scroll;
    if (y + this.h < -80 || y > vh + 80) { this.mesh.visible = false; return; }
    this.mesh.visible = true;
    this.mesh.position.x = -vw / 2 + this.left + this.w / 2;
    this.mesh.position.y = vh / 2 - y - this.h / 2;
    this.mat.uniforms.uVelocity.value = vel;
    this.mat.uniforms.uParallax.value = (y + this.h / 2 - vh / 2) / vh;
  }
}

/* ---- camera mapped 1:1 to CSS pixels (so plane size === element size) ---- */

const CAMZ = 600;

export function createWorld(canvas, textures, mediaSelector = '.media') {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null; // caller should fall back to CSS background-image
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  let vw = innerWidth;
  let vh = innerHeight;
  const fov = () => (2 * Math.atan(vh / 2 / CAMZ) * 180) / Math.PI;
  const camera = new THREE.PerspectiveCamera(fov(), vw / vh, 100, 2000);
  camera.position.z = CAMZ;
  renderer.setSize(vw, vh);

  const planes = [...document.querySelectorAll(mediaSelector)]
    .map((el, i) => new Plane(el, textures[+el.dataset.tex] || textures[i], scene));

  return {
    planes,
    resize() {
      vw = innerWidth; vh = innerHeight;
      camera.fov = fov();
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      renderer.setSize(vw, vh);
      planes.forEach((p) => p.measure());
    },
    update(scroll, vel) {
      planes.forEach((p) => p.update(scroll, vel, vw, vh));
      renderer.render(scene, camera);
    },
  };
}

/* ---- usage ----
const world = createWorld(document.getElementById('gl'), textures);
gsap.ticker.add(() => world?.update(scrollPos, velCurrent));
window.addEventListener('resize', () => world?.resize());
*/
