/* =============================================================
   MINION SYSTEM v3 — position sitter via real button coordinates
   ============================================================= */

const isMobile  = () => window.innerWidth < 768;
const prefersRed = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =============================================================
   1. BUTTON SITTER — anchors to "My Story" button position
   ============================================================= */
function initBtnSitter() {
  const wrap = document.getElementById('minionBtnWrap');
  const btn  = document.getElementById('see-work-btn');
  if (!wrap || !btn) return;

  /* Read button position and snap minion just above it */
  function positionMinion() {
    const r = btn.getBoundingClientRect();
    const mw = isMobile() ? 60 : 75;   // wrapper width
    const mh = isMobile() ? 70 : 85;   // wrapper height

    // Sit just above the left edge of the button
    wrap.style.left   = (r.left + 8) + 'px';
    wrap.style.bottom = (window.innerHeight - r.top + 4) + 'px';
    wrap.style.width  = mw + 'px';
    wrap.style.height = mh + 'px';
  }

  positionMinion();
  window.addEventListener('resize', positionMinion);

  // Pop in after 2 s
  setTimeout(() => {
    wrap.classList.add('minion-visible');
  }, 2000);

  // Wave on button hover / tap
  const doWave = () => {
    wrap.classList.remove('minion-wave');
    void wrap.offsetWidth;
    wrap.classList.add('minion-wave');
    setTimeout(() => wrap.classList.remove('minion-wave'), 800);
  };
  btn.addEventListener('mouseenter', doWave);
  btn.addEventListener('touchstart', doWave, { passive: true });
}

/* =============================================================
   2. SECTION LEAN — appear beside section headings on scroll
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

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { wrap.classList.add('minion-visible'); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(el);
  });
}

/* =============================================================
   3. CARD PEEK — head pops up on hover / tap
   ============================================================= */
function initCardPeek() {
  const JAMES = 'assets/models/minion_james.glb';
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
        class="minion-mv"
        src="${JAMES}"
        alt="Minion peeking"
        camera-orbit="0deg 25deg 1.8m"
        shadow-intensity="0"
        interaction-prompt="none"
        disable-zoom disable-pan
      ></model-viewer>`;
    card.appendChild(wrap);

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(card);

    const show = () => wrap.classList.add('minion-peeking');
    const hide = () => wrap.classList.remove('minion-peeking');
    if (!isMobile()) {
      card.addEventListener('mouseenter', show);
      card.addEventListener('mouseleave', hide);
    } else {
      card.addEventListener('touchstart', () => {
        wrap.classList.toggle('minion-peeking');
        if (wrap.classList.contains('minion-peeking')) setTimeout(hide, 2000);
      }, { passive: true });
    }
  });
}

/* =============================================================
   4. MOBILE MENU CLIMBER
   ============================================================= */
function initMenuClimber() {
  const menu    = document.getElementById('mobileMenu');
  const climber = document.getElementById('minionClimber');
  if (!menu || !climber) return;

  const obs = new MutationObserver(() => {
    const isOpen = menu.classList.contains('open') ||
                   menu.style.display === 'flex'   ||
                   menu.style.opacity === '1'       ||
                   (menu.style.transform && !menu.style.transform.includes('100%'));

    if (isOpen) {
      climber.classList.remove('minion-climb-done');
      climber.classList.add('minion-climbing');
      setTimeout(() => climber.classList.add('minion-climb-done'), 1300);
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
  if (prefersRed()) return;

  // Wait for layout to settle before reading button coords
  requestAnimationFrame(() => {
    setTimeout(() => {
      initBtnSitter();
      initSectionLean();
      initCardPeek();
      if (isMobile()) initMenuClimber();
    }, 300);
  });
});
