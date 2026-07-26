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
  /* Hero elements - always visible immediately, no animation */
  document.querySelectorAll("#hero .reveal, #hero [class*=hero-]").forEach(function(el) {
    el.classList.add("revealed");
  });

  /* Below-fold sections - add reveal class dynamically */
  const jsEls = document.querySelectorAll(
    ".service-card,.work-item,.video-card,.ai-vid-card,.ai-art-item,.contact-left,.contact-right,.ai-title-block,.vid-title-block,.svc-title-block,.work-title-block,.work-showcase-card"
  );
  jsEls.forEach(function(el, i) {
    el.classList.add("reveal");
    const mod = i % 3;
    if (mod === 1) el.classList.add("reveal-d1");
    if (mod === 2) el.classList.add("reveal-d2");
  });

  /* Observe ALL reveal elements - immediately reveal if in viewport */
  const allReveals = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

  allReveals.forEach(function(el) {
    /* If already in viewport at init time, reveal immediately */
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("revealed");
    } else {
      obs.observe(el);
    }
  });
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

/* ABOUT IMAGE SLIDESHOW */
var slideshowTimer = null;
var slideshowPaused = false;

function switchAboutImg(thumb, src, userClick) {
  const mainImg = document.getElementById("aboutImg");
  if (!mainImg) return;
  /* Fade out */
  mainImg.style.opacity = "0";
  mainImg.style.transform = "scale(1.03)";
  setTimeout(function() {
    mainImg.src = src;
    mainImg.style.opacity = "1";
    mainImg.style.transform = "scale(1)";
  }, 280);
  document.querySelectorAll(".thumb-img").forEach(function(t) { t.classList.remove("active"); });
  if (thumb) thumb.classList.add("active");
  /* If user clicked, pause auto-slide for 8s */
  if (userClick) {
    slideshowPaused = true;
    clearTimeout(slideshowTimer);
    slideshowTimer = setTimeout(function() {
      slideshowPaused = false;
      startSlideshow();
    }, 8000);
  }
}

function startSlideshow() {
  const thumbs = document.querySelectorAll(".thumb-img");
  if (thumbs.length < 2) return;
  var currentIdx = 0;
  /* Find current active */
  thumbs.forEach(function(t, i) { if (t.classList.contains("active")) currentIdx = i; });

  function nextSlide() {
    if (slideshowPaused) return;
    currentIdx = (currentIdx + 1) % thumbs.length;
    const next = thumbs[currentIdx];
    switchAboutImg(next, next.src, false);
    slideshowTimer = setTimeout(nextSlide, 3500);
  }
  clearTimeout(slideshowTimer);
  slideshowTimer = setTimeout(nextSlide, 3500);
}

/* Init slideshow after page loads */
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    /* Add CSS transition to main portrait for smooth swap */
    const mainImg = document.getElementById("aboutImg");
    if (mainImg) {
      mainImg.style.transition = "opacity 0.28s ease, transform 0.28s ease";
    }
    /* Update onclick handlers to pass userClick=true */
    document.querySelectorAll(".thumb-img").forEach(function(t) {
      t.onclick = function() { switchAboutImg(t, t.src, true); };
    });
    /* Pause on hover over the portrait area */
    const wrap = document.querySelector(".si-left, .story-intro, .about-grid");
    if (wrap) {
      wrap.addEventListener("mouseenter", function() { slideshowPaused = true; });
      wrap.addEventListener("mouseleave", function() {
        slideshowPaused = false;
        startSlideshow();
      });
    }
    startSlideshow();
  }, 1500);
});

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

