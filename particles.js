/* ============================================================
   PARTICLES.JS — Full-viewport animated background
   Particle constellation + floating 3D shapes + color waves
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = window.innerWidth;
  var H = window.innerHeight;
  var particles = [];
  var shapes = [];
  var mouse = { x: -999, y: -999 };
  var time = 0;

  /* ─── Resize to viewport ─── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', function () { resize(); spawn(); });

  /* ─── Particles ─── */
  var COLORS = [
    [255, 255, 255],
    [230, 57,  43 ],
    [255, 130, 50 ],
    [255, 200, 80 ]
  ];

  function makeParticle() {
    var c = COLORS[Math.random() < 0.55 ? 0 : Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * W,  y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 0.8 + Math.random() * 2.2,
      c: c,
      a: 0.12 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2
    };
  }

  /* ─── 3D CSS-style shapes drawn on canvas ─── */
  var SHAPE_DEFS = ['hex','tri','diamond','cube','ring','cross','octagon'];

  function makeShape() {
    return {
      type: SHAPE_DEFS[Math.floor(Math.random() * SHAPE_DEFS.length)],
      x: Math.random() * W,
      y: Math.random() * H,
      size: 22 + Math.random() * 50,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.007,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      tiltX: (Math.random() - 0.5),
      tiltV: (Math.random() - 0.5) * 0.005,
      a: 0.04 + Math.random() * 0.09,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  function spawn() {
    var isMobile = W < 768;
    particles = Array.from({ length: isMobile ? 35 : 85 }, makeParticle);
    shapes    = Array.from({ length: isMobile ? 2  : 7  }, makeShape);
  }

  /* ─── Draw one shape ─── */
  function drawShape(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.scale(1, Math.cos(s.tiltX * 0.7));
    var n = s.size;
    var alpha = s.a * (0.6 + 0.4 * Math.sin(time * 0.0008 + s.phase || 0));
    ctx.strokeStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + alpha + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();

    switch (s.type) {
      case 'hex':
        for (var i = 0; i < 6; i++) {
          var a = i / 6 * Math.PI * 2 - Math.PI / 6;
          i === 0 ? ctx.moveTo(Math.cos(a)*n, Math.sin(a)*n) : ctx.lineTo(Math.cos(a)*n, Math.sin(a)*n);
        }
        ctx.closePath(); break;
      case 'octagon':
        for (var i = 0; i < 8; i++) {
          var a = i / 8 * Math.PI * 2;
          i === 0 ? ctx.moveTo(Math.cos(a)*n, Math.sin(a)*n) : ctx.lineTo(Math.cos(a)*n, Math.sin(a)*n);
        }
        ctx.closePath(); break;
      case 'tri':
        for (var i = 0; i < 3; i++) {
          var a = i / 3 * Math.PI * 2 - Math.PI / 2;
          i === 0 ? ctx.moveTo(Math.cos(a)*n, Math.sin(a)*n) : ctx.lineTo(Math.cos(a)*n, Math.sin(a)*n);
        }
        ctx.closePath(); break;
      case 'diamond':
        ctx.moveTo(0,-n); ctx.lineTo(n*0.6,0); ctx.lineTo(0,n); ctx.lineTo(-n*0.6,0);
        ctx.closePath(); break;
      case 'cube':
        var h = n*0.5, d = n*0.28;
        ctx.rect(-h,-h,n,n);
        ctx.moveTo(-h,-h); ctx.lineTo(-h+d,-h-d);
        ctx.moveTo( h,-h); ctx.lineTo( h+d,-h-d);
        ctx.moveTo( h, h); ctx.lineTo( h+d, h-d);
        ctx.moveTo(-h+d,-h-d); ctx.lineTo(h+d,-h-d);
        ctx.moveTo(h+d,-h-d); ctx.lineTo(h+d,h-d);
        break;
      case 'ring':
        ctx.arc(0,0,n,0,Math.PI*2);
        ctx.moveTo(n*0.6,0);
        ctx.arc(0,0,n*0.6,0,Math.PI*2);
        break;
      case 'cross':
        var t = n*0.28;
        ctx.moveTo(-n,-t); ctx.lineTo(-t,-t); ctx.lineTo(-t,-n);
        ctx.lineTo(t,-n);  ctx.lineTo(t,-t);  ctx.lineTo(n,-t);
        ctx.lineTo(n,t);   ctx.lineTo(t,t);   ctx.lineTo(t,n);
        ctx.lineTo(-t,n);  ctx.lineTo(-t,t);  ctx.lineTo(-n,t);
        ctx.closePath(); break;
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ─── Ambient glow zones (wave-like color shifts) ─── */
  function drawGlowZones() {
    var t = time * 0.0004;
    /* Warm zone — moves slowly */
    var gx = W * (0.2 + 0.15 * Math.sin(t));
    var gy = H * (0.4 + 0.2 * Math.cos(t * 0.7));
    var gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.45);
    gr.addColorStop(0,   'rgba(230,57,43,0.032)');
    gr.addColorStop(0.5, 'rgba(180,40,20,0.014)');
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);

    /* Cool accent zone */
    var gx2 = W * (0.75 + 0.12 * Math.cos(t * 0.8));
    var gy2 = H * (0.3  + 0.15 * Math.sin(t * 1.1));
    var gr2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, W * 0.3);
    gr2.addColorStop(0,   'rgba(80,120,255,0.022)');
    gr2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr2; ctx.fillRect(0,0,W,H);

    /* Orange pulse */
    var gx3 = W * (0.5 + 0.2 * Math.sin(t * 1.3));
    var gy3 = H * (0.8 + 0.1 * Math.cos(t));
    var gr3 = ctx.createRadialGradient(gx3, gy3, 0, gx3, gy3, W * 0.35);
    gr3.addColorStop(0,   'rgba(255,110,30,0.022)');
    gr3.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr3; ctx.fillRect(0,0,W,H);
  }

  /* ─── Main loop ─── */
  function frame() {
    requestAnimationFrame(frame);
    time++;

    ctx.clearRect(0,0,W,H);

    /* Animated color glow zones */
    drawGlowZones();

    /* Shapes */
    for (var i = 0; i < shapes.length; i++) {
      var s = shapes[i];
      s.rot   += s.rotV;
      s.tiltX += s.tiltV;
      s.x     += s.vx;
      s.y     += s.vy;
      /* Wrap around edges */
      if (s.x < -60) s.x = W + 60;
      if (s.x > W+60) s.x = -60;
      if (s.y < -60) s.y = H + 60;
      if (s.y > H+60) s.y = -60;
      drawShape(s);
    }

    /* Particles + connections */
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      /* Bounce */
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      var isMob = W < 768;
    var pa = p.a * (isMob ? 0.5 : 0.65 + 0.35 * Math.sin(time * 0.012 + p.phase));

      /* Glow halo for larger nodes */
      if (p.r > 1.8) {
        var halo = ctx.createRadialGradient(p.x,p.y,0, p.x,p.y, p.r*4);
        halo.addColorStop(0, 'rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+(pa*0.3)+')');
        halo.addColorStop(1, 'rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+',0)');
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);
        ctx.fillStyle = halo; ctx.fill();
      }

      /* Core dot */
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+pa+')';
      ctx.fill();

      /* Connection lines */
      for (var j = i+1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x-q.x, dy = p.y-q.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 130) {
          var la = (1 - d/130) * 0.22;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = 'rgba(255,255,255,'+la+')';
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* Mouse interaction */
      var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      var md = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < 160) {
        var mf = 1 - md/160;
        /* Repel slightly */
        p.vx += mdx/md * mf * 0.04;
        p.vy += mdy/md * mf * 0.04;
        /* Clamp speed */
        var spd = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
        if (spd > 1.5) { p.vx /= spd/1.5; p.vy /= spd/1.5; }
        /* Orange glow on affected particles */
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
        ctx.fillStyle = 'rgba(230,80,30,'+(mf*0.10)+')';
        ctx.fill();
        /* Line to cursor */
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y);
        ctx.strokeStyle = 'rgba(230,80,30,'+(mf*0.10)+')';
        ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
  }

  window.addEventListener('mousemove', function(e) { mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('mouseleave', function() { mouse.x=-999; mouse.y=-999; });

  resize();
  spawn();
  frame();

})();
