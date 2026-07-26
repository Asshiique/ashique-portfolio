/* Spider-Man 3D Viewer — lazy-loaded when section enters viewport */
(function () {
  'use strict';

  var CANVAS_W = 280;
  var CANVAS_H = 380;

  var canvas   = document.getElementById('spideyCanvas');
  var hintEl   = document.querySelector('.spidey-hint');
  var showcase = document.getElementById('spideyShowcase');
  if (!canvas || !showcase) return;

  /* Force canvas pixel size immediately so renderer gets real dimensions */
  canvas.width  = CANVAS_W * (window.devicePixelRatio || 1);
  canvas.height = CANVAS_H * (window.devicePixelRatio || 1);
  canvas.style.width  = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';

  var scene, camera, renderer, model, mixer, clock;
  var isReady    = false;
  var autoRotate = true;
  var isDragging = false;
  var prevX = 0, prevY = 0;
  var rotY = 0, rotX = 0;
  var targetRotY = 0;
  var rafId = null;

  /* === INIT THREE === */
  function init() {
    if (typeof THREE === 'undefined') { console.warn('THREE not loaded'); return; }
    if (isReady) return;

    scene  = new THREE.Scene();
    clock  = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(38, CANVAS_W / CANVAS_H, 0.01, 100);
    camera.position.set(0, 0.9, 3.2);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(CANVAS_W, CANVAS_H);
    renderer.setClearColor(0x000000, 0);
    /* sRGB encoding — r128 uses numeric value 3001 */
    if (THREE.sRGBEncoding)    renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.LinearEncoding)  renderer.outputEncoding = THREE.sRGBEncoding || 3001;

    /* Lighting — red Spider-Man palette */
    var ambient = new THREE.AmbientLight(0xffffff, 0.8);
    var key     = new THREE.DirectionalLight(0xffeedd, 1.8);
    key.position.set(2, 3, 3);
    var rim     = new THREE.DirectionalLight(0x2244ff, 0.7);
    rim.position.set(-2, 1, -2);
    var fill    = new THREE.DirectionalLight(0xff3311, 0.4);
    fill.position.set(0, -1, 2);
    scene.add(ambient, key, rim, fill);

    /* Load GLB */
    if (typeof THREE.GLTFLoader === 'undefined') { console.warn('GLTFLoader not loaded'); return; }
    var loader = new THREE.GLTFLoader();
    loader.load(
      'assets/images/spiderman.glb',
      function (gltf) {
        model = gltf.scene;

        /* Fix texture encoding */
        model.traverse(function (child) {
          if (child.isMesh && child.material) {
            if (child.material.map) child.material.map.encoding = 3001; /* sRGB */
            child.material.needsUpdate = true;
          }
        });

        /* Center and scale to fit */
        var box    = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        var scale  = 1.65 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.y -= 0.05;

        scene.add(model);

        /* Play first animation */
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
        }

        isReady = true;
        if (!rafId) animate();
      },
      undefined,
      function (err) { console.warn('Spider-Man GLB load failed:', err); }
    );
  }

  /* === ANIMATE LOOP === */
  function animate() {
    rafId = requestAnimationFrame(animate);
    if (!isReady) return;

    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (autoRotate && !isDragging) targetRotY += 0.009;

    rotY += (targetRotY - rotY) * 0.08;
    rotX += (0             - rotX) * 0.05;

    model.rotation.y = rotY;
    model.rotation.x = Math.max(-0.4, Math.min(0.4, rotX));

    renderer.render(scene, camera);
  }

  /* === DRAG === */
  canvas.addEventListener('mousedown',  function (e) { isDragging = true; autoRotate = false; prevX = e.clientX; prevY = e.clientY; if (hintEl) hintEl.classList.add('hidden'); });
  canvas.addEventListener('touchstart', function (e) { isDragging = true; autoRotate = false; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; if (hintEl) hintEl.classList.add('hidden'); }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevX) * 0.013;
    rotX       += (e.clientY - prevY) * 0.009;
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    targetRotY += (e.touches[0].clientX - prevX) * 0.013;
    rotX       += (e.touches[0].clientY - prevY) * 0.009;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('mouseup',  function () { isDragging = false; });
  window.addEventListener('touchend', function () { isDragging = false; });

  /* === ZOOM === */
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.005));
  }, { passive: false });

  /* === LAZY LOAD via IntersectionObserver === */
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      /* Small delay so layout is painted and canvas has real size */
      setTimeout(function () { init(); }, 100);
      io.disconnect();
    }
  }, { threshold: 0.15 });
  io.observe(showcase);

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (isReady && !rafId) animate();
  });

})();
