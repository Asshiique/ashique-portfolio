/* ============================================================
   PARTICLES.JS — Global animated background for entire site
   Particle constellation + floating 3D shapes
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0;
  var particles = [];
  var shapes    = [];
  var mouse     = { x: -9999, y: -9999 };
  var scrollY   = 0;
  var RAF_ID    = null;

  /* ─── Config ─────────────────────────────────────────────── */
  var CFG = {
    particleCount : 90,
    connectDist   : 130,
    speed         : 0.35,
    nodeSizes     : [1, 1.2, 1.5, 2, 2.5, 3],
    colors        : [
      'rgba(255,255,255,',
      'rgba(230,57,43,',
      'rgba(255,140,60,',
      'rgba(200,60,30,'
    ],
    shapeCount    : 6
  };

  /* ─── Resize ──────────────────────────────────────────────── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  /* ─── Particles ───────────────────────────────────────────── */
  function makeParticle() {
    var col = CFG.colors[Math.random() < 0.65 ? 0 : Math.floor(Math.random() * CFG.colors.length)];
    return {
      x   : Math.random() * W,
      y   : Math.random() * H,
      vx  : (Math.random() - 0.5) * CFG.speed,
      vy  : (Math.random() - 0.5) * CFG.speed,
      r   : CFG.nodeSizes[Math.floor(Math.random() * CFG.nodeSizes.length)],
      a   : 0.15 + Math.random() * 0.45,
      col : col,
      pulse : Math.random() * Math.PI * 2  /* phase offset */
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < CFG.particleCount; i++) particles.push(makeParticle());
  }

  /* ─── 3D Floating Shapes ──────────────────────────────────── */
  var SHAPE_TYPES = ['hexagon', 'triangle', 'diamond', 'cube', 'ring', 'cross'];

  function makeShape() {
    return {
      type  : SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
      x     : 80 + Math.random() * (W - 160),
      y     : 200 + Math.random() * (H - 400),
      size  : 25 + Math.random() * 55,
      rot   : Math.random() * Math.PI * 2,
      rotV  : (Math.random() - 0.5) * 0.008,
      vx    : (Math.random() - 0.5) * 0.18,
      vy    : (Math.random() - 0.5) * 0.18,
      a     : 0.04 + Math.random() * 0.10,
      col   : CFG.colors[Math.floor(Math.random() * CFG.colors.length)],
      tiltX : (Math.random() - 0.5) * 0.6,
      tiltV : (Math.random() - 0.5) * 0.004
    };
  }

  function initShapes() {
    shapes = [];
    for (var i = 0; i < CFG.shapeCount; i++) shapes.push(makeShape());
  }

  /* ─── Draw Shapes ─────────────────────────────────────────── */
  function drawShape(s, t) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);

    /* 3D tilt illusion via scale */
    ctx.scale(1, Math.cos(s.tiltX));

    ctx.strokeStyle = s.col + s.a + ')';
    ctx.lineWidth   = 1;
    ctx.beginPath();

    var n = s.size;
    switch (s.type) {
      case 'hexagon':
        for (var k = 0; k < 6; k++) {
          var ang = (k / 6) * Math.PI * 2 - Math.PI / 6;
          k === 0 ? ctx.moveTo(Math.cos(ang) * n, Math.sin(ang) * n)
                  : ctx.lineTo(Math.cos(ang) * n, Math.sin(ang) * n);
        }
        ctx.closePath();
        break;
      case 'triangle':
        for (var k = 0; k < 3; k++) {
          var ang = (k / 3) * Math.PI * 2 - Math.PI / 2;
          k === 0 ? ctx.moveTo(Math.cos(ang) * n, Math.sin(ang) * n)
                  : ctx.lineTo(Math.cos(ang) * n, Math.sin(ang) * n);
        }
        ctx.closePath();
        break;
      case 'diamond':
        ctx.moveTo(0, -n); ctx.lineTo(n * 0.6, 0);
        ctx.lineTo(0, n);  ctx.lineTo(-n * 0.6, 0);
        ctx.closePath();
        break;
      case 'cube':
        /* front face */
        ctx.rect(-n * 0.5, -n * 0.5, n, n);
        ctx.moveTo(-n * 0.5, -n * 0.5); ctx.lineTo(-n * 0.2, -n * 0.8);
        ctx.moveTo( n * 0.5, -n * 0.5); ctx.lineTo( n * 0.8, -n * 0.8);
        ctx.moveTo( n * 0.5,  n * 0.5); ctx.lineTo( n * 0.8,  n * 0.2);
        ctx.moveTo(-n * 0.2, -n * 0.8); ctx.lineTo(n * 0.8, -n * 0.8);
        ctx.moveTo(n * 0.8,  -n * 0.8); ctx.lineTo(n * 0.8,  n * 0.2);
        break;
      case 'ring':
        ctx.arc(0, 0, n, 0, Math.PI * 2);
        ctx.moveTo(0, 0); /* inner ring */
        ctx.arc(0, 0, n * 0.55, 0, Math.PI * 2);
        break;
      case 'cross':
        var t2 = n * 0.3;
        ctx.moveTo(-n, -t2); ctx.lineTo(-t2, -t2); ctx.lineTo(-t2, -n);
        ctx.lineTo( t2, -n); ctx.lineTo( t2, -t2); ctx.lineTo( n,  -t2);
        ctx.lineTo( n,   t2); ctx.lineTo( t2,  t2); ctx.lineTo( t2,  n);
        ctx.lineTo(-t2,  n); ctx.lineTo(-t2,  t2); ctx.lineTo(-n,   t2);
        ctx.closePath();
        break;
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ─── Main Draw ───────────────────────────────────────────── */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    /* Draw shapes */
    for (var i = 0; i < shapes.length; i++) {
      var s = shapes[i];
      s.rot   += s.rotV;
      s.tiltX += s.tiltV;
      s.x     += s.vx;
      s.y     += s.vy;
      if (s.x < -100 || s.x > W + 100) s.vx *= -1;
      if (s.y < -100 || s.y > H + 100) s.vy *= -1;
      drawShape(s, t);
    }

    /* Update + draw particles */
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* Pulse opacity */
      var pa = p.a * (0.7 + 0.3 * Math.sin(t * 0.001 + p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + pa + ')';
      ctx.fill();

      /* Connect nearby particles */
      for (var j = i + 1; j < particles.length; j++) {
        var q  = particles[j];
        var dx = p.x - q.x, dy = p.y - q.y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CFG.connectDist) {
          var lineA = (1 - d / CFG.connectDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(255,255,255,' + lineA + ')';
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }

      /* Mouse attraction glow */
      var mdx = p.x - mouse.x, mdy = p.y - (mouse.y + scrollY);
      var md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 140) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230,57,43,' + (1 - md / 140) * 0.5 + ')';
        ctx.fill();

        /* Connect mouse-near particles with orange lines */
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y + scrollY);
        ctx.strokeStyle = 'rgba(230,80,30,' + (1 - md / 140) * 0.25 + ')';
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    }
  }

  /* ─── Animation Loop ──────────────────────────────────────── */
  function loop(t) {
    RAF_ID = requestAnimationFrame(loop);
    draw(t);
  }

  /* ─── Init ────────────────────────────────────────────────── */
  function init() {
    resize();
    initParticles();
    initShapes();
    if (!RAF_ID) loop(0);
  }

  window.addEventListener('resize', function () {
    resize();
    initParticles();
    initShapes();
  });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    /* Refit canvas height when scrolling (lazy resize) */
    var newH = document.documentElement.scrollHeight;
    if (Math.abs(newH - H) > 50) { H = canvas.height = newH; canvas.style.height = H + 'px'; }
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(RAF_ID); RAF_ID = null; }
    else if (!RAF_ID) loop(0);
  });

  /* Delay init slightly so DOM paints first */
  setTimeout(init, 200);

})();
