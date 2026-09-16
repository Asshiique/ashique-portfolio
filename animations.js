/**
 * animations.js — CLEAN VERSION
 * Only handles: scroll progress, hero entrance, ripple, card tilt, nav active
 * GSAP (gsap-scroll.js) handles ALL scroll-triggered animations
 * Lenis is initialized here but RAF is driven by GSAP ticker (no conflict)
 */

/* ── Reduced motion check ── */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════
   1. LENIS SMOOTH SCROLL
   ══════════════════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
    touchMultiplier: 2
  });
  window._lenis = lenis;
  // RAF is driven by GSAP ticker in gsap-scroll.js — do NOT add raf loop here
}

/* ══════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════ */
function initScrollProgress() {
  let bar = document.getElementById('scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
  }
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   3. HERO ENTRANCE (after preloader, 1.55s delay)
   ══════════════════════════════════════════════════════ */
function initHeroEntrance() {
  const delay = reduced ? 0 : 1550;
  setTimeout(() => document.body.classList.add('hero-animate'), delay);
}

/* ══════════════════════════════════════════════════════
   4. BUTTON RIPPLE
   ══════════════════════════════════════════════════════ */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest(
      '.btn-primary, .btn-ghost, .btn-outline-red, .filter-btn, #backToTop, .hire-me-btn'
    );
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px`;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(wave);
    setTimeout(() => wave.remove(), 700);
  });
}

/* ══════════════════════════════════════════════════════
   5. SERVICE CARD 3D TILT (hover)
   ══════════════════════════════════════════════════════ */
function initCardTilt() {
  if (reduced) return;
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -14;
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ══════════════════════════════════════════════════════
   6. NAV: shrink on scroll + active section
   ══════════════════════════════════════════════════════ */
function initNav() {
  const navbar   = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('nav-scrolled', window.scrollY > 80);
  }, { passive: true });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('nav-active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('nav-active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════════════════════════════
   7. SERVICE CARDS → navigate to #work on click
   ══════════════════════════════════════════════════════ */
function initServiceCardNav() {
  const work = document.getElementById('work');
  if (!work) return;
  document.querySelectorAll('.service-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => work.scrollIntoView({ behavior: 'smooth' }));
  });
}

/* ══════════════════════════════════════════════════════
   8. MAGNETIC CUSTOM CURSOR (desktop only)
   ══════════════════════════════════════════════════════ */
function initMagCursor() {
  if (!window.matchMedia('(pointer:fine)').matches || reduced) return;
  const dot  = document.createElement('div'); dot.className  = 'mag-cursor-dot';
  const ring = document.createElement('div'); ring.className = 'mag-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('custom-cursor-active');

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a,button,.work-item,.service-card,.video-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('cursor-hover'); ring.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('cursor-hover'); ring.classList.remove('cursor-hover'); });
  });
}

/* ══════════════════════════════════════════════════════
   9. BACK TO TOP
   ══════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('btt-show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLenis();          // must be first — gsap-scroll.js picks up window._lenis
  initScrollProgress();
  initHeroEntrance();
  initRipple();
  initCardTilt();
  initNav();
  initServiceCardNav();
  initMagCursor();
  initBackToTop();
});