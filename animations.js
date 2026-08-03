/* ═══════════════════════════════════════════════════════════════════
   MOTION UI — Complete Animation System JS
   ═══════════════════════════════════════════════════════════════════ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────────────
   1. SCROLL PROGRESS BAR
   ───────────────────────────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────────────
   2. TAG SECTIONS WITH data-motion ATTRIBUTES
   ───────────────────────────────────────────────────────────────────── */
function tagMotionElements() {
  const rules = [
    // Section tags — pop
    { sel: '.section-tag',                      motion: 'pop' },
    // Big headings — wipe
    { sel: '.work-title-block, .vid-title-block, .testimonials-heading', motion: 'wipe' },
    // Story chapters — 3D flip
    { sel: '.chapter-block',                    motion: 'flip-in' },
    // Service cards — scale up
    { sel: '.service-card',                     motion: 'scale-up' },
    // Work items — scale up
    { sel: '.work-item',                        motion: 'scale-up' },
    // Video cards — fade up
    { sel: '.video-card',                       motion: 'fade-up' },
    // Story elements — fade left
    { sel: '.story-intro',                      motion: 'fade-left' },
    // Work showcase — fade right
    { sel: '.work-showcase-card',               motion: 'fade-right' },
    // Contact title lines — fade left
    { sel: '.ctb-line1, .ctb-line2, .ctb-line3, .ctb-line4', motion: 'fade-left' },
    // Contact right — fade right
    { sel: '.contact-right',                    motion: 'fade-right' },
    // AI box — blur in
    { sel: '.ai3d-box-wrap, .spidey-section',   motion: 'blur-in' },
    // Tools ticker — fade up
    { sel: '.tools-ticker-section',             motion: 'fade-up' },
    // Footer cook section — fade up
    { sel: '.cook-section',                     motion: 'fade-up' },
    // PS strip — pop
    { sel: '.ps-strip',                         motion: 'pop' },
    // Work filter tabs — fade up
    { sel: '.filter-tabs',                      motion: 'fade-up' },
  ];

  rules.forEach(({ sel, motion }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.dataset.motion) return; // already tagged
      el.dataset.motion = motion;
      // Stagger siblings
      const delays = [0, 100, 200, 300, 400, 500];
      if (i > 0) el.dataset.delay = delays[Math.min(i, delays.length - 1)];
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────
   3. INTERSECTION OBSERVER — trigger motion-in class
   ───────────────────────────────────────────────────────────────────── */
function initMotionObserver() {
  if (reduced) {
    document.querySelectorAll('[data-motion]').forEach(el => el.classList.add('motion-in'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('motion-in');
        obs.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  document.querySelectorAll('[data-motion]').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────────────────────────
   4. HERO ENTRANCE SEQUENCE (fires after preloader ~1.5s)
   ───────────────────────────────────────────────────────────────────── */
function initHeroEntrance() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Fire after preloader animation ends
  const delay = reduced ? 0 : 1550;
  setTimeout(() => {
    document.body.classList.add('hero-animate');
  }, delay);
}

/* ─────────────────────────────────────────────────────────────────────
   5. BUTTON RIPPLE
   ───────────────────────────────────────────────────────────────────── */
function initRipple() {
  const btns = document.querySelectorAll(
    '.btn-primary, .btn-ghost, .btn-outline-red, .filter-btn, .hire-me-btn, #backToTop'
  );
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const x = e.clientX - r.left - size / 2;
      const y = e.clientY - r.top  - size / 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      btn.appendChild(wave);
      setTimeout(() => wave.remove(), 700);
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────
   6. CARD 3D TILT — service cards, work items
   ───────────────────────────────────────────────────────────────────── */
function initCardTilt() {
  if (reduced) return;
  const tiltEls = document.querySelectorAll('.service-card, .testi-card');
  const MAX = 10;

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5; // -0.5 to 0.5
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform =
        `perspective(800px) rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────
   7. PARALLAX — hero bg word + portrait on scroll
   ───────────────────────────────────────────────────────────────────── */
function initParallax() {
  if (reduced) return;
  const bgWord   = document.querySelector('.hero-bg-word');
  const portrait = document.querySelector('.hero-portrait-wrap');

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (bgWord)   bgWord.style.transform   = `translateY(${sy * 0.3}px)`;
    if (portrait) portrait.style.transform = `translateX(0) translateY(${sy * 0.15}px) scale(1)`;
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────────────
   8. SPLIT TEXT ANIMATE — apply to big headings on scroll
   ───────────────────────────────────────────────────────────────────── */
function initTextSplit() {
  if (reduced) return;

  // Targets for character-level split
  const targets = [
    '.cook-text-col .cook-giant',
    '.footer-big-text',
  ].join(',');

  document.querySelectorAll(targets).forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = 'done';
    const text = el.textContent;
    el.innerHTML = [...text].map((ch, i) =>
      ch === ' '
        ? ' '
        : `<span class="split-char" style="transition-delay:${i * 0.035}s">${ch}</span>`
    ).join('');

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('.split-char').forEach(c => c.classList.add('char-in'));
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
  });
}

/* ─────────────────────────────────────────────────────────────────────
   9. SECTION HEADING SLIDE-IN (for specific section title blocks)
   ───────────────────────────────────────────────────────────────────── */
function initSectionHeadings() {
  if (reduced) return;

  // ai-title-block, contact-title-block already handled by data-motion
  // Add word-by-word reveal to work title
  const workTitle = document.querySelector('.work-title-block');
  if (workTitle && !workTitle.dataset.wordSplit) {
    workTitle.dataset.wordSplit = 'done';
    [...workTitle.children].forEach((span, i) => {
      span.style.display      = 'block';
      span.style.opacity      = '0';
      span.style.transform    = 'translateY(50px)';
      span.style.transition   = `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s,
                                  transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`;

      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          span.style.opacity   = '1';
          span.style.transform = 'none';
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      obs.observe(span);
    });
  }
}

/* ─────────────────────────────────────────────────────────────────────
   10. SCROLL-LINKED SECTION FADE — sections get slight opacity push
   ───────────────────────────────────────────────────────────────────── */
function initSectionParallax() {
  if (reduced) return;
  const sections = document.querySelectorAll('section');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      // Add a class that the CSS uses to trigger border/glow
      e.target.classList.toggle('section-active', e.isIntersecting);
    });
  }, { threshold: 0.25 });

  sections.forEach(s => obs.observe(s));
}

/* ─────────────────────────────────────────────────────────────────────
   BOOT
   ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initHeroEntrance();
  initRipple();

  requestAnimationFrame(() => {
    tagMotionElements();
    initMotionObserver();
    initCardTilt();
    initParallax();
    initTextSplit();
    initSectionHeadings();
    initSectionParallax();
  });
});

/* ─────────────────────────────────────────────────────────────────────
   CHAPTER BLOCKS — split headlines + IntersectionObserver trigger
   ───────────────────────────────────────────────────────────────────── */
function initChapterBlocks() {
  const blocks = document.querySelectorAll('.chapter-block');
  if (!blocks.length) return;

  // Split each headline into word spans
  blocks.forEach(block => {
    const headline = block.querySelector('.ch-headline');
    if (headline && !headline.dataset.split) {
      headline.dataset.split = 'done';
      // Keep <em> tags intact while splitting text nodes
      const rawHTML  = headline.innerHTML;
      const wrapped  = rawHTML
        .replace(/([A-Za-zÀ-ÿ']+)/g, '<span class="ch-headline-word">$1</span>');
      headline.innerHTML = wrapped;
    }
  });

  // IntersectionObserver — add .ch-visible when block enters viewport
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('ch-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  blocks.forEach(b => obs.observe(b));
}

/* ─────────────────────────────────────────────────────────────────────
   SERVICE CARDS — click/tap navigates to #work section
   ───────────────────────────────────────────────────────────────────── */
function initServiceCardNav() {
  const cards = document.querySelectorAll('.service-card');
  const workSection = document.getElementById('work');
  if (!workSection) return;

  cards.forEach(card => {
    // Make keyboard-accessible
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View my work');
    card.style.cursor = 'pointer';

    const go = () => {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    card.addEventListener('click', go);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────
   ADD TO BOOT
   ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initChapterBlocks();
  initServiceCardNav();
});