/* ASHIQUE PORTFOLIO - Main JavaScript */

/* PERFORMANCE: mobile detection */
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
              || window.innerWidth < 768;
const isSlowConn = navigator.connection && ['slow-2g','2g'].includes(navigator.connection.effectiveType);

/* PRELOADER */
document.body.style.overflow = "hidden";
let preloaderDismissed = false;
const PRELOAD_DELAY = (isMobile || isSlowConn) ? 600 : 900;

function dismissPreloader() {
  if (preloaderDismissed) return;
  preloaderDismissed = true;
  try {
    const pl = document.getElementById("preloader");
    if (pl) pl.classList.add("hidden");
    document.body.style.overflow = "auto";
    initReveal();
    startTyper();
    if (!isMobile) animateSkillBars();
  } catch(e) {
    const pl = document.getElementById("preloader");
    if (pl) pl.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("DOMContentLoaded", function() { setTimeout(dismissPreloader, PRELOAD_DELAY); });
window.addEventListener("load", function() { setTimeout(dismissPreloader, 100); });
setTimeout(function() {
  const pl = document.getElementById("preloader");
  if (pl && !pl.classList.contains("hidden")) {
    pl.style.display = "none";
    document.body.style.overflow = "auto";
  }
}, 3000);

/* CURSOR */
const cursor = document.getElementById("cursor");
const follower = document.getElementById("cursor-follower");
let cx = 0, cy = 0, fx = 0, fy = 0;
if (cursor && follower) {
  document.addEventListener("mousemove", function(e) {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
  });
  (function animF() {
    fx += (cx - fx) * 0.1; fy += (cy - fy) * 0.1;
    follower.style.left = fx + "px"; follower.style.top = fy + "px";
    requestAnimationFrame(animF);
  })();
  document.querySelectorAll("a,button,.work-item,.service-card,.ai-art-item,.video-card,.filter-btn,.ai-vid-card").forEach(function(el) {
    el.addEventListener("mouseenter", function() { cursor.classList.add("hover"); follower.classList.add("hover"); });
    el.addEventListener("mouseleave", function() { cursor.classList.remove("hover"); follower.classList.remove("hover"); });
  });
}

/* NAVBAR */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", function() {
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

/* HAMBURGER */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", function() {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
}
function closeMobile() {
  if (hamburger) hamburger.classList.remove("open");
  if (mobileMenu) mobileMenu.classList.remove("open");
}

/* TYPED ROLE TEXT */
function startTyper() {
  const roles = ["Graphic Design", "Videography", "AI Videography", "Storytelling", "Creative Direction"];
  const el = document.getElementById("typed-role");
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

/* PARTICLES */
(function initParticles() {
  if (isSlowConn) return;
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H;
  const COLORS = ["192,57,43","230,126,34","192,57,43","200,80,40"];
  const particles = [];
  const COUNT = isMobile ? 20 : 65;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener("resize", resize, { passive: true });
  resize();
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
    particles.forEach(function(p) {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = "rgba("+p.c+","+p.alpha+")"; ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>W) p.dx*=-1;
      if(p.y<0||p.y>H) p.dy*=-1;
    });
    rafId = requestAnimationFrame(draw);
  }
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) cancelAnimationFrame(rafId); else draw();
  });
  draw();
})();

/* SCROLL REVEAL */
function initReveal() {
  const jsEls = document.querySelectorAll(
    ".service-card,.work-item,.video-card,.ai-vid-card,.ai-art-item,.contact-left,.contact-right,.ai-title-block,.vid-title-block,.svc-title-block,.work-title-block,.work-showcase-card"
  );
  jsEls.forEach(function(el, i) {
    el.classList.add("reveal");
    const mod = i % 3;
    if (mod === 1) el.classList.add("reveal-d1");
    if (mod === 2) el.classList.add("reveal-d2");
  });
  const allReveals = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  allReveals.forEach(function(el) { obs.observe(el); });
}

function animateSkillBars() {
  document.querySelectorAll(".skill-bar-fill").forEach(function(bar) {
    bar.style.width = (bar.dataset.pct || "80") + "%";
  });
}

/* GLITCH */
const glitchEl = document.getElementById("glitch-text");
if (glitchEl) {
  setInterval(function() {
    glitchEl.classList.add("glitching");
    setTimeout(function() { glitchEl.classList.remove("glitching"); }, 200);
  }, 4000);
}

