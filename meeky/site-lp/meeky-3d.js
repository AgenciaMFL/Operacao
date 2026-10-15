import * as THREE from 'https://esm.sh/three@0.184.0';
import { OrbitControls } from 'https://esm.sh/three@0.184.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.184.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://esm.sh/three@0.184.0/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'https://esm.sh/three@0.184.0/examples/jsm/libs/meshopt_decoder.module.js';

class Meeky3D extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    this.style.display = 'block';
    this.style.position = 'relative';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.cursor = 'grab';
    this.style.touchAction = 'none';

    const hint = document.createElement('div');
    hint.textContent = this.getAttribute('hint') || 'arraste para girar';
    Object.assign(hint.style, {
      position: 'absolute', left: '50%', bottom: '8px', transform: 'translateX(-50%)',
      font: '600 10.5px/1 -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      letterSpacing: '.18em', textTransform: 'uppercase', color: this.getAttribute('hint-color') || '#FFFFFF',
      padding: '9px 16px', borderRadius: '999px', background: 'rgba(8,8,8,.72)',
      border: '1px solid rgba(226,173,104,.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      pointerEvents: 'none', transition: 'opacity .4s', zIndex: '2', whiteSpace: 'nowrap'
    });
    this.appendChild(hint);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this._flag = () => !!(this.querySelector('canvas'));
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
    this.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.position.set(1.1, 0.45, 2.6);

    const accent = new THREE.Color(this.getAttribute('accent') || '#8FC2CE');
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdedbd6, 0.7));
    const key = new THREE.DirectionalLight(0xfff2e0, 2.6);
    key.position.set(2.2, 3, 2.6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(accent, 2.1);
    fill.position.set(-2.6, 0.6, 1.2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xbfd4ff, 1.4);
    rim.position.set(-1.4, 1.6, -2.6);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.rotateSpeed = 0.9;

    const pivot = new THREE.Group();
    scene.add(pivot);

    let spinning = true;
    let resumeTimer = null;
    const stop = () => {
      spinning = false;
      clearTimeout(resumeTimer);
      hint.style.opacity = '0';
      this.style.cursor = 'grabbing';
    };
    const release = () => {
      this.style.cursor = 'grab';
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { spinning = true; hint.style.opacity = '1'; }, 1100);
    };
    controls.addEventListener('start', stop);
    controls.addEventListener('end', release);

    const rid = this.getAttribute('resource-id');
    const fileSrc = this.getAttribute('data-glb');
    const url = fileSrc ? new URL(fileSrc, document.baseURI).href : ((rid && window.__resources && window.__resources[rid]) || new URL(this.getAttribute('src'), document.baseURI).href);
    const gltfLoader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    gltfLoader.setDRACOLoader(draco);
    try { gltfLoader.setMeshoptDecoder(MeshoptDecoder); } catch (e) {}
    gltfLoader.load(url, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 1 / Math.max(size.x, size.y, size.z);
      model.position.sub(center);
      model.scale.setScalar(scale);
      this._frame = () => {
        const sx = size.x * scale, sy = size.y * scale, sz = size.z * scale;
        const halfW = 0.5 * Math.hypot(sx, sz), halfH = 0.5 * sy;
        const vFov = camera.fov * Math.PI / 180;
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
        const d = Math.max(halfH / Math.tan(vFov / 2), halfW / Math.tan(hFov / 2)) * 1.1;
        camera.position.setLength(d);
        controls.minDistance = controls.maxDistance = d;
        controls.update();
      };
      this._frame();
      model.traverse((o) => {
        if (o.isMesh && o.material && 'metalness' in o.material) {
          o.material.envMapIntensity = 1.2;
        }
      });
      pivot.add(model);
    }, undefined, (e) => console.warn('GLB load failed', e));

    const resize = () => {
      const w = this.clientWidth || 1, h = this.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      this._frame && this._frame();
    };
    resize();
    new ResizeObserver(resize).observe(this);

    let prev = performance.now();
    let visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(this);

    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - prev) / 1000, 0.1);
      prev = now;
      if (!visible) return;
      if (spinning) pivot.rotation.y += dt * 0.22;
      controls.update(dt);
      renderer.render(scene, camera);
    };
    tick();
    this._cleanup = () => { cancelAnimationFrame(this._raf); renderer.dispose(); };
  }
  disconnectedCallback() { this._cleanup && this._cleanup(); this._init = false; }
}
customElements.define('meeky-3d', Meeky3D);
