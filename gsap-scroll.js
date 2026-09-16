/**
 * GSAP SCROLL TRIGGER SYSTEM
 * Lusion-level scroll-driven animations
 * Requires: GSAP + ScrollTrigger CDN
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[gsap-scroll] GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Sync with Lenis ── */
  if (window._lenis) {
    window._lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { window._lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── 1. HERO — text scrub out as user scrolls ── */
  gsap.to('.hero-content', {
    y: -60,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '60% top',
      scrub: 1.5
    }
  });

  /* ── 2. HERO PORTRAIT — parallax faster than scroll ── */
  gsap.to('.hero-portrait-wrap', {
    y: -120,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  /* ── 3. STORY — chapter blocks scrub in one by one ── */
  const chapters = gsap.utils.toArray('.chapter-block');
  chapters.forEach((block, i) => {
    /* Entrance: 3D flip from below */
    gsap.fromTo(block,
      {
        autoAlpha: 0,
        y: 80,
        rotationX: 20,
        transformPerspective: 900,
        transformOrigin: 'center bottom'
      },
      {
        autoAlpha: 1,
        y: 0,
        rotationX: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 85%',
          end: 'top 45%',
          scrub: 0.8,
          toggleActions: 'play none none reverse'
        }
      }
    );

    /* Side accent line draw */
    gsap.fromTo(block.querySelector?.('::before') || block,
      { '--ch-line-h': '0%' },
      {
        '--ch-line-h': '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true
        }
      }
    );
  });

  /* ── 4. SERVICES — cards cascade with stagger tied to scroll ── */
  const serviceCards = gsap.utils.toArray('.service-card');
  gsap.fromTo(serviceCards,
    { autoAlpha: 0, y: 60, scale: 0.92 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'expo.out',
      stagger: { amount: 0.5, from: 'start' },
      scrollTrigger: {
        trigger: '#services',
        start: 'top 70%',
        end: 'center 40%',
        scrub: 0.6
      }
    }
  );

  /* ── 5. WORK — items reveal with alternating direction ── */
  const workItems = gsap.utils.toArray('.work-item');
  workItems.forEach((item, i) => {
    const fromLeft = i % 2 === 0;
    gsap.fromTo(item,
      { autoAlpha: 0, x: fromLeft ? -50 : 50, scale: 0.94 },
      {
        autoAlpha: 1,
        x: 0,
        scale: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          end: 'top 55%',
          scrub: 0.7
        }
      }
    );
  });

  /* ── 6. SECTION HEADINGS — clip-path wipe scrub ── */
  const bigHeadings = gsap.utils.toArray([
    '.work-title-block',
    '.vid-title-block',
    '.cook-headline'
  ]);
  bigHeadings.forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'expo.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 45%',
          scrub: 1
        }
      }
    );
  });

  /* ── 7. VIDEO CARDS — stagger float up ── */
  const videoCards = gsap.utils.toArray('.video-card');
  gsap.fromTo(videoCards,
    { autoAlpha: 0, y: 70 },
    {
      autoAlpha: 1,
      y: 0,
      ease: 'expo.out',
      stagger: { amount: 0.6, from: 'start' },
      scrollTrigger: {
        trigger: '#videos',
        start: 'top 70%',
        end: 'center 30%',
        scrub: 0.8
      }
    }
  );

  /* ── 8. STAT NUMBERS — scrub-based count-up ── */
  const stats = gsap.utils.toArray('.h-stat-num');
  stats.forEach(el => {
    const raw    = el.textContent.trim();
    const target = parseInt(raw.replace(/\D/g, ''), 10);
    const suffix = raw.replace(/\d/g, '');
    const em     = el.querySelector('em');
    if (isNaN(target)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      ease: 'none',
      onUpdate() {
        const textNode = [...el.childNodes].find(n => n.nodeType === 3);
        if (textNode) textNode.textContent = Math.round(obj.val);
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 50%',
        scrub: 1
      }
    });
  });

  /* ── 9. CONTACT SECTION — dramatic entrance ── */
  gsap.fromTo('.contact-title-block',
    { autoAlpha: 0, y: 80, skewY: 4 },
    {
      autoAlpha: 1,
      y: 0,
      skewY: 0,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 75%',
        end: 'top 40%',
        scrub: 0.8
      }
    }
  );

  /* ── 10. FOOTER TEXT — giant scale-in ── */
  gsap.fromTo('.footer-big-text',
    { autoAlpha: 0, scale: 0.6, y: 60 },
    {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '.footer-big-text',
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1
      }
    }
  );

  /* ── 11. TOOLS TICKER — slide in from left ── */
  gsap.fromTo('.tools-ticker-section',
    { autoAlpha: 0, x: -60 },
    {
      autoAlpha: 1,
      x: 0,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '.tools-ticker-section',
        start: 'top 90%',
        end: 'top 65%',
        scrub: 0.6
      }
    }
  );

  /* ── 12. SECTION TAGS (- WHAT THEY SAY etc) — tiny pop ── */
  const tags = gsap.utils.toArray('.section-tag');
  tags.forEach(tag => {
    gsap.fromTo(tag,
      { autoAlpha: 0, x: -20 },
      {
        autoAlpha: 1,
        x: 0,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: tag,
          start: 'top 90%',
          end: 'top 70%',
          scrub: 0.5
        }
      }
    );
  });

  /* ── Refresh on load ── */
  window.addEventListener('load', () => ScrollTrigger.refresh());

})();
