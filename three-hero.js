/**
 * THREE.JS PARTICLE HERO
 * Replaces particles.js with a GPU-accelerated Three.js particle field
 * Mouse reactive + scroll reactive + glowing particles
 */

(function () {
  'use strict';

  /* ── CDN load guard ── */
  if (typeof THREE === 'undefined') {
    console.warn('[three-hero] THREE not loaded');
    return;
  }

  /* ── Config ── */
  const isMobile = window.innerWidth < 768;
  const COUNT    = isMobile ? 600 : 1800;
  const SPREAD   = isMobile ? 60  : 120;
  const DEPTH    = 80;

  /* ── Scene ── */
  // Create a NEW canvas — don't fight over #particles-canvas (script.js uses 2D ctx on it)
  const hero = document.getElementById('hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'three-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  hero.insertBefore(canvas, hero.firstChild);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 50;

  /* ── Particle Geometry ── */
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const sizes     = new Float32Array(COUNT);
  const velocity  = new Float32Array(COUNT * 3); // drift velocity
  const home      = new Float32Array(COUNT * 3); // original positions

  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * SPREAD * 2;
    const y = (Math.random() - 0.5) * SPREAD;
    const z = (Math.random() - 0.5) * DEPTH;

    positions[i * 3]     = home[i * 3]     = x;
    positions[i * 3 + 1] = home[i * 3 + 1] = y;
    positions[i * 3 + 2] = home[i * 3 + 2] = z;

    velocity[i * 3]     = (Math.random() - 0.5) * 0.008;
    velocity[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
    velocity[i * 3 + 2] = 0;

    // Color: 70% white/grey, 30% red accent
    const isRed = Math.random() < 0.28;
    if (isRed) {
      colors[i * 3]     = 0.75; // r
      colors[i * 3 + 1] = 0.22; // g
      colors[i * 3 + 2] = 0.17; // b
    } else {
      const b = 0.35 + Math.random() * 0.55;
      colors[i * 3]     = b;
      colors[i * 3 + 1] = b;
      colors[i * 3 + 2] = b;
    }

    sizes[i] = isMobile
      ? 0.5 + Math.random() * 1.2
      : 0.4 + Math.random() * 1.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

  /* ── Custom Shader Material (glowing soft circles) ── */
  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSize;
      attribute vec3 color;
      varying vec3  vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (200.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
        vAlpha = smoothstep(50.0, 0.0, -mvPos.z);
      }
    `,
    fragmentShader: `
      varying vec3  vColor;
      varying float vAlpha;
      void main() {
        vec2  uv   = gl_PointCoord - 0.5;
        float dist = length(uv);
        float core = 1.0 - smoothstep(0.0, 0.25, dist);
        float glow = 1.0 - smoothstep(0.1, 0.5, dist);
        float alpha = (core * 0.9 + glow * 0.35) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ── Mouse tracking ── */
  const mouse   = new THREE.Vector2(9999, 9999);
  const mouseW  = new THREE.Vector2(); // world coords
  let   mouseInfluence = isMobile ? 0 : 12;

  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseW.x = mouse.x * (SPREAD);
    mouseW.y = mouse.y * (SPREAD * 0.5);
  });

  /* ── Scroll tracking ── */
  let scrollY = 0;
  let heroHeight = window.innerHeight;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  /* ── Animation loop ── */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    const pos = geometry.attributes.position.array;
    const scrollFactor = Math.min(scrollY / heroHeight, 1);
    const scrollDrift  = scrollFactor * 0.04;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;

      /* Gentle ambient drift */
      pos[i3]     += velocity[i3]     + Math.sin(frame * 0.003 + i) * 0.003;
      pos[i3 + 1] += velocity[i3 + 1] + Math.cos(frame * 0.004 + i) * 0.002;

      /* Scroll scatter — particles drift upward as user scrolls away */
      pos[i3 + 1] += scrollDrift * (0.3 + Math.random() * 0.2);

      /* Mouse repulsion */
      if (mouseInfluence > 0) {
        const dx = pos[i3]     - mouseW.x;
        const dy = pos[i3 + 1] - mouseW.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence;
          pos[i3]     += dx / dist * force * 0.18;
          pos[i3 + 1] += dy / dist * force * 0.18;
        }
      }

      /* Spring back to home position */
      const hx = home[i3];
      const hy = home[i3 + 1];
      pos[i3]     += (hx - pos[i3])     * 0.012;
      pos[i3 + 1] += (hy - pos[i3 + 1]) * 0.012;

      /* Wrap around edges */
      const hw = SPREAD;
      const hh = SPREAD * 0.5;
      if (pos[i3]     >  hw) pos[i3]     = -hw;
      if (pos[i3]     < -hw) pos[i3]     =  hw;
      if (pos[i3 + 1] >  hh) pos[i3 + 1] = -hh;
      if (pos[i3 + 1] < -hh) pos[i3 + 1] =  hh;
    }

    geometry.attributes.position.needsUpdate = true;

    /* Camera subtle float */
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.04;

    /* Fade canvas as user scrolls away from hero */
    canvas.style.opacity = 1 - scrollFactor * 1.5;

    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    heroHeight = window.innerHeight;
  });

  /* ── Pause when tab hidden ── */
  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(document.hidden ? null : animate);
  });

})();