/* ABOUT IMAGE SWITCHER */
function switchAboutImg(thumb, src) {
  const mainImg = document.getElementById("aboutImg");
  if (mainImg) mainImg.src = src;
  document.querySelectorAll(".thumb-img").forEach(function(t) { t.classList.remove("active"); });
  thumb.classList.add("active");
}

/* VIDEO TOGGLE */
function toggleVideo(vidId, btnId) {
  const vid = document.getElementById(vidId);
  const btn = document.getElementById(btnId);
  if (!vid) return;
  if (vid.paused) { vid.play(); if (btn) btn.style.opacity = "0"; }
  else { vid.pause(); if (btn) btn.style.opacity = "1"; }
}

/* WORK FILTER */
document.querySelectorAll(".filter-btn").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    document.querySelectorAll(".work-item").forEach(function(item) {
      item.style.display = (filter === "all" || item.dataset.cat === filter) ? "" : "none";
    });
  });
});

/* LIGHTBOX */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("active");
  document.body.style.overflow = "auto";
}
document.querySelectorAll(".work-item img, .ai-art-item img").forEach(function(img) {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", function() { openLightbox(img.src); });
});

/* VIDEO LIGHTBOX */
function openVideoLightbox(src) {
  const lb = document.getElementById("video-lightbox");
  const vid = document.getElementById("vlb-video");
  const source = document.getElementById("vlb-source");
  if (!lb || !vid || !source) return;
  source.src = src;
  vid.load();
  vid.play();
  lb.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeVideoLightbox() {
  const lb = document.getElementById("video-lightbox");
  const vid = document.getElementById("vlb-video");
  if (!lb || !vid) return;
  vid.pause();
  vid.currentTime = 0;
  lb.classList.remove("active");
  document.body.style.overflow = "auto";
}

/* THEME TOGGLE */
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", function() {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
  });
}

/* BACK TO TOP */
const backTop = document.getElementById("back-top");
if (backTop) {
  window.addEventListener("scroll", function() {
    backTop.classList.toggle("visible", window.scrollY > 600);
  }, { passive: true });
  backTop.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* KEY DISMISS */
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") { closeVideoLightbox(); closeLightbox(); }
});