/* CHAPTER 05 — EXPRESSION SLIDESHOW */
(function initCh5Slideshow() {
  var slides, dots, current, timer, paused;

  function setup() {
    var wrap = document.getElementById("ch5Slideshow");
    if (!wrap) return;
    slides  = wrap.querySelectorAll(".ch-expr-slide");
    dots    = wrap.querySelectorAll(".ch-expr-dot");
    current = 0;
    paused  = false;

    /* Dot click */
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        goTo(i);
        paused = true;
        clearTimeout(timer);
        timer = setTimeout(function() { paused = false; autoPlay(); }, 8000);
      });
    });

    /* Pause on hover */
    wrap.addEventListener("mouseenter", function() { paused = true; clearTimeout(timer); });
    wrap.addEventListener("mouseleave", function() { paused = false; autoPlay(); });

    /* Touch swipe */
    var touchStartX = 0;
    wrap.addEventListener("touchstart", function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener("touchend", function(e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length); }
    });

    autoPlay();
  }

  function goTo(idx) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    slides[current].classList.add("exit");
    setTimeout(function() { slides[current < slides.length ? current : 0].classList.remove("exit"); }, 550);
    current = idx;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function autoPlay() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (!paused) { goTo((current + 1) % slides.length); }
      autoPlay();
    }, 3500);
  }

  /* Wait for DOM */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setTimeout(setup, 500);
  }
})();
/* ASH MASCOT ENGINE - Photo + CSS Pseudo-3D + Physics + Emotions */
(function() {
  'use strict';

  var CFG = {
    IDLE_TIMEOUT:   10000,
    FAST_SCROLL:    12,
    ROPE_STIFFNESS: 0.055,
    ROPE_DAMPING:   0.87,
    CURSOR_LERP:    0.04,
    SPEAK_COOLDOWN: 5500,
  };

  var SPEECH = {
    hero:    ["That's literally me up there!", "Welcome to my world", "Scroll down, gets way better"],
    story:   ["My origin story fr", "English Lit to design. Plot twist", "Every scar is a chapter"],
    service: ["Pick a service. I won't disappoint", "I don't just deliver. I cook"],
    work:    ["Every pixel with intention", "Tap to see bigger", "These took real hours bro"],
    video:   ["Press play! Don't be shy", "These cuts go hard ngl"],
    ai:      ["AI plus me equals dangerous", "3 steps ahead always"],
    contact: ["YO! We made it to contact!!", "DM me I reply fast"],
    idle:    ["Still here? Respect", "I see you...", "Take your time"],
    touch:   ["OI hands!", "Hey that tickles!", "bro CHILL", "You clicked me?? Rude"],
    dizzy:   ["bro SLOW DOWN", "I am getting dizzy!!", "my head..."],
    sleep:   ["*snoring*", "zzzzz...", "...hm? oh hey!"],
    wakeup:  ["WHOA! I'm awake!", "Oh hey! Was just resting", "Back! What did I miss?"],
  };

  var EMO = {
    idle:"😎", sleeping:"💤", dizzy:"😵", waving:"👋",
    proud:"🔥", excited:"🎉", thinking:"🤔", happy:"😄", shocked:"😲",
  };

  /* === STATE === */
  var emotion     = "idle";
  var lastSection = "";
  var isScrolling = false;
  var inHole      = false;
  var lastSpoke   = 0;
  var scrollSpeed = 0;
  var lastScrollY = window.scrollY;
  var rafId       = null;

  /* Rope physics */
  var ropeAngle = 0;
  var ropeVel   = 0;

  /* Cursor pseudo-3D */
  var tgtRotX = 0, tgtRotY = 0;
  var curRotX = 0, curRotY = 0;
  var cursorX = window.innerWidth  / 2;
  var cursorY = window.innerHeight / 2;

  /* Timers */
  var scrollTimer   = null;
  var inactiveTimer = null;
  var bubTimer      = null;

  /* === BUILD DOM === */
  var ropeLine  = document.createElement("div");
  ropeLine.id   = "ash-rope-line";
  document.body.appendChild(ropeLine);

  var wrap  = document.createElement("div");
  wrap.id   = "ash-mascot";
  wrap.innerHTML =
    '<div id="ash-body" class="ash-hidden">' +
      '<div id="ash-bubble" class="hidden">' +
        '<span class="ash-name-chip">ASH </span>' +
        '<span id="ash-msg"></span>' +
      '</div>' +
      '<div id="ash-emo-badge"></div>' +
      '<img id="ash-char" src="assets/images/ash_fullbody.png" alt="Ash" draggable="false" />' +
    '</div>' +
    '<div id="ash-blackhole"></div>';
  document.body.appendChild(wrap);

  var ashBody  = document.getElementById("ash-body");
  var ashBub   = document.getElementById("ash-bubble");
  var ashMsg   = document.getElementById("ash-msg");
  var ashHole  = document.getElementById("ash-blackhole");
  var emoBadge = document.getElementById("ash-emo-badge");

  /* === HELPERS === */
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function setEmo(em) {
    emotion = em;
    if (!EMO[em]) return;
    emoBadge.textContent = EMO[em];
    emoBadge.className   = "ash-emo-badge ash-emo-" + em;
    emoBadge.classList.add("pop");
    setTimeout(function() { emoBadge.classList.remove("pop"); }, 400);
  }

  function say(text, hold) {
    var now = Date.now();
    if (now - lastSpoke < CFG.SPEAK_COOLDOWN) return;
    lastSpoke = now;
    clearTimeout(bubTimer);
    ashMsg.textContent = text;
    ashBub.classList.remove("hidden", "pop");
    void ashBub.offsetWidth;
    ashBub.classList.add("visible", "pop");
    bubTimer = setTimeout(function() {
      ashBub.classList.add("hidden");
      ashBub.classList.remove("visible");
    }, hold || 3500);
  }

  function forceSpeak(text, hold) { lastSpoke = 0; say(text, hold); }

  function setState(state) {
    ashBody.className = "";
    if (state === "hidden") {
      ashBody.classList.add("ash-hidden");
    } else {
      ashBody.classList.add("ash-state-" + state);
    }
  }

  function getScrollPct() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    return total > 0 ? (window.scrollY / total) * 100 : 0;
  }

  function getSection() {
    var p = getScrollPct();
    if (p < 10) return "hero";
    if (p < 25) return "story";
    if (p < 42) return "service";
    if (p < 58) return "work";
    if (p < 72) return "video";
    if (p < 85) return "ai";
    return "contact";
  }

  /* === ANIMATION LOOP (rAF) === */
  function animate() {
    /* Rope spring physics */
    var target = isScrolling ? Math.max(-20, Math.min(20, scrollSpeed * 0.6)) : 0;
    ropeVel    = (ropeVel + (target - ropeAngle) * CFG.ROPE_STIFFNESS) * CFG.ROPE_DAMPING;
    ropeAngle += ropeVel;

    /* Cursor head tracking */
    var cx  = window.innerWidth  / 2;
    var cy  = window.innerHeight / 2;
    tgtRotY = ((cursorX - cx) / Math.max(1, cx)) *  20;
    tgtRotX = ((cursorY - cy) / Math.max(1, cy)) * -8;
    curRotX += (tgtRotX - curRotX) * CFG.CURSOR_LERP;
    curRotY += (tgtRotY - curRotY) * CFG.CURSOR_LERP;

    /* Apply to the character image */
    var ashChar = document.getElementById("ash-char");
    if (ashChar && emotion !== "sleeping" && emotion !== "dizzy") {
      ashChar.style.transform =
        "perspective(600px)" +
        " rotateY(" + (curRotY + ropeAngle * 0.35).toFixed(2) + "deg)" +
        " rotateX(" + curRotX.toFixed(2)                      + "deg)" +
        " rotateZ(" + (ropeAngle * 0.18).toFixed(2)           + "deg)";
    }

    rafId = requestAnimationFrame(animate);
  }

  /* === SCROLL HANDLER === */
  window.addEventListener("scroll", function() {
    if (inHole) return;
    var sy   = window.scrollY;
    scrollSpeed  = sy - lastScrollY;
    lastScrollY  = sy;
    isScrolling  = true;

    /* Wake from sleep on scroll */
    if (emotion === "sleeping") {
      setEmo("happy");
      setState("wave");
      forceSpeak(rand(SPEECH.wakeup), 2500);
    }

    /* Fast scroll = dizzy */
    if (Math.abs(scrollSpeed) > CFG.FAST_SCROLL) {
      if (emotion !== "dizzy") { setEmo("dizzy"); say(rand(SPEECH.dizzy)); }
    } else if (emotion === "dizzy") {
      setEmo("idle");
    }

    /* Rope kick */
    ropeVel += scrollSpeed * 0.14;

    /* Black hole at 95%+ */
    if (getScrollPct() >= 95) { triggerBlackHole(); return; }

    /* Section change */
    var sec = getSection();
    if (sec !== lastSection) {
      lastSection = sec;
      var sEmo = { hero:"waving", story:"thinking", service:"idle", work:"proud", video:"happy", ai:"excited", contact:"excited" };
      setEmo(sEmo[sec] || "idle");
      setTimeout(function() { say(rand(SPEECH[sec] || SPEECH.idle)); }, 700);
    }

    setState("fall");
    clearTimeout(inactiveTimer);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      isScrolling = false;
      setState("wave");
      if (emotion === "dizzy") setEmo("idle");
      inactiveTimer = setTimeout(function() {
        setEmo("sleeping");
        setState("sleep");
        forceSpeak(rand(SPEECH.sleep), 4000);
      }, CFG.IDLE_TIMEOUT);
    }, 900);
  }, { passive: true });

  /* === CURSOR TRACKING === */
  document.addEventListener("mousemove", function(e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (emotion === "sleeping") {
      setEmo("happy");
      setState("wave");
      forceSpeak(rand(SPEECH.wakeup), 2500);
      clearTimeout(inactiveTimer);
      inactiveTimer = setTimeout(function() {
        setEmo("sleeping");
        setState("sleep");
      }, CFG.IDLE_TIMEOUT);
    }
  });

  /* === TOUCH / TAP === */
  ashBody.addEventListener("pointerdown", function(e) {
    e.stopPropagation();
    if (inHole) return;
    var wasSleeping = (emotion === "sleeping");
    setState("touch");
    setEmo(wasSleeping ? "shocked" : "idle");
    ropeVel += (Math.random() > 0.5 ? 5 : -5);
    forceSpeak(wasSleeping ? rand(SPEECH.wakeup) : rand(SPEECH.touch), 2500);
    setTimeout(function() {
      setState(isScrolling ? "fall" : "wave");
    }, 2700);
  });

  /* === BLACK HOLE === */
  function triggerBlackHole() {
    if (inHole) return;
    inHole = true;
    setEmo("excited");
    setState("fall-hole");
    forceSpeak(rand(SPEECH.contact), 2000);
    setTimeout(function() { ashHole.classList.add("active"); }, 300);
    setTimeout(function() {
      setState("hidden");
      ashHole.classList.remove("active");
    }, 1200);
    setTimeout(function() {
      inHole = false;
      setEmo("happy");
      setState("spawn");
      ashBody.classList.remove("ash-hidden");
      forceSpeak("Back from the void!", 2000);
      setTimeout(function() { setState("wave"); }, 900);
    }, 4500);
  }

  /* === VISIBILITY (pause rAF when tab hidden) === */
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      animate();
    }
  });

  /* === KICK OFF === */
  setTimeout(function() {
    setState("spawn");
    ashBody.classList.remove("ash-hidden");
    setEmo("waving");
    forceSpeak("Yo! I'm Ash, your scroll buddy!", 3500);
    setTimeout(function() {
      setState("wave");
      setEmo("idle");
      lastSection = getSection();
      animate();
      inactiveTimer = setTimeout(function() {
        setEmo("sleeping");
        setState("sleep");
      }, CFG.IDLE_TIMEOUT);
    }, 2200);
  }, 2500);

})();
