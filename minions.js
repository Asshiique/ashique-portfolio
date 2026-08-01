/* =============================================================
   MINION SYSTEM — Interactive 3D Minion Characters
   Behaviors: Sit on button | Lean on heading | Peek from card | Climb menu
   ============================================================= */

const MINION_JAMES  = 'assets/models/minion_james.glb';
const MINION_PACK   = 'assets/models/minion_james.glb'; // full pack too large for CDN; use james for all

/* ─── Helpers ─── */
const isMobile = () => window.innerWidth < 768;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Wait for model-viewer web component to register ─── */
function waitMV(cb) {
  if (customElements.get('model-viewer')) { cb(); return; }
  customElements.whenDefined('model-viewer').then(cb);
}

/* ─── Create a model-viewer element programmatically ─── */
function makeMV({ src, id, cls = '', cameraOrbit = '0deg 80deg 2.5m', extraAttrs = {} }) {
  const mv = document.createElement('model-viewer');
  mv.src = src;
  mv.alt = 'Minion character';
  mv.id = id;
  mv.className = 'minion-mv ' + cls;
  mv.setAttribute('shadow-intensity', '0.4');
  mv.setAttribute('camera-orbit', cameraOrbit);
  mv.setAttribute('interaction-prompt', 'none');
  mv.setAttribute('disable-zoom', '');
  mv.setAttribute('disable-pan', '');
  mv.setAttribute('disable-tap', '');
  mv.setAttribute('loading', 'lazy');
  mv.setAttribute('reveal', 'manual');
  Object.entries(extraAttrs).forEach(([k, v]) => mv.setAttribute(k, v));
  return mv;
}

/* =============================================================
   1. BUTTON SITTER — Minion sits on "My Story" button
   ============================================================= */
function initBtnSitter() {
  const btn = document.getElementById('see-work-btn');
  if (!btn) return;

  const wrap = document.createElement('div');
  wrap.className = 'minion-btn-sitter-wrap';
  wrap.id = 'minionBtnWrap';

  const mv = makeMV({
    src: MINION_PACK,
    id: 'minionBtnSitter',
    cls: 'minion-sitter',
    cameraOrbit: '15deg 70deg 2.2m',
    extraAttrs: {
      'animation-name': 'Animation',
      'autoplay': '',
    }
  });

  // Shadow disc under minion
  const shadow = document.createElement('div');
  shadow.className = 'minion-shadow';

  wrap.appendChild(mv);
  wrap.appendChild(shadow);

  // Position wrap relative to the hero-actions container
  const heroActions = btn.closest('.hero-actions');
  if (heroActions) {
    heroActions.style.position = 'relative';
    heroActions.appendChild(wrap);
  }

  // Reveal after short delay so it doesn't block FCP
  setTimeout(() => {
    mv.setAttribute('reveal', 'auto');
    // Play animation once loaded
    mv.addEventListener('load', () => {
      if (mv.availableAnimations && mv.availableAnimations.length) {
        mv.animationName = mv.availableAnimations[0];
        mv.play();
      }
    }, { once: true });
    wrap.classList.add('minion-visible');
  }, 2500);

  // Minion waves when you hover the button
  btn.addEventListener('mouseenter', () => {
    wrap.classList.add('minion-wave');
    setTimeout(() => wrap.classList.remove('minion-wave'), 700);
  });
}

/* =============================================================
   2. SECTION LEAN — Minion leans against section headings
   ============================================================= */
