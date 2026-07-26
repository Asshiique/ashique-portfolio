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

/* ASH 3D MASCOT - scroll-linked companion */
(function() {

  /* ---- Speech banks per section ---- */
  var LINES = {
    hero:    ["Yo! That's literally me up there 😎", "Welcome to my world fr", "This took blood, sweat and Photoshop ✨", "Scroll down... it gets better"],
    story:   ["This is my origin story no cap", "English Lit grad doing design. Plot twist 😤", "I was always overthinking. Turns out it's a skill"],
    service: ["Pick a service. I won't disappoint", "AI video AND graphic design? Yeah I do both", "I don't just deliver. I cook 🍳"],
    work:    ["That poster? All me bro 🗞", "Every pixel placed with intention fr", "Tap any poster to see it bigger 👀"],
    video:   ["Press play!! Don't be shy 🎬", "These cuts go hard ngl", "Best with headphones on 🎧"],
    ai:      ["AI plus me equals dangerous combo 🚀", "While you sleep I generate cinemas", "The future is now and I'm 3 steps ahead"],
    contact: ["DM me! I reply fast 💬", "I reply faster than your WiFi loads 😭", "Let's make something people stop scrolling for"],
    idle:    ["Still here? Respect 🫡", "Take your time, I'm not going anywhere", "I see you exploring 👀", "You good? Need anything?", "This rope is getting heavy ngl 😅"],
    touch:   ["OI hands to yourself! 😂", "Hey that tickles! 🤣", "Watch the fit bro!! 😤", "OK OK I see you 👀", "You clicked me?? Rude 😭"]
  };

  function randLine(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

  /* ---- Build DOM ---- */
  var ropeLine = document.createElement("div");
  ropeLine.id = "ash-rope-line";
  document.body.appendChild(ropeLine);

  var mascot = document.createElement("div");
  mascot.id = "ash-mascot";
  mascot.innerHTML =
    '<div id="ash-body" class="ash-hidden">' +
      '<div id="ash-bubble" class="hidden"><span class="ash-name-chip">ASH </span><span id="ash-msg"></span></div>' +
      '<img id="ash-char" src="assets/images/ash3d.png" alt="Ash" draggable="false" />' +
    '</div>' +
    '<div id="ash-blackhole"></div>';
  document.body.appendChild(mascot);

  var ashBody   = document.getElementById("ash-body");
  var ashBubble = document.getElementById("ash-bubble");
  var ashMsg    = document.getElementById("ash-msg");
  var ashHole   = document.getElementById("ash-blackhole");

  /* ---- State ---- */
  var lastSection  = "";
  var bubTimer     = null;
  var scrollTimer  = null;
  var inHole       = false;
  var chatting     = false;
  var lastSpokenAt = 0;
  var MIN_SPEAK_GAP = 6000; // ms between unsolicited speeches

  /* ---- Section detector from scroll % ---- */
  function getSection() {
    var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (pct < 10)  return "hero";
    if (pct < 25)  return "story";
    if (pct < 42)  return "service";
    if (pct < 58)  return "work";
    if (pct < 72)  return "video";
    if (pct < 85)  return "ai";
    return "contact";
  }

  function getScrollPct() {
    return (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100;
  }

  /* ---- Speech ---- */
  function say(text, hold) {
    clearTimeout(bubTimer);
    ashMsg.textContent = text;
    ashBubble.classList.remove("hidden", "pop");
    void ashBubble.offsetWidth;
    ashBubble.classList.add("visible", "pop");
    lastSpokenAt = Date.now();
    bubTimer = setTimeout(function() {
      ashBubble.classList.add("hidden");
      ashBubble.classList.remove("visible");
    }, hold || 3500);
  }

  /* ---- Pose helper ---- */
  function setState(state) {
    ashBody.className = "";
    if (state === "hidden") { ashBody.classList.add("ash-hidden"); }
    else { ashBody.classList.add("ash-state-" + state); }
  }

  /* ---- Black hole at bottom ---- */
  function triggerBlackHole() {
    if (inHole) return;
    inHole = true;
    setState("fall-hole");
    say("Going through the black hole... 🌀", 2000);
    setTimeout(function() { ashHole.classList.add("active"); }, 300);
    setTimeout(function() {
      setState("hidden");
      ashHole.classList.remove("active");
    }, 1200);
    setTimeout(function() {
      inHole = false;
      setState("spawn");
      ashBody.classList.remove("ash-hidden");
      say("Back from the void! Let's go again 🔄", 2500);
      setTimeout(function() { setState("wave"); }, 800);
    }, 3800);
  }

  /* ---- MAIN SCROLL HANDLER ---- */
  var isScrolling = false;

  window.addEventListener("scroll", function() {
    if (inHole || ashBody.classList.contains("ash-hidden")) return;

    var pct = getScrollPct();

    /* Trigger black hole near bottom */
    if (pct >= 95) {
      triggerBlackHole();
      return;
    }

    /* Show rope-swing while scrolling */
    if (!chatting) { setState("fall"); }
    isScrolling = true;

    /* Section change check */
    var sec = getSection();
    if (sec !== lastSection) {
      lastSection = sec;
      /* Speak about new section after brief delay */
      setTimeout(function() {
        var now = Date.now();
        if (!chatting && now - lastSpokenAt > MIN_SPEAK_GAP) {
          chatting = true;
          setState("talk");
          say(randLine(LINES[sec] || LINES.idle), 3000);
          setTimeout(function() {
            chatting = false;
            setState(isScrolling ? "fall" : "wave");
          }, 3200);
        }
      }, 500);
    }

    /* Debounced "stopped scrolling" — switch to wave + idle chat */
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      isScrolling = false;
      if (inHole || chatting) return;
      setState("wave");
      /* Random idle quip when user pauses */
      var now = Date.now();
      if (now - lastSpokenAt > MIN_SPEAK_GAP) {
        chatting = true;
        setState("talk");
        say(randLine(LINES.idle), 3000);
        setTimeout(function() {
          chatting = false;
          setState("wave");
        }, 3200);
      }
    }, 1200);

  }, { passive: true });

  /* ---- Touch / click interaction ---- */
  ashBody.addEventListener("pointerdown", function(e) {
    e.stopPropagation();
    if (inHole) return;
    var wasChatting = chatting;
    chatting = true;
    setState("touch");
    say(randLine(LINES.touch), 2500);
    setTimeout(function() {
      chatting = false;
      setState(isScrolling ? "fall" : "wave");
    }, 2700);
  });

  /* ---- Kick off: appear after preloader ---- */
  setTimeout(function() {
    setState("spawn");
    ashBody.classList.remove("ash-hidden");
    say("Yo! I'm Ash 👋 Scroll and I'll follow you!", 3500);
    setTimeout(function() {
      setState("wave");
      lastSection = getSection();
    }, 1800);
  }, 2000);

  /* ---- Pause when tab hidden ---- */
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden && !inHole && !chatting) {
      setState(isScrolling ? "fall" : "wave");
    }
  });

})();