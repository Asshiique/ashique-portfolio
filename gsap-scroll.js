/**
 * gsap-scroll.js — CLEAN SINGLE ANIMATION ENGINE
 * All scroll-driven animations live here. No conflicts.
 */

(function () {
  if (typeof gsap === 'undefined') { console.warn('GSAP not loaded'); return; }
  if (typeof ScrollTrigger === 'undefined') { console.warn('ScrollTrigger not loaded'); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis + GSAP ticker sync (single RAF, no double-speed) ── */
  function syncLenis() {
    const lenis = window._lenis;
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Wait for preloader to clear before running any GSAP ── */
  const PRELOADER_MS = 1600;

  function initAll() {
    syncLenis();

    /* ════════════════════════════════════════════════
       HERO — content drifts up as user scrolls away
       ════════════════════════════════════════════════ */
    gsap.to('.hero-content', {
      y: -80, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '70% top', scrub: 1.2 }
    });

    gsap.to('.hero-portrait-wrap', {
      y: -140, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* ════════════════════════════════════════════════
       SECTION TAGS — slide from left
       ════════════════════════════════════════════════ */
    gsap.utils.toArray('.section-tag').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 68%', scrub: 0.5 }
        }
      );
    });

    /* ════════════════════════════════════════════════
       CHAPTER BLOCKS — 3D flip entrance
       ════════════════════════════════════════════════ */
    gsap.utils.toArray('.chapter-block').forEach((block) => {
      gsap.fromTo(block,
        { opacity: 0, y: 80, rotationX: 18, transformPerspective: 900, transformOrigin: 'center bottom' },
        { opacity: 1, y: 0, rotationX: 0, ease: 'expo.out',
          scrollTrigger: { trigger: block, start: 'top 88%', end: 'top 50%', scrub: 0.9 }
        }
      );
    });

    /* ════════════════════════════════════════════════
       SERVICE CARDS — stagger cascade
       ════════════════════════════════════════════════ */
    gsap.fromTo(gsap.utils.toArray('.service-card'),
      { opacity: 0, y: 60, scale: 0.93 },
      { opacity: 1, y: 0, scale: 1, ease: 'expo.out',
        stagger: { amount: 0.5 },
        scrollTrigger: { trigger: '#services', start: 'top 72%', end: 'center 40%', scrub: 0.7 }
      }
    );

    /* ════════════════════════════════════════════════
       WORK ITEMS — alternate left/right
       ════════════════════════════════════════════════ */
    gsap.utils.toArray('.work-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50, scale: 0.94 },
        { opacity: 1, x: 0, scale: 1, ease: 'expo.out',
          scrollTrigger: { trigger: item, start: 'top 90%', end: 'top 60%', scrub: 0.7 }
        }
      );
    });

    /* ════════════════════════════════════════════════
       SECTION HEADINGS — clip-path wipe
       ════════════════════════════════════════════════ */
    ['.work-title-block', '.vid-title-block', '.cook-headline', '.ai-title-block'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', ease: 'expo.inOut',
          scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 48%', scrub: 1 }
        }
      );
    });

    /* ════════════════════════════════════════════════
       VIDEO CARDS — stagger float up
       ════════════════════════════════════════════════ */
    gsap.fromTo(gsap.utils.toArray('.video-card'),
      { opacity: 0, y: 70 },
      { opacity: 1, y: 0, ease: 'expo.out',
        stagger: { amount: 0.6 },
        scrollTrigger: { trigger: '#videos', start: 'top 72%', end: 'center 32%', scrub: 0.8 }
      }
    );

    /* ════════════════════════════════════════════════
       STATS — count up tied to scroll
       ════════════════════════════════════════════════ */
    gsap.utils.toArray('.h-stat-num').forEach(el => {
      const raw = el.textContent.trim();
      const target = parseInt(raw.replace(/\D/g, ''), 10);
      if (isNaN(target)) return;
      const textNode = [...el.childNodes].find(n => n.nodeType === 3);
      if (!textNode) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, ease: 'none',
        onUpdate() { textNode.textContent = Math.round(obj.val); },
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 55%', scrub: 1 }
      });
    });

    /* ════════════════════════════════════════════════
       STORY INTRO + CONTACT — fade in
       ════════════════════════════════════════════════ */
    gsap.fromTo('.story-intro',
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, ease: 'expo.out',
        scrollTrigger: { trigger: '.story-intro', start: 'top 85%', end: 'top 55%', scrub: 0.8 }
      }
    );

    gsap.fromTo('.contact-title-block',
      { opacity: 0, y: 70, skewY: 3 },
      { opacity: 1, y: 0, skewY: 0, ease: 'expo.out',
        scrollTrigger: { trigger: '#contact', start: 'top 78%', end: 'top 45%', scrub: 0.9 }
      }
    );

    gsap.fromTo('.contact-right',
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, ease: 'expo.out',
        scrollTrigger: { trigger: '#contact', start: 'top 78%', end: 'top 45%', scrub: 0.9 }
      }
    );

    /* ════════════════════════════════════════════════
       FOOTER — scale in
       ════════════════════════════════════════════════ */
    gsap.fromTo('.footer-big-text',
      { opacity: 0, scale: 0.65, y: 50 },
      { opacity: 1, scale: 1, y: 0, ease: 'expo.out',
        scrollTrigger: { trigger: '.footer-big-text', start: 'top 92%', end: 'top 52%', scrub: 1 }
      }
    );

    /* ════════════════════════════════════════════════
       TOOLS TICKER + PS STRIP
       ════════════════════════════════════════════════ */
    const ticker = document.querySelector('.tools-ticker-section');
    if (ticker) {
      gsap.fromTo(ticker,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'expo.out',
          scrollTrigger: { trigger: ticker, start: 'top 90%', end: 'top 68%', scrub: 0.6 }
        }
      );
    }

    const ps = document.querySelector('.ps-strip');
    if (ps) {
      gsap.fromTo(ps,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: 'expo.out',
          scrollTrigger: { trigger: ps, start: 'top 90%', end: 'top 70%', scrub: 0.5 }
        }
      );
    }

    /* ════════════════════════════════════════════════
       AI SECTION
       ════════════════════════════════════════════════ */
    const aiBox = document.querySelector('.ai3d-box-wrap, .spidey-section');
    if (aiBox) {
      gsap.fromTo(aiBox,
        { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'expo.out',
          scrollTrigger: { trigger: aiBox, start: 'top 85%', end: 'top 50%', scrub: 1 }
        }
      );
    }

    ScrollTrigger.refresh();
  }

  /* Run after preloader clears */
  setTimeout(initAll, PRELOADER_MS);

})();
