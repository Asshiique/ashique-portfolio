/* Spider-Man 3D Viewer — lazy-loaded when section enters viewport */
(function () {
  'use strict';

  var canvas   = document.getElementById('spideyCanvas');
  var hintEl   = document.querySelector('.spidey-hint');
  var showcase = document.getElementById('spideyShowcase');
  if (!canvas || !showcase) return;

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
    if (typeof THREE === 'undefined') return;
    if (isReady) return;

    var W = canvas.offsetWidth  || 280;
    var H = canvas.offsetHeight || 380;

    scene    = new THREE.Scene();
    clock    = new THREE.Clock();
    camera   = new THREE.PerspectiveCamera(40, W / H, 0.01, 100);
    camera.position.set(0, 0.9, 3.2);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;

    /* Lighting */
    var ambient  = new THREE.AmbientLight(0xffffff, 0.7);
    var key      = new THREE.DirectionalLight(0xffeedd, 1.6);
    key.position.set(2, 3, 3);
    var rim      = new THREE.DirectionalLight(0x3355ff, 0.8);
    rim.position.set(-2, 1, -2);
    var fill     = new THREE.DirectionalLight(0xff4422, 0.5);
    fill.position.set(0, -1, 2);
    scene.add(ambient, key, rim, fill);

    /* Load GLB */
    var loader = new THREE.GLTFLoader();
    loader.load(
      'assets/images/spiderman.glb',
      function (gltf) {
        model = gltf.scene;

        /* Fix materials for sRGB textures */
        model.traverse(function (child) {
          if (child.isMesh && child.material) {
            if (child.material.map) child.material.map.encoding = THREE.sRGBEncoding || 3001;
            child.material.needsUpdate = true;
          }
        });

        /* Center and scale */
        var box    = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        var scale  = 1.6 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.y -= 0.1; /* shift down slightly */

        scene.add(model);

        /* Play first animation if any */
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          var action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        isReady = true;
        animate();
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

    /* Auto-rotate when not dragging */
    if (autoRotate && !isDragging) {
      targetRotY += 0.008;
    }

    /* Smooth lerp */
    rotY += (targetRotY - rotY) * 0.07;
    rotX += (0 - rotX) * 0.04;  /* gently return X to 0 */

    model.rotation.y = rotY;
    model.rotation.x = Math.max(-0.4, Math.min(0.4, rotX));

    renderer.render(scene, camera);
  }

  /* === DRAG INTERACTION === */
  canvas.addEventListener('mousedown',  function (e) { isDragging = true; prevX = e.clientX; prevY = e.clientY; autoRotate = false; });
  canvas.addEventListener('touchstart', function (e) { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; autoRotate = false; }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - prevX;
    var dy = e.clientY - prevY;
    targetRotY += dx * 0.012;
    rotX       += dy * 0.008;
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    var dx = e.touches[0].clientX - prevX;
    var dy = e.touches[0].clientY - prevY;
    targetRotY += dx * 0.012;
    rotX       += dy * 0.008;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('mouseup',  function () { isDragging = false; });
  window.addEventListener('touchend', function () { isDragging = false; });

  /* === SCROLL-TO-ZOOM === */
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.005));
  }, { passive: false });

  /* === HIDE HINT AFTER INTERACTION === */
  canvas.addEventListener('mousedown',  function () { if (hintEl) hintEl.classList.add('hidden'); });
  canvas.addEventListener('touchstart', function () { if (hintEl) hintEl.classList.add('hidden'); }, { passive: true });

  /* === LAZY INIT via IntersectionObserver === */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          init();
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(showcase);
  } else {
    init(); /* fallback — init immediately */
  }

  /* Pause rAF when tab hidden */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (isReady && !rafId) animate();
  });

})();
