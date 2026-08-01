/* =============================================================
   MINION SYSTEM — Controls for 4 interactive Minion behaviors
   model-viewer elements are in HTML directly (no race conditions)
   ============================================================= */

const isMobile = () => window.innerWidth < 768;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =============================================================
   1. BUTTON SITTER — shows after 2s, bounces on hover
   ============================================================= */
function initBtnSitter() {
  const wrap = document.getElementById('minionBtnWrap');
  const btn  = document.getElementById('see-work-btn');
  if (!wrap || !btn) return;

  // Appear with a little pop after 2s delay
  setTimeout(() => {
    wrap.classList.add('minion-visible');
  }, 2000);

  // Jump/wave when My Story button is hovered or tapped
  const doWave = () => {
    wrap.classList.remove('minion-wave');
    void wrap.offsetWidth; // reflow to restart animation
    wrap.classList.add('minion-wave');
    setTimeout(() => wrap.classList.remove('minion-wave'), 800);
  };
  btn.addEventListener('mouseenter', doWave);
  btn.addEventListener('touchstart', doWave, { passive: true });
}

/* =============================================================
   2. SECTION LEAN — dynamically inserts leaners near headings
   ============================================================= */
function initSectionLean() {
  const JAMES = 'assets/models/minion_james.glb';
  const targets = [
    { selector: '#ai .ai-title-block',      side: 'right', id: 'minionLeanAI'  },
    { selector: '#videos .vid-title-block', side: 'left',  id: 'minionLeanVid' },
  ];

  targets.forEach(({ selector, side, id }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    // Build wrapper + model-viewer
    const wrap = document.createElement('div');
    wrap.className = `minion-lean-wrap minion-lean-${side}`;
    wrap.id = id;
    wrap.innerHTML = `
      <model-viewer
        id="${id}MV"
        class="minion-mv minion-leaner"
        src="${JAMES}"
        alt="Minion leaning"
        camera-orbit="${side === 'right' ? '-20deg 85deg 2m' : '20deg 85deg 2m'}"
        shadow-intensity="0.35"
        interaction-prompt="none"
        disable-zoom disable-pan
      ></model-viewer>`;

    el.style.position = 'relative';
    el.appendChild(wrap);

    // Reveal when section enters viewport
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        wrap.classList.add('minion-visible');
        obs.disconnect();
      }
    }, { threshold: 0.25 });
    obs.observe(el);
  });
}

/* =============================================================
   3. CARD PEEK — minion head peeks from behind cards
   ============================================================= */
function initCardPeek() {
  const JAMES = 'assets/models/minion_james.glb';
  // Pick the first video-card and first service-card
  const peekTargets = [
    document.querySelector('.video-card'),
    document.querySelector('.service-card'),
  ].filter(Boolean).slice(0, 2);

  peekTargets.forEach((card, i) => {
    card.style.position = 'relative';
    card.style.overflow = 'visible';

    const wrap = document.createElement('div');
    wrap.className = 'minion-peek-wrap';
    wrap.id = 'minionPeek' + i;
    wrap.innerHTML = `
      <model-viewer
        id="minionPeekMV${i}"
        class="minion-mv minion-peeker"
        src="${JAMES}"
        alt="Minion peeking"
        camera-orbit="0deg 25deg 1.8m"
        shadow-intensity="0"
        interaction-prompt="none"
        disable-zoom disable-pan
      ></model-viewer>`;
    card.appendChild(wrap);

    // Lazy load: reveal model only when card is near viewport
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        wrap.querySelector('model-viewer').setAttribute('reveal', 'auto');
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    obs.observe(card);

    // Peek on hover (desktop) / tap (mobile)
    const show = () => wrap.classList.add('minion-peeking');
    const hide = () => wrap.classList.remove('minion-peeking');

    if (!isMobile()) {
      card.addEventListener('mouseenter', show);
      card.addEventListener('mouseleave', hide);
    } else {
      card.addEventListener('touchstart', () => {
        wrap.classList.toggle('minion-peeking');
        if (wrap.classList.contains('minion-peeking')) {
          setTimeout(hide, 2000);
        }
      }, { passive: true });
    }
  });
}

/* =============================================================
   4. MOBILE MENU CLIMBER — climbs when menu opens
   ============================================================= */
function initMenuClimber() {
  const menu    = document.getElementById('mobileMenu');
  const climber = document.getElementById('minionClimber');
  if (!menu || !climber) return;

  // Watch for menu open via class changes
  const obs = new MutationObserver(() => {
    // Check common "open" patterns used by the site's script.js
    const isOpen = menu.classList.contains('open') ||
                   menu.style.display === 'flex'   ||
                   menu.style.opacity === '1'       ||
                   (menu.style.transform && !menu.style.transform.includes('100%'));

    if (isOpen) {
      climber.classList.remove('minion-climb-done');
      climber.classList.add('minion-climbing');
      setTimeout(() => climber.classList.add('minion-climb-done'), 1200);
    } else {
      climber.classList.remove('minion-climbing', 'minion-climb-done');
    }
  });

  obs.observe(menu, { attributes: true, attributeFilter: ['class', 'style'] });
}

/* =============================================================
   BOOT
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (prefersReduced()) return;

  initBtnSitter();

  // Defer heavier inits slightly
  setTimeout(() => {
    initSectionLean();
    initCardPeek();
    if (isMobile()) initMenuClimber();
  }, 800);
});
