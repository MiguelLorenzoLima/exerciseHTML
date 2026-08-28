import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const stage = document.querySelector('#viola-stage');
const toggle = document.querySelector('#toggle');
if (!stage || !toggle) throw new Error('Required DOM elements not found');

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
camera.position.set(0, 0.15, 8.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff7eb, 0x24170c, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 3.5);
key.position.set(3, 5, 5);
scene.add(key);
const rim = new THREE.PointLight(0xd4a34f, 10, 15, 2);
rim.position.set(-3, 0.5, 3);
scene.add(rim);

function makeViolaBody() {
  const s = new THREE.Shape();
  s.moveTo(0, 2.55);
  s.bezierCurveTo(-0.65, 2.5, -1.25, 2.05, -1.42, 1.34);
  s.bezierCurveTo(-1.53, 0.95, -1.48, 0.65, -1.25, 0.28);
  s.bezierCurveTo(-1.05, -0.02, -0.92, -0.23, -1.02, -0.48);
  s.bezierCurveTo(-1.12, -0.74, -1.46, -0.64, -1.53, -0.91);
  s.bezierCurveTo(-1.58, -1.14, -1.28, -1.28, -1.38, -1.62);
  s.bezierCurveTo(-1.54, -2.13, -1.36, -2.78, -0.82, -3.12);
  s.bezierCurveTo(-0.42, -3.38, 0.42, -3.38, 0.82, -3.12);
  s.bezierCurveTo(1.36, -2.78, 1.54, -2.13, 1.38, -1.62);
  s.bezierCurveTo(1.28, -1.28, 1.58, -1.14, 1.53, -0.91);
  s.bezierCurveTo(1.46, -0.64, 1.12, -0.74, 1.02, -0.48);
  s.bezierCurveTo(0.92, -0.23, 1.05, -0.02, 1.25, 0.28);
  s.bezierCurveTo(1.48, 0.65, 1.53, 0.95, 1.42, 1.34);
  s.bezierCurveTo(1.25, 2.05, 0.65, 2.5, 0, 2.55);
  s.closePath();

  const geometry = new THREE.ExtrudeGeometry(s, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.04,
    curveSegments: 20
  });
  geometry.center();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x8d4f16,
    roughness: 0.28,
    metalness: 0.02,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18
  });
  return new THREE.Mesh(geometry, material);
}

const viola = new THREE.Group();
viola.scale.setScalar(0.91);
viola.rotation.x = THREE.MathUtils.degToRad(-2);
scene.add(viola);

viola.add(makeViolaBody());

const loader = new THREE.TextureLoader();
const frontTex = loader.load('assets/viola/viola-front.png');
const backTex = loader.load('assets/viola/viola-back.png');
for (const t of [frontTex, backTex]) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
}

const frontMat = new THREE.MeshPhysicalMaterial({
  map: frontTex, transparent: true, side: THREE.FrontSide,
  roughness: 0.33, metalness: 0.0, clearcoat: 0.25
});
const backMat = new THREE.MeshPhysicalMaterial({
  map: backTex, transparent: true, side: THREE.FrontSide,
  roughness: 0.37, metalness: 0.0, clearcoat: 0.25
});

const front = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 5.04), frontMat);
front.position.set(0, -0.13, 0.18);
front.scale.set(0.77, 0.77, 1);
viola.add(front);

const back = new THREE.Mesh(new THREE.PlaneGeometry(3.48, 5.05), backMat);
back.position.set(0, -0.12, -0.18);
back.rotation.y = Math.PI;
back.scale.set(0.77, 0.77, 1);
viola.add(back);

const glow = new THREE.Mesh(
  new THREE.PlaneGeometry(4.5, 0.85),
  new THREE.MeshBasicMaterial({ color: 0x6f3e12, transparent: true, opacity: 0.18 })
);
glow.rotation.x = -Math.PI / 2;
glow.position.set(0, -3.45, 0);
scene.add(glow);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 6.6;
controls.maxDistance = 10.5;
controls.minPolarAngle = Math.PI * 0.39;
controls.maxPolarAngle = Math.PI * 0.61;
controls.target.set(0, -0.15, 0);
controls.autoRotate = false;

let spinning = true;
let pointerX = 0;
let pointerY = 0;
let targetRotY = 0;
let targetRotX = THREE.MathUtils.degToRad(-2);
let scrollOffset = 0;

stage.addEventListener('pointermove', (event) => {
  const rect = stage.getBoundingClientRect();
  pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  targetRotY = pointerX * 0.18;
  targetRotX = THREE.MathUtils.degToRad(-2) + pointerY * 0.10;
});

stage.addEventListener('wheel', (event) => {
  scrollOffset += event.deltaY * 0.0005;
  scrollOffset = THREE.MathUtils.clamp(scrollOffset, -0.45, 0.45);
});

toggle.addEventListener('click', () => {
  spinning = !spinning;
  toggle.textContent = spinning ? 'Pausar rotação' : 'Continuar rotação';
});

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let start = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const t = (now - start) * 0.001;

  if (spinning) {
    viola.rotation.y += 0.0075;
  }
  viola.rotation.x += (targetRotX - viola.rotation.x) * 0.035;
  viola.rotation.z = Math.sin(t * 0.75) * 0.035 + scrollOffset * 0.2;
  viola.position.y = Math.sin(t * 1.25) * 0.10 + Math.sin(t * 0.42) * 0.05;
  viola.position.x = Math.sin(t * 0.45) * 0.09 + pointerX * 0.16;
  viola.rotation.y += targetRotY * 0.0025;
  glow.material.opacity = 0.13 + (Math.sin(t * 1.25) + 1) * 0.025;

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.viola3D = {
  object: viola,
  scene,
  camera,
  renderer,
  pause() { spinning = false; },
  play() { spinning = true; },
  setScale(value) { viola.scale.setScalar(Number(value) || 0.91); }
};
