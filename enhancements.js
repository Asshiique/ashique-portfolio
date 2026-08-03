/* =============================================================
   ENHANCEMENTS JS
   1. Scroll Reveal (IntersectionObserver)
   2. CountUp Stats
   3. Work Lightbox
   4. Hero Portrait 3D Tilt
   5. Footer Letter Warp
   ============================================================= */

/* ─── Throttle helper ─── */
const throttle = (fn, ms) => {
  let t = 0;
  return (...a) => { const now = Date.now(); if (now-t > ms) { t=now; fn(...a); } };
};

/* =============================================================
   1. SCROLL REVEAL
   ============================================================= */
function initScrollReveal() {
  // Tag elements that should animate in
  const selectors = [
    // Section tags + headings
    '.section-tag', '.work-title-block', '.vid-title-block',
    '.ai-title-block', '.contact-title-block',
    // Chapter blocks
    '.chapter-block',
    // Cards
    '.service-card', '.video-card', '.work-item', '.testi-card',
    // Story elements
    '.story-cta', '.ps-strip', '.es-label',
    // Contact
    '.contact-line', '.whatsapp-qr-card',
    // Stats
    '.h-stat',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.classList.contains('reveal') || el.classList.contains('reveal-group')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
    });
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => obs.observe(el));
}

/* =============================================================
   2. COUNT-UP STATS
   ============================================================= */
function countUp(el, target, duration = 1600, suffix = '') {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCountUp() {
  const stats = document.querySelectorAll('.h-stat-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // Parse number and suffix from text content (e.g. "50+" → 50, "+")
      const raw = el.textContent.trim();
      const num = parseInt(raw.replace(/\D/g, ''), 10);
      const suffix = raw.replace(/\d/g, '');
      if (!isNaN(num)) {
        // Keep the <em> suffix element if present, update just the text node
        const em = el.querySelector('em');
        const textNode = [...el.childNodes].find(n => n.nodeType === 3);
        if (textNode) {
          const startVal = { v: 0 };
          const start = performance.now();
          const duration = 1800;
          const update = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            textNode.textContent = Math.floor(eased * num);
            if (p < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => obs.observe(el));
}

/* =============================================================
   3. WORK LIGHTBOX
   ============================================================= */
function initLightbox() {
  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.id = 'lightboxOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lightbox-inner" id="lightboxInner">
      <button class="lightbox-close" id="lbClose" aria-label="Close">✕</button>
      <div class="lightbox-img-wrap">
        <img id="lbImg" src="" alt="" />
      </div>
      <div class="lightbox-info">
        <p class="lb-cat" id="lbCat"></p>
        <h2 class="lb-title" id="lbTitle"></h2>
        <p class="lb-desc" id="lbDesc"></p>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const lbImg   = document.getElementById('lbImg');
  const lbCat   = document.getElementById('lbCat');
  const lbTitle = document.getElementById('lbTitle');
  const lbDesc  = document.getElementById('lbDesc');

  function openLightbox(item) {
    const img    = item.querySelector('img');
    const cat    = item.querySelector('.work-cat')?.textContent  || '';
    const title  = item.querySelector('h4')?.textContent          || '';
    const desc   = item.querySelector('p')?.textContent           || '';
    lbImg.src    = img?.src || '';
    lbImg.alt    = img?.alt || title;
    lbCat.textContent   = cat;
    lbTitle.textContent = title;
    lbDesc.textContent  = desc;
    overlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('lb-open');
    document.body.style.overflow = '';
  }

  // Attach to work items
  document.querySelectorAll('.work-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

/* =============================================================
   4. HERO PORTRAIT 3D TILT
   ============================================================= */
function initHeroTilt() {
  const wrap = document.querySelector('.hero-portrait-wrap');
  if (!wrap) return;

  const onMove = throttle((e) => {
    const r = wrap.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) / (r.width  / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (r.height / 2);
    const maxTilt = 12;
    wrap.style.transform =
      `perspective(900px) rotateY(${dx * maxTilt}deg) rotateX(${-dy * maxTilt}deg) scale(1.02)`;
  }, 16);

  const onLeave = () => {
    wrap.style.transform = '';
  };

  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);
}

/* =============================================================
   5. FOOTER LETTER-BY-LETTER WARP on "LET'S TALK"
   ============================================================= */
function initFooterWarp() {
  const el = document.querySelector('.footer-big-text');
  if (!el) return;

  const text = el.textContent.trim();
  // Wrap each character in a span
  el.innerHTML = text.split('').map((ch, i) =>
    ch === ' '
      ? ' '
      : `<span class="fw-ch" style="display:inline-block;transition:transform 0.15s ${i*0.02}s ease,color 0.2s ease">${ch}</span>`
  ).join('');

  const chars = el.querySelectorAll('.fw-ch');

  el.addEventListener('mouseenter', () => {
    chars.forEach((ch, i) => {
      const ry = (Math.random() - 0.5) * 24;
      const tx = (Math.random() - 0.5) * 8;
      const ty = (Math.random() - 0.5) * 16;
      ch.style.transform = `rotate(${ry}deg) translate(${tx}px,${ty}px)`;
      ch.style.color = Math.random() > 0.6 ? 'var(--clr-red2)' : '';
    });
  });

  el.addEventListener('mouseleave', () => {
    chars.forEach(ch => {
      ch.style.transform = '';
      ch.style.color = '';
    });
  });
}

/* =============================================================
   BOOT
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Small delay so page renders first
  requestAnimationFrame(() => {
    // initScrollReveal(); // replaced by animations.js data-motion system
    initCountUp();
    initLightbox();
    initHeroTilt();
    initFooterWarp();
  });
});

/* =============================================================
   6. MAGNETIC CUSTOM CURSOR
   ============================================================= */
function initMagCursor() {
  // Only on desktop (pointer: fine)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'mag-cursor-dot';
  ring.className = 'mag-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('custom-cursor-active');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  // Dot follows cursor exactly
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with smooth lag
  (function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover state on interactive elements
  const hoverEls = 'a, button, .work-item, .filter-btn, .service-card, .video-card, .testi-card, .btn-primary, .btn-ghost, .btn-outline-red, label, input, textarea, [role="button"]';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    });
  });

  // Magnetic button effect — buttons attract cursor slightly
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-outline-red, .filter-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* =============================================================
   7. BACK TO TOP
   ============================================================= */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('btt-show', window.scrollY > 500);
  };
  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================================
   8. NOISE GRAIN OVERLAY
   ============================================================= */
function initGrain() {
  const el = document.createElement('div');
  el.className = 'noise-overlay';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
}

/* =============================================================
   BOOT — add new inits
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    initMagCursor();
    initBackToTop();
    initGrain();
  });
});
/* =============================================================
   PRELOADER — simple 1.5s timeout, no resource-load dependency
   ============================================================= */
(function() {
  const pl = document.getElementById('preloader');
  if (!pl) return;

  document.body.classList.add('pl-loading');

  setTimeout(function() {
    pl.classList.add('pl-done');
    document.body.classList.remove('pl-loading');
    setTimeout(function() { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 700);
  }, 1500);
})();