/* ASH 3D MASCOT */
(function() {
  const FALL_SPEED  = isMobile ? 0.055 : 0.038;
  const PAUSE_HOLD  = 3200;
  const BUBBLE_HOLD = 3500;

  const LINES = {
    hero:    ["Yo! That's me in the hero! ;)","Welcome to my world! On fire fr","This took blood, sweat and Photoshop","Scroll down... it gets better fr"],
    story:   ["This is my origin story no cap","English Lit grad doing design. Plot twist","I was always overthinking. Turns out its a skill"],
    service: ["Pick a service. I won't disappoint","AI video AND graphic design? Yeah I do both","I don't just deliver. I cook"],
    work:    ["That poster? All me bro","Every pixel placed with intention fr","Tap any poster to see it closer"],
    video:   ["Press play!! Don't be shy","These cuts are clean clean","Best edits on the right side","Best with headphones"],
    ai:      ["AI plus me equals dangerous combo","While you sleep I generate cinemas","The future is now and I'm 3 steps ahead"],
    contact: ["DM me! Seriously","I reply faster than your WiFi loads","Let's make something people stop at"],
    idle:    ["Still reading? Respect","bro appreciate the design","I see you lurking","You good? Need anything?","This rope is getting heavy ngl","Living rent free on your screen"],
    touch:   ["OI hands to yourself!","Hey that tickles!","Watch the fit bro!!","OK OK I see you","bro chill","You clicked me?? Rude"]
  };

  function randLine(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

  const ropeLine = document.createElement("div");
  ropeLine.id = "ash-rope-line";
  document.body.appendChild(ropeLine);

  const mascot = document.createElement("div");
  mascot.id = "ash-mascot";
  mascot.innerHTML =
    '<div id="ash-body" class="ash-hidden">' +
      '<div id="ash-bubble" class="hidden"><span class="ash-name-chip">ASH </span><span id="ash-msg"></span></div>' +
      '<img id="ash-char" src="assets/images/ash3d.png" alt="Ash" draggable="false" />' +
    '</div>' +
    '<div id="ash-blackhole"></div>';
  document.body.appendChild(mascot);

  const ashBody   = document.getElementById("ash-body");
  const ashBubble = document.getElementById("ash-bubble");
  const ashMsg    = document.getElementById("ash-msg");
  const ashHole   = document.getElementById("ash-blackhole");

  let posY        = -10;
  let running     = false;
  let chatting    = false;
  let rafId       = null;
  let bubTimer    = null;
  let lastSection = "";
  let nextPauseY  = randPause();

  function randPause() { return 18 + Math.random() * 55; }

  function setState(state) {
    ashBody.className = "";
    if (state === "hidden") { ashBody.classList.add("ash-hidden"); }
    else { ashBody.classList.add("ash-state-" + state); }
  }

  function say(text, hold) {
    clearTimeout(bubTimer);
    ashMsg.textContent = text;
    ashBubble.classList.remove("hidden");
    ashBubble.classList.remove("pop");
    void ashBubble.offsetWidth;
    ashBubble.classList.add("visible", "pop");
    bubTimer = setTimeout(function() {
      ashBubble.classList.add("hidden");
      ashBubble.classList.remove("visible");
    }, hold || BUBBLE_HOLD);
  }

  function renderPos() {
    const totalH = document.documentElement.scrollHeight;
    const px = totalH * (posY / 100);
    ashBody.style.transform = "translateY(" + px + "px)";
  }

  function getSection() {
    if (posY < 12)  return "hero";
    if (posY < 28)  return "story";
    if (posY < 45)  return "service";
    if (posY < 58)  return "work";
    if (posY < 72)  return "video";
    if (posY < 85)  return "ai";
    return "contact";
  }

  function pauseAndChat(cb) {
    chatting = true;
    cancelAnimationFrame(rafId);
    setState("wave");
    say(randLine(LINES.idle));
    setTimeout(function() {
      chatting = false;
      nextPauseY = posY + 10 + Math.random() * 30;
      setState("fall");
      cb();
    }, PAUSE_HOLD);
  }

  function fallLoop() {
    if (chatting) return;
    posY += FALL_SPEED;
    const sec = getSection();
    if (sec !== lastSection) {
      lastSection = sec;
      const pool = LINES[sec] || LINES.idle;
      setTimeout(function() {
        if (!chatting) {
          say(randLine(pool), 3000);
          setState("talk");
          setTimeout(function() { if (!chatting) setState("fall"); }, 3200);
        }
      }, 400);
    }
    if (posY >= nextPauseY && posY < 88) {
      pauseAndChat(function() { rafId = requestAnimationFrame(fallLoop); });
      return;
    }
    renderPos();
    if (posY >= 96) { blackHoleSequence(); return; }
    rafId = requestAnimationFrame(fallLoop);
  }

  function fall() {
    running = true;
    setState("fall");
    rafId = requestAnimationFrame(fallLoop);
  }

  function blackHoleSequence() {
    running = false;
    chatting = false;
    cancelAnimationFrame(rafId);
    setState("fall-hole");
    say("See ya on the other side... going through the black hole", 2200);
    setTimeout(function() { ashHole.classList.add("active"); }, 400);
    setTimeout(function() { setState("hidden"); ashHole.classList.remove("active"); }, 1400);
    setTimeout(function() {
      posY = -10;
      renderPos();
      nextPauseY = randPause();
      lastSection = "";
      setState("spawn");
      ashBody.classList.remove("ash-hidden");
      say("RESPAWN! Back on the rope!", 2500);
      setTimeout(function() { fall(); }, 1200);
    }, 4000);
  }

  ashBody.addEventListener("pointerdown", function(e) {
    e.stopPropagation();
    if (chatting) return;
    chatting = true;
    cancelAnimationFrame(rafId);
    setState("touch");
    say(randLine(LINES.touch), 2500);
    setTimeout(function() {
      chatting = false;
      setState(running ? "fall" : "wave");
      if (running) { rafId = requestAnimationFrame(fallLoop); }
    }, 2700);
  });

  document.addEventListener("visibilitychange", function() {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else if (running && !chatting) { rafId = requestAnimationFrame(fallLoop); }
  });

  setTimeout(function() {
    posY = -10;
    renderPos();
    setState("spawn");
    ashBody.classList.remove("ash-hidden");
    say("Yo! I'm Ash - Your scroll buddy!", 3000);
    setTimeout(function() { fall(); }, 1800);
  }, 2500);
})();