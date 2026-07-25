/* ═══════════════════════════════════════════════
   ASHIQUE PORTFOLIO v2 — JavaScript
   ═══════════════════════════════════════════════ */

/* ── PERFORMANCE: mobile detection ── */
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
              || window.innerWidth < 768;
const isSlowConn = navigator.connection && ['slow-2g','2g'].includes(navigator.connection.effectiveType);

/* ── PRELOADER: fast on mobile/slow conn ── */
document.body.style.overflow = 'hidden';
const PRELOAD_DELAY = (isMobile || isSlowConn) ? 600 : 900;
function dismissPreloader() {
  const pl = document.getElementById('preloader');
  if (pl) pl.classList.add('hidden');
  document.body.style.overflow = 'auto';
  initReveal();
  startTyper();
  if (!isMobile) animateSkillBars();
}
/* DOMContentLoaded fires earlier than load — start UI right away */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(dismissPreloader, PRELOAD_DELAY);
});
/* Safety net: also on full load */
window.addEventListener('load', () => {
  setTimeout(dismissPreloader, 100);
});

/* ── CURSOR ── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let cx = 0, cy = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
});
(function animF() {
  fx += (cx - fx) * 0.1; fy += (cy - fy) * 0.1;
  follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
  requestAnimationFrame(animF);
})();
document.querySelectorAll('a,button,.work-item,.service-card,.ai-art-item,.video-card,.filter-btn,.ai-vid-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
});

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 60); });

/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open'); mobileMenu.classList.toggle('open');
});
function closeMobile() { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); }

/* ── TYPED ROLE TEXT ── */
function startTyper() {
  const roles = ['Graphic Design', 'Videography', 'AI Videography', 'Storytelling', 'Creative Direction'];
  const el = document.getElementById('typed-role');
  if (!el) return;
  let i = 0, charI = 0, deleting = false;
  function type() {
    const word = roles[i];
    if (!deleting) {
      el.textContent = word.slice(0, charI + 1);
      charI++;
      if (charI === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, charI - 1);
      charI--;
      if (charI === 0) { deleting = false; i = (i + 1) % roles.length; setTimeout(type, 400); return; }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  setTimeout(type, 800);
}

/* ── PARTICLES ── (skip on slow connections / low-end mobile) */
(function initParticles() {
  if (isSlowConn) return;                       // skip on 2G
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const COLORS = ['192,57,43','230,126,34','192,57,43','200,80,40'];
  const particles = [];
  const COUNT = isMobile ? 22 : 70;            // 22 on mobile, 70 on desktop
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.5+0.3,
      dx: (Math.random()-.5)*.35, dy: (Math.random()-.5)*.35,
      alpha: Math.random()*.5+.05,
      c: COLORS[Math.floor(Math.random()*COLORS.length)]
    });
  }
  let rafId;
  function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(${p.c},${p.alpha})`; ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>W) p.dx*=-1;
      if(p.y<0||p.y>H) p.dy*=-1;
    });
    rafId = requestAnimationFrame(draw);
  }
  /* Pause particles when tab is hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else draw();
  });
  draw();
})();


/* ── SCROLL REVEAL ── */
function initReveal() {
  // Static reveals (added in JS)
  const jsEls = document.querySelectorAll(
    '.service-card,.work-item,.video-card,.ai-vid-card,.ai-art-item,.contact-left,.contact-right,.ai-title-block,.vid-title-block,.svc-title-block,.work-title-block,.work-showcase-card,.footer-ps'
  );
  jsEls.forEach((el, i) => {
    el.classList.add('reveal');
    const mod = i % 3;
    if (mod === 1) el.classList.add('reveal-d1');
    if (mod === 2) el.classList.add('reveal-d2');
  });

  // All elements with reveal class (including chapters pre-assigned in HTML)
  const allReveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  allReveals.forEach(el => obs.observe(el));
}

/* ── SKILL BARS ── */
function animateSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const about = document.getElementById('about');
  if (about) obs.observe(about);
}

/* ── FILTER TABS ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.work-item').forEach(item => {
      const show = f === 'all' || item.dataset.cat === f;
      item.style.transition = 'opacity .4s, transform .4s';
      item.style.opacity = show ? '1' : '0.1';
      item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
      item.style.pointerEvents = show ? 'auto' : 'none';
    });
  });
});

/* ── VIDEO TOGGLE ── */
function toggleVideo(id, btnId) {
  const vid = document.getElementById(id);
  const btn = document.getElementById(btnId);
  if (!vid) return;
  const circle = btn ? btn.querySelector('.play-circle') : null;
  if (vid.paused) {
    vid.play();
    if (circle) circle.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    if (btn) btn.style.opacity = '.25';
  } else {
    vid.pause();
    if (circle) circle.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
    if (btn) btn.style.opacity = '1';
  }
}

/* ── LIGHTBOX ── */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
document.querySelectorAll('.work-item, .ai-art-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img) {
      lbImg.src = img.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });
});
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = 'auto';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── CONTACT FORM ── */
function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const span = btn.querySelector('span');
  btn.disabled = true; span.textContent = 'Sending...';
  setTimeout(() => {
    span.textContent = '✓ Sent! I\'ll reply soon.';
    btn.style.background = 'linear-gradient(135deg,#27ae60,#2ecc71)';
    document.getElementById('contactForm').reset();
    setTimeout(() => {
      span.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
    }, 3500);
  }, 1500);
}

/* ── ACTIVE NAV HIGHLIGHT ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? '#eeeeee' : '';
  });
}, { passive: true });

/* ── PARALLAX on hero portrait ── */
window.addEventListener('mousemove', e => {
  const portrait = document.getElementById('hero-portrait');
  if (!portrait) return;
  const xr = (e.clientX / window.innerWidth - 0.5) * 12;
  const yr = (e.clientY / window.innerHeight - 0.5) * 8;
  portrait.style.transform = `perspective(800px) rotateY(${xr}deg) rotateX(${-yr}deg)`;
}, { passive: true });

/* -- THEME TOGGLE -- */
(function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('ashique-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (btn) {
    btn.addEventListener('click', () => {
      const curr = html.getAttribute('data-theme');
      const next = curr === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('ashique-theme', next);
    });
  }
})();

/* -- PORTRAIT SWITCHER -- */
function switchAboutImg(thumbEl, src) {
  const main = document.getElementById('aboutImg');
  if (!main) return;
  main.style.opacity = '0';
  setTimeout(() => {
    main.src = src;
    main.style.opacity = '1';
  }, 250);
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}
document.getElementById('aboutImg') && (document.getElementById('aboutImg').style.transition = 'opacity .3s ease');

/* -----------------------------------------------
   BACKGROUND FLOW LINES + 3D ELEMENTS
   ----------------------------------------------- */

/* -- FULL PAGE FLOWING LINES CANVAS -- */
(function initFlowLines() {
  const canvas = document.createElement('canvas');
  canvas.id = 'flow-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.55;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Flowing sine streams
  const STREAMS = 7;
  const streams = [];
  for (let i = 0; i < STREAMS; i++) {
    streams.push({
      x: (W / (STREAMS + 1)) * (i + 1),
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
      amp: 30 + Math.random() * 50,
      freq: 0.004 + Math.random() * 0.004,
      color: i % 2 === 0
        ? `rgba(192,57,43,`
        : `rgba(212,114,10,`,
      dots: [],
      dotSpacing: 14 + Math.floor(Math.random() * 8),
    });
  }

  // Drop particles along each stream
  streams.forEach(s => {
    for (let y = 0; y < H + 100; y += s.dotSpacing) {
      s.dots.push({ y, alpha: Math.random() });
    }
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    streams.forEach(s => {
      // draw the flowing path
      ctx.beginPath();
      let first = true;
      for (let y = -20; y < H + 20; y += 3) {
        const x = s.x + Math.sin(y * s.freq + t + s.phase) * s.amp;
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.color + '0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // draw flowing dots along the path
      s.dots.forEach(d => {
        d.y += 0.6;
        if (d.y > H + 20) { d.y = -20; d.alpha = Math.random() * 0.5 + 0.1; }
        const x = s.x + Math.sin(d.y * s.freq + t + s.phase) * s.amp;
        const a = Math.sin(d.y * 0.012 + t * 2) * 0.3 + 0.35;
        ctx.beginPath();
        ctx.arc(x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color + (a * d.alpha).toFixed(2) + ')';
        ctx.fill();
      });
    });

    t += 0.012;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* -- 3D ROTATING ORBS / CUBE in Hero -- */
(function init3D() {
  // Inject the 3D element into hero
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Create the 3D scene container
  const scene = document.createElement('div');
  scene.className = 'hero-3d-scene';
  scene.innerHTML = `
    <div class="cube-wrap">
      <div class="cube">
        <div class="cube-face front"></div>
        <div class="cube-face back"></div>
        <div class="cube-face left"></div>
        <div class="cube-face right"></div>
        <div class="cube-face top"></div>
        <div class="cube-face bottom"></div>
      </div>
    </div>
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>
    <div class="ring-wrap">
      <div class="ring ring1"></div>
      <div class="ring ring2"></div>
    </div>
  `;
  hero.appendChild(scene);
})();

/* -- 3D TILT on Service Cards -- */
(function initTilt() {
  const cards = document.querySelectorAll('.service-card, .video-card, .whatsapp-qr-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx2 = rect.left + rect.width / 2;
      const cy2 = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy2) / (rect.height / 2)) * -10;
      const ry = ((e.clientX - cx2) / (rect.width  / 2)) *  10;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
      card.style.transition = 'transform .05s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s var(--ease-expo, cubic-bezier(0.19,1,0.22,1))';
    });
  });
})();

/* -- VIDEO LIGHTBOX -- */
function openVideoLightbox(src) {
  const lb = document.getElementById('video-lightbox');
  const vid = document.getElementById('vlb-video');
  const source = document.getElementById('vlb-source');
  source.src = src;
  vid.load();
  vid.play();
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeVideoLightbox() {
  const lb = document.getElementById('video-lightbox');
  const vid = document.getElementById('vlb-video');
  vid.pause();
  vid.currentTime = 0;
  lb.classList.remove('active');
  document.body.style.overflow = 'auto';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeVideoLightbox(); closeLightbox(); }
});

/* ------------------------------------------------------
   ASH � MASCOT CHARACTER ENGINE
   A mini 3D Ashique that jumps top?bottom of page,
   chats with visitors, falls into a black hole, respawns.
   ------------------------------------------------------ */
(function initAsh() {

  /* -- speeches per section/state -- */
  const SPEECHES = {
    hero:    ["Yo! That's me up there ??", "Welcome to my world ??", "Scroll down, it gets better fr fr"],
    story:   ["This is my origin story lol", "English Lit grad doing design?? Big W ??", "I overthink everything. That's my superpower."],
    service: ["Pick any service, I got you ??", "AI video? Yeah I literally do that ??", "I don't just design. I cook. You saw the footer ??"],
    work:    ["That InLine Times poster? All me ??", "Every pixel placed with intention fr", "Tap any poster for a closer look ??"],
    video:   ["Press play! Don't be shy ??", "These edits go hard ngl", "Best viewed with headphones ??"],
    ai:      ["AI + creativity = unstoppable ??", "While you sleep, I generate ??", "The future is NOW and I'm already in it"],
    contact: ["DM me, don't be shy ??", "I reply fast. Faster than your upload speed ??", "Let's cook something people stop and stare at ??"],
    idle:    ["Still reading? I respect that ??", "This site took blood, sweat and coffee ?", "bro scroll slower, appreciate the design ??", "I see you lurking ??", "You good? Need anything?"],
    touch:   ["Hey! That tickles ??", "Oi! Hands to yourself ??", "Watch the fit!! ??", "OK OK I see you ??", "bro chill ??"],
  };

  /* -- DOM scaffold -- */
  const el = document.createElement('div');
  el.id = 'ash-mascot';
  el.innerHTML = `
    <div id="ash-body">
      <div id="ash-bubble" class="ash-bubble hidden"></div>
      <div id="ash-char"></div>
    </div>
    <div id="ash-blackhole"></div>
  `;
  document.body.appendChild(el);

  const body   = document.getElementById('ash-body');
  const char   = document.getElementById('ash-char');
  const bubble = document.getElementById('ash-bubble');
  const hole   = document.getElementById('ash-blackhole');

  /* -- state -- */
  let posY = -20;          // % of total page height (0=top, 100=bottom)
  let falling = false;
  let chatting = false;
  let chatTimer = null;
  let loopTimer = null;
  let bubbleTimer = null;

  /* -- section map -- */
  function getSectionAt(scrollPct) {
    if (scrollPct < 12)  return 'hero';
    if (scrollPct < 28)  return 'story';
    if (scrollPct < 45)  return 'service';
    if (scrollPct < 58)  return 'work';
    if (scrollPct < 72)  return 'video';
    if (scrollPct < 85)  return 'ai';
    return 'contact';
  }

  /* -- speech bubble -- */
  function say(text, duration) {
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.remove('hidden');
    bubble.classList.add('pop');
    setTimeout(() => bubble.classList.remove('pop'), 10);
    bubbleTimer = setTimeout(() => bubble.classList.add('hidden'), duration || 3200);
  }

  function sayRandom(pool) {
    say(pool[Math.floor(Math.random() * pool.length)]);
  }

  /* -- character pose -- */
  const POSES = { fall:'fall', wave:'wave', land:'land', hole:'hole', spawn:'spawn' };
  function setPose(p) {
    char.className = 'ash-pose-' + p;
  }

  /* -- animate fall loop -- */
  function doFall() {
    falling = true;
    setPose(POSES.fall);
    posY = -8;  // start just above viewport
    renderPos();

    const totalDoc = document.documentElement.scrollHeight;
    const speed = isMobile ? 0.045 : 0.032;  // % per frame
    let lastSection = '';
    let pauseAt = pickRandomPausePoint();

    function step() {
      if (!falling) return;
      posY += speed;

      const scrollPct = posY;
      const section = getSectionAt(scrollPct);

      // Section-change quip
      if (section !== lastSection) {
        lastSection = section;
        setTimeout(() => {
          if (!chatting) sayRandom(SPEECHES[section] || SPEECHES.idle);
        }, 600);
      }

      // Pause at random points to interact
      if (Math.abs(posY - pauseAt) < speed * 2 && !chatting) {
        chatting = true;
        setPose(POSES.wave);
        sayRandom(SPEECHES.idle);
        chatTimer = setTimeout(() => {
          chatting = false;
          setPose(POSES.fall);
          pauseAt = posY + 12 + Math.random() * 20;  // next pause
          loopTimer = requestAnimationFrame(step);
        }, 3000);
        return;
      }

      renderPos();

      if (posY >= 96) {
        // Reached bottom � fall into black hole
        triggerBlackHole();
        return;
      }

      loopTimer = requestAnimationFrame(step);
    }
    loopTimer = requestAnimationFrame(step);
  }

  function pickRandomPausePoint() {
    // Pause somewhere between 15% and 75%
    return 15 + Math.random() * 60;
  }

  /* -- render position on page -- */
  function renderPos() {
    const totalH = document.documentElement.scrollHeight;
    const px = totalH * (posY / 100);
    body.style.transform = `translateY(${px}px)`;
  }

  /* -- black hole sequence -- */
  function triggerBlackHole() {
    falling = false;
    setPose(POSES.hole);
    say("see ya on the other side... ??", 2500);
    body.classList.add('falling-into-hole');
    hole.classList.add('active');

    setTimeout(() => {
      body.classList.remove('falling-into-hole');
      body.classList.add('hidden');
      hole.classList.remove('active');
    }, 1400);

    setTimeout(() => {
      body.classList.remove('hidden');
      body.classList.add('spawning');
      setPose(POSES.spawn);
      posY = -8;
      renderPos();
      say("RESPAWN! Back at it ??", 2000);
      setTimeout(() => {
        body.classList.remove('spawning');
        doFall();
      }, 1200);
    }, 3800);
  }

  /* -- user touch/click interaction -- */
  body.addEventListener('click', (e) => {
    e.stopPropagation();
    if (chatting) return;
    chatting = true;
    cancelAnimationFrame(loopTimer);
    setPose(POSES.wave);
    sayRandom(SPEECHES.touch);
    setTimeout(() => {
      chatting = false;
      setPose(POSES.fall);
      if (falling) {
        loopTimer = requestAnimationFrame(function step() {
          if (!falling || chatting) return;
          posY += 0.032;
          renderPos();
          if (posY >= 96) { triggerBlackHole(); return; }
          loopTimer = requestAnimationFrame(step);
        });
      }
    }, 2800);
  });

  /* -- dismiss bubble on scroll stop -- */
  let scrollDebounce;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(() => {
      if (!chatting && !bubble.classList.contains('hidden')) {
        bubble.classList.add('hidden');
      }
    }, 4000);
  }, { passive: true });

  /* -- kick off after a short delay -- */
  setTimeout(() => {
    setPose(POSES.spawn);
    posY = -8;
    renderPos();
    body.classList.remove('hidden');
    say("Yo! I'm Ash ?? Your scroll buddy fr", 3000);
    setTimeout(doFall, 1600);
  }, 2400);

})();