function initSectionLean() {
  const targets = [
    { selector: '#ai .ai-title-block',    side: 'right', id: 'minionLeanAI'    },
    { selector: '#videos .vid-title-block', side: 'left', id: 'minionLeanVid'  },
  ];

  targets.forEach(({ selector, side, id }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const wrap = document.createElement('div');
    wrap.className = `minion-lean-wrap minion-lean-${side}`;
    wrap.id = id;

    const mv = makeMV({
      src: MINION_JAMES,
      id: id + 'MV',
      cls: 'minion-leaner',
      cameraOrbit: side === 'right' ? '-20deg 85deg 2m' : '20deg 85deg 2m',
    });

    wrap.appendChild(mv);

    // Insert next to the heading block
    el.style.position = 'relative';
    el.appendChild(wrap);

    // Trigger reveal when heading enters viewport
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        mv.setAttribute('reveal', 'auto');
        wrap.classList.add('minion-visible');
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
  });
}

/* =============================================================
   3. CARD PEEK — Minion peeks from behind cards on hover/tap
   ============================================================= */
function initCardPeek() {
  // Only add to a few cards to avoid too many heavy models
  const peekCards = [
    document.querySelector('.video-card'),
    document.querySelector('.service-card'),
    document.querySelector('.chapter-block'),
  ].filter(Boolean).slice(0, 2); // max 2 peeks

  peekCards.forEach((card, i) => {
    card.style.position = 'relative';
    card.style.overflow = 'visible';

    const wrap = document.createElement('div');
    wrap.className = 'minion-peek-wrap';
    wrap.id = 'minionPeek' + i;

    const mv = makeMV({
      src: MINION_JAMES,
      id: 'minionPeekMV' + i,
      cls: 'minion-peeker',
      cameraOrbit: '0deg 20deg 1.8m', // looking up from below card edge
    });
    wrap.appendChild(mv);
    card.appendChild(wrap);

    // Reveal model lazily
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        mv.setAttribute('reveal', 'auto');
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(card);

    // Peek on hover (desktop) or tap (mobile)
    const showPeek = () => wrap.classList.add('minion-peeking');
    const hidePeek = () => wrap.classList.remove('minion-peeking');

    if (!isMobile()) {
      card.addEventListener('mouseenter', showPeek);
      card.addEventListener('mouseleave', hidePeek);
    } else {
      card.addEventListener('touchstart', () => {
        if (wrap.classList.contains('minion-peeking')) {
          hidePeek();
        } else {
          showPeek();
          setTimeout(hidePeek, 2000);
        }
      }, { passive: true });
    }
  });
}

/* =============================================================
   4. MOBILE MENU CLIMBER — Minion climbs up when menu opens
   ============================================================= */
function initMenuClimber() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;

  const wrap = document.createElement('div');
  wrap.className = 'minion-climb-wrap';
  wrap.id = 'minionClimber';

  const mv = makeMV({
    src: MINION_JAMES,
    id: 'minionClimberMV',
    cls: 'minion-climber',
    cameraOrbit: '0deg 90deg 2m',
  });
  wrap.appendChild(mv);
  menu.appendChild(wrap);

  // Watch for menu open (class toggle or aria-hidden change)
  const observer = new MutationObserver(() => {
    const isOpen = menu.classList.contains('open') ||
                   menu.style.display === 'flex' ||
                   menu.style.transform === 'translateX(0)' ||
                   menu.getAttribute('aria-hidden') === 'false' ||
                   menu.style.opacity === '1';

    if (isOpen) {
      mv.setAttribute('reveal', 'auto');
      wrap.classList.add('minion-climbing');
      setTimeout(() => wrap.classList.add('minion-climb-done'), 1200);
    } else {
      wrap.classList.remove('minion-climbing', 'minion-climb-done');
    }
  });

  observer.observe(menu, {
    attributes: true,
    attributeFilter: ['class', 'style', 'aria-hidden']
  });
}

/* =============================================================
   BOOT
   ============================================================= */
function bootMinions() {
  if (prefersReduced()) return; // respect accessibility

  waitMV(() => {
    initBtnSitter();

    // Lean + peek: defer slightly so page renders first
    setTimeout(() => {
      initSectionLean();
      initCardPeek();
    }, 1000);

    // Menu climber: only on mobile
    if (isMobile()) {
      initMenuClimber();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMinions);
} else {
  bootMinions();
}
