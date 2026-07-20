/* ============================================================
   Remembering Klemen — interactions
   Vanilla JS, no dependencies. Progressive enhancement.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var noHover = window.matchMedia("(hover: none)").matches;

  /* ---------------- Language ---------------- */
  var TITLES = { sl: "Klemnu v spomin", en: "In memory of Klemen" };
  var DESCS = {
    sl: "V spomin Klemnu (1994, 2026). Programer, padalec in prijatelj, na katerega si se lahko vedno zanesel. Deli spomin, zgodbo ali fotografijo.",
    en: "In memory of Klemen (1994, 2026). A software developer, skydiver, and the friend you could always count on. Share a memory, a story, or a photo."
  };
  var metaDesc = doc.querySelector('meta[name="description"]');

  function setLang(lang, persist) {
    if (lang !== "sl" && lang !== "en") lang = "sl";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    doc.title = TITLES[lang];
    if (metaDesc) metaDesc.setAttribute("content", DESCS[lang]);

    var btns = doc.querySelectorAll("[data-setlang]");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-setlang") === lang;
      btns[i].classList.toggle("is-active", on);
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
    // localized alt text
    var imgs = doc.querySelectorAll("[data-alt-" + lang + "]");
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].setAttribute("alt", imgs[j].getAttribute("data-alt-" + lang) || "");
    }
    // localized aria-labels (video tiles, player controls)
    var labelled = doc.querySelectorAll("[data-aria-" + lang + "]");
    for (var a2 = 0; a2 < labelled.length; a2++) {
      labelled[a2].setAttribute("aria-label", labelled[a2].getAttribute("data-aria-" + lang) || "");
    }
    if (typeof refreshVideoCaption === "function") refreshVideoCaption();
    if (persist) { try { localStorage.setItem("rk.lang.v2", lang); } catch (e) {} }
    if (lightbox && !lightbox.hasAttribute("hidden")) refreshLightboxCaption();
  }

  var langButtons = doc.querySelectorAll("[data-setlang]");
  for (var b = 0; b < langButtons.length; b++) {
    langButtons[b].addEventListener("click", function () {
      setLang(this.getAttribute("data-setlang"), true);
    });
  }
  // apply current (inline head script already detected + set root data-lang); do not persist auto-detection
  setLang(root.getAttribute("data-lang") || "sl", false);

  /* ---------------- Header: two-state + mobile nav ---------------- */
  var header = doc.getElementById("site-header");
  var heroEl = doc.getElementById("home");
  var navToggle = doc.getElementById("nav-toggle");
  var progressBar = doc.getElementById("scroll-progress");
  var threshold = 200;

  function computeThreshold() {
    threshold = heroEl ? Math.max(120, heroEl.offsetHeight - 90) : window.innerHeight * 0.7;
  }
  computeThreshold();

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > threshold);
      if (progressBar) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      }
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { computeThreshold(); });
  onScroll();

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    var navLinks = header.querySelectorAll(".site-nav a");
    for (var n = 0; n < navLinks.length; n++) {
      navLinks[n].addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        if (t.classList.contains("g-item") && t.parentNode) {
          var idx = Array.prototype.indexOf.call(t.parentNode.children, t);
          t.style.transitionDelay = ((idx % 3) * 0.09) + "s";
          t.addEventListener("transitionend", function clr() { t.style.transitionDelay = ""; t.removeEventListener("transitionend", clr); });
        }
        t.classList.add("in"); io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var r = 0; r < revealEls.length; r++) io.observe(revealEls[r]);
  } else {
    for (var r2 = 0; r2 < revealEls.length; r2++) revealEls[r2].classList.add("in");
  }

  /* ---------------- Passion parallax ---------------- */
  var passionImg = doc.querySelector(".passion-bg img");
  var passionSec = doc.getElementById("passion");
  var introPortrait = doc.querySelector(".intro-portrait img");
  var introSec = doc.getElementById("intro");
  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    if (passionImg && passionSec) {
      var rect = passionSec.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) {
        var pr = (vh - rect.top) / (vh + rect.height);
        passionImg.style.transform = "translateY(" + ((pr - 0.5) * 80).toFixed(1) + "px)";
      }
    }
    if (introPortrait && introSec) {
      var ir = introSec.getBoundingClientRect();
      if (ir.bottom > 0 && ir.top < vh) {
        var ip = (vh - ir.top) / (vh + ir.height);
        introPortrait.style.transform = "translateY(" + ((ip - 0.5) * 30).toFixed(1) + "px) scale(1.08)";
      }
    }
  }
  updateParallax();

  /* ---------------- Lightbox ---------------- */
  var items = Array.prototype.slice.call(doc.querySelectorAll(".g-item"));
  var lightbox = doc.getElementById("lightbox");
  var lbImg = doc.getElementById("lb-img");
  var lbCap = doc.getElementById("lb-cap");
  var lbClose = doc.getElementById("lb-close");
  var lbPrev = doc.getElementById("lb-prev");
  var lbNext = doc.getElementById("lb-next");
  var current = 0;
  var lastFocus = null;
  var lbTimer = null;

  function refreshLightboxCaption() {
    if (!items[current]) return;
    var lang = root.getAttribute("data-lang") || "sl";
    var cap = items[current].getAttribute("data-cap-" + lang) || "";
    if (lbCap) lbCap.textContent = cap;
    if (lbImg) lbImg.setAttribute("alt", cap);
  }

  function showImage(i) {
    current = (i + items.length) % items.length;
    var it = items[current];
    if (lbImg) { lbImg.setAttribute("src", it.getAttribute("data-full")); }
    refreshLightboxCaption();
    // preload neighbours
    [current + 1, current - 1].forEach(function (k) {
      var idx = (k + items.length) % items.length;
      var im = new Image(); im.src = items[idx].getAttribute("data-full");
    });
  }

  function openLightbox(i) {
    if (!lightbox) return;
    clearTimeout(lbTimer);
    lastFocus = doc.activeElement;
    // lock scroll WITHOUT moving it (prevents the jump on close); compensate scrollbar width
    var sw = window.innerWidth - doc.documentElement.clientWidth;
    doc.body.style.overflow = "hidden";
    if (sw > 0) doc.body.style.paddingRight = sw + "px";
    showImage(i);
    lightbox.removeAttribute("hidden");
    setAriaHiddenBackground(true);
    requestAnimationFrame(function () { lightbox.classList.add("open"); });
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hasAttribute("hidden")) return;
    lightbox.classList.remove("open");
    doc.body.style.overflow = "";
    doc.body.style.paddingRight = "";
    setAriaHiddenBackground(false);
    clearTimeout(lbTimer);
    lbTimer = setTimeout(function () { lightbox.setAttribute("hidden", ""); }, reduceMotion ? 0 : 360);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setAriaHiddenBackground(hide) {
    ["site-header", "main"].forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) { if (hide) el.setAttribute("aria-hidden", "true"); else el.removeAttribute("aria-hidden"); }
    });
    var footer = doc.querySelector(".site-footer");
    if (footer) { if (hide) footer.setAttribute("aria-hidden", "true"); else footer.removeAttribute("aria-hidden"); }
  }

  items.forEach(function (it, i) {
    it.addEventListener("click", function () { openLightbox(i); });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { showImage(current - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { showImage(current + 1); });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lb-figure")) closeLightbox();
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hasAttribute("hidden")) return;
    if (e.key === "Escape") { closeLightbox(); }
    else if (e.key === "ArrowLeft") { showImage(current - 1); }
    else if (e.key === "ArrowRight") { showImage(current + 1); }
    else if (e.key === "Tab") {
      var f = [lbPrev, lbNext, lbClose].filter(Boolean);
      var idx = f.indexOf(doc.activeElement);
      e.preventDefault();
      var nextIdx = e.shiftKey ? (idx <= 0 ? f.length - 1 : idx - 1) : (idx >= f.length - 1 ? 0 : idx + 1);
      f[nextIdx].focus();
    }
  });

  /* ============================================================
     HERO VIDEO — his own footage behind the name
     Autoplays muted; stands down for reduced motion and when
     the tab or the hero is out of view (saves battery/data).
     ============================================================ */
  var heroVideo = doc.getElementById("hero-video");
  if (heroVideo) {
    // if the file cannot play, the poster frame stays — nothing to do
    heroVideo.addEventListener("error", function () { heroVideo.removeAttribute("autoplay"); });

    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.removeAttribute("loop");
      try { heroVideo.pause(); } catch (e) {}
    } else {
      var heroVisible = true;
      var tryPlay = function () {
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () { /* blocked: poster remains */ });
      };
      tryPlay();
      doc.addEventListener("visibilitychange", function () {
        if (doc.hidden) { try { heroVideo.pause(); } catch (e) {} }
        else if (heroVisible) tryPlay();
      });
      if ("IntersectionObserver" in window && heroEl) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            heroVisible = e.isIntersecting;
            if (e.isIntersecting && !doc.hidden) tryPlay();
            else { try { heroVideo.pause(); } catch (err) {} }
          });
        }, { threshold: 0.01 }).observe(heroEl);
      }
    }
  }

  /* ============================================================
     VIDEO PLAYER — YouTube facade grid + modal
     The iframe is only created on click, so the page itself
     never talks to YouTube until a visitor asks it to.
     ============================================================ */
  var vItems = Array.prototype.slice.call(doc.querySelectorAll(".v-item"));
  var vbox = doc.getElementById("vbox");
  var vFrame = doc.getElementById("vbox-frame");
  var vTitle = doc.getElementById("vbox-title");
  var vCount = doc.getElementById("vbox-count");
  var vClose = doc.getElementById("vbox-close");
  var vPrev = doc.getElementById("vbox-prev");
  var vNext = doc.getElementById("vbox-next");
  var vCurrent = 0;
  var vLastFocus = null;
  var vTimer = null;

  function refreshVideoCaption() {
    if (!vbox || vbox.hasAttribute("hidden") || !vItems[vCurrent]) return;
    if (vTitle) vTitle.textContent = vItems[vCurrent].getAttribute("data-title") || "";
    if (vCount) vCount.textContent = (vCurrent + 1) + " / " + vItems.length;
  }

  /* His videos are self-hosted on R2 and played with a plain <video>.
     Nothing is fetched until a tile is clicked, and there is no dependency
     on YouTube — so no embedding permission, no third-party player, and
     nothing that can be taken away later. Each tile keeps its data-yt id
     purely as a link target if a visitor would rather watch on YouTube. */
  function destroyPlayer() {
    if (!vFrame) return;
    var old = vFrame.querySelector("video");
    if (old) { try { old.pause(); old.removeAttribute("src"); old.load(); } catch (e) {} }
    vFrame.innerHTML = "";
  }

  function showVideoFallback(i) {
    if (!vFrame || !vItems[i] || i !== vCurrent) return;
    var it = vItems[i];
    var yt = it.getAttribute("data-yt");
    var thumb = it.querySelector("img");
    var lang = root.getAttribute("data-lang") || "sl";
    destroyPlayer();

    var wrap = doc.createElement("div");
    wrap.className = "vbox-fallback";
    if (thumb) wrap.style.backgroundImage = "url(" + thumb.getAttribute("src") + ")";

    var msg = doc.createElement("p");
    msg.className = "vbox-fallback-msg";
    msg.textContent = lang === "en"
      ? "This video could not be loaded."
      : "Tega posnetka ni bilo mogoče naložiti.";
    wrap.appendChild(msg);

    if (yt) {
      var cta = doc.createElement("a");
      cta.className = "vbox-fallback-cta";
      cta.setAttribute("href", "https://www.youtube.com/watch?v=" + encodeURIComponent(yt));
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener noreferrer");
      cta.textContent = lang === "en" ? "Watch on YouTube" : "Poglej na YouTubu";
      wrap.appendChild(cta);
    }
    vFrame.appendChild(wrap);
  }

  function playVideo(i) {
    if (!vItems.length || !vFrame) return;
    vCurrent = (i + vItems.length) % vItems.length;
    var it = vItems[vCurrent];
    var src = it.getAttribute("data-src");
    refreshVideoCaption();
    destroyPlayer();
    if (!src) { showVideoFallback(vCurrent); return; }

    var thumb = it.querySelector("img");
    var v = doc.createElement("video");
    v.className = "vbox-video";
    v.setAttribute("src", src);
    if (thumb) v.setAttribute("poster", thumb.getAttribute("src"));
    v.setAttribute("controls", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("preload", "metadata");
    v.setAttribute("controlslist", "nodownload");
    var idx = vCurrent;
    v.addEventListener("error", function () { showVideoFallback(idx); });
    vFrame.appendChild(v);
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function () { /* autoplay blocked: controls are there */ });
  }
  function openVideo(i) {
    if (!vbox) return;
    clearTimeout(vTimer);
    vLastFocus = doc.activeElement;
    var sw = window.innerWidth - doc.documentElement.clientWidth;
    doc.body.style.overflow = "hidden";
    if (sw > 0) doc.body.style.paddingRight = sw + "px";
    vbox.removeAttribute("hidden");
    setAriaHiddenBackground(true);
    playVideo(i);
    requestAnimationFrame(function () { vbox.classList.add("open"); });
    if (vClose) vClose.focus();
  }

  function closeVideo() {
    if (!vbox || vbox.hasAttribute("hidden")) return;
    vbox.classList.remove("open");
    destroyPlayer();                      // stop playback at once
    doc.body.style.overflow = "";
    doc.body.style.paddingRight = "";
    setAriaHiddenBackground(false);
    clearTimeout(vTimer);
    vTimer = setTimeout(function () { vbox.setAttribute("hidden", ""); }, reduceMotion ? 0 : 360);
    if (vLastFocus && vLastFocus.focus) vLastFocus.focus();
  }

  vItems.forEach(function (it, i) {
    it.addEventListener("click", function () { openVideo(i); });
  });
  if (vClose) vClose.addEventListener("click", closeVideo);
  if (vPrev) vPrev.addEventListener("click", function () { playVideo(vCurrent - 1); });
  if (vNext) vNext.addEventListener("click", function () { playVideo(vCurrent + 1); });
  if (vbox) {
    vbox.addEventListener("click", function (e) {
      if (e.target === vbox) closeVideo();
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (!vbox || vbox.hasAttribute("hidden")) return;
    if (e.key === "Escape") { closeVideo(); }
    else if (e.key === "ArrowLeft") { playVideo(vCurrent - 1); }
    else if (e.key === "ArrowRight") { playVideo(vCurrent + 1); }
    else if (e.key === "Tab") {
      var f = [vPrev, vNext, vClose].filter(Boolean);
      var idx = f.indexOf(doc.activeElement);
      e.preventDefault();
      var nextIdx = e.shiftKey ? (idx <= 0 ? f.length - 1 : idx - 1) : (idx >= f.length - 1 ? 0 : idx + 1);
      f[nextIdx].focus();
    }
  });

  /* ============================================================
     HERO CANVAS — 3D parallax dust field
     ============================================================ */
  function makeGlowSprite(size, inner, outer) {
    var c = doc.createElement("canvas");
    c.width = c.height = size;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.5, outer);
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);
    return c;
  }

  function setupCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }
    return { ctx: ctx, resize: resize };
  }

  var heroCanvas = doc.getElementById("sky-canvas");
  var heroSkyEl = doc.querySelector(".page-sky-img");
  if (heroCanvas && heroCanvas.getContext) {
    var H = setupCanvas(heroCanvas);
    var hDim = H.resize();
    // soft gold-dust sprite
    var dustSprite = (function () {
      var s = 40, c = doc.createElement("canvas"); c.width = c.height = s;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0.0, "rgba(255,245,218,1)");
      g.addColorStop(0.3, "rgba(240,214,150,0.5)");
      g.addColorStop(1.0, "rgba(240,214,150,0)");
      x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, 6.2832); x.fill();
      return c;
    })();
    // stars: placed uniformly across the whole sky (even coverage), gentle twinkle, depth for parallax
    var stars = [];
    var STAR_N = window.innerWidth < 640 ? 140 : 240;
    for (var s0 = 0; s0 < STAR_N; s0++) {
      stars.push({
        x: Math.random(), y: Math.random(), z: 0.4 + Math.random() * 0.6,
        r: 0.5 + Math.random() * Math.random() * 1.4,
        base: 0.42 + Math.random() * 0.5, tw: Math.random() * 6.28, tws: 0.5 + Math.random() * 1.6,
        gold: Math.random() > 0.75
      });
    }
    // drifting gold dust (subtle accent)
    var dust = [];
    var DUST_N = window.innerWidth < 640 ? 18 : 30;
    for (var m = 0; m < DUST_N; m++) {
      dust.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: 0.45 + Math.random() * 0.75,
        r: 0.4 + Math.random() * 0.9, sway: Math.random() * 6.28, swaySpeed: 0.15 + Math.random() * 0.5,
        rise: 0.05 + Math.random() * 0.12, a: 0.2 + Math.random() * 0.32 });
    }
    var guide = { x: 0.5, y: 0.26, tw: 0 };
    var shoot = null, nextShoot = 4 + Math.random() * 6;
    var mx = 0, my = 0, tmx = 0, tmy = 0, heroInView = true, heroRAF = 0, lastT = 0;
    window.addEventListener("mousemove", function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function drawHero(t) {
      var dt = Math.min((t - lastT) / 1000, 0.05) || 0.016; lastT = t;
      mx += (tmx - mx) * 0.045; my += (tmy - my) * 0.045;
      var w = hDim.w, h = hDim.h, cx = w / 2, cy = h * 0.44, ctx = H.ctx, i;
      ctx.clearRect(0, 0, w, h);

      // uniform twinkling stars
      for (i = 0; i < stars.length; i++) {
        var st = stars[i]; st.tw += st.tws * dt;
        var inv = 1 / st.z;
        var sx = st.x * w + mx * 16 * inv, sy = st.y * h + my * 12 * inv;
        var a = st.base * (0.45 + 0.55 * Math.sin(st.tw));
        if (a <= 0.02) continue;
        if (st.r > 1.1) {
          ctx.globalAlpha = a * 0.45;
          ctx.fillStyle = st.gold ? "rgba(243,220,160,1)" : "rgba(220,232,250,1)";
          ctx.beginPath(); ctx.arc(sx, sy, st.r * inv * 2.6, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = st.gold ? "#f3dca0" : "#eaf1fb";
        ctx.beginPath(); ctx.arc(sx, sy, st.r * inv, 0, 6.2832); ctx.fill();
      }

      // guiding star
      guide.tw += dt;
      var gx = guide.x * w + mx * 10, gy = guide.y * h + my * 8, ga = 0.7 + 0.3 * Math.sin(guide.tw * 1.2);
      var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 24);
      grad.addColorStop(0, "rgba(246,226,178," + (0.8 * ga) + ")");
      grad.addColorStop(1, "rgba(246,226,178,0)");
      ctx.globalAlpha = 1; ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(gx, gy, 24, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = ga; ctx.fillStyle = "#fff6e4";
      ctx.beginPath(); ctx.arc(gx, gy, 2.1, 0, 6.2832); ctx.fill();

      // drifting gold dust
      for (var k = 0; k < dust.length; k++) {
        var p = dust[k];
        p.y -= (p.rise / p.z) * dt; p.sway += p.swaySpeed * dt;
        if (p.y < -1.2) { p.y = 1.2; p.x = Math.random() * 2 - 1; }
        var dinv = 1 / p.z;
        var px = cx + (p.x + Math.sin(p.sway) * 0.05) * w * dinv * 0.5 + mx * 26 * dinv;
        var py = cy + p.y * h * dinv * 0.5 + my * 20 * dinv;
        var rad = p.r * dinv, dr = rad * 1.9;
        ctx.globalAlpha = p.a * Math.min(1, dinv * 0.7);
        ctx.drawImage(dustSprite, px - dr, py - dr, dr * 2, dr * 2);
      }

      // rare shooting star
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) {
        var fl = Math.random() > 0.5;
        shoot = { x: fl ? -0.05 : 1.05, y: 0.08 + Math.random() * 0.35, vx: (fl ? 1 : -1) * (0.5 + Math.random() * 0.3), vy: 0.16 + Math.random() * 0.12, life: 0, max: 1.1 };
        nextShoot = 9 + Math.random() * 9;
      }
      if (shoot) {
        shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
        var ssx = shoot.x * w, ssy = shoot.y * h, tx = ssx - shoot.vx * w * 0.08, ty = ssy - shoot.vy * h * 0.08;
        var fade = Math.max(0, 1 - shoot.life / shoot.max);
        var lg = ctx.createLinearGradient(tx, ty, ssx, ssy);
        lg.addColorStop(0, "rgba(255,255,255,0)");
        lg.addColorStop(1, "rgba(255,248,230," + (0.9 * fade) + ")");
        ctx.globalAlpha = 1; ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ssx, ssy); ctx.stroke();
        if (shoot.life > shoot.max || shoot.x < -0.1 || shoot.x > 1.1) shoot = null;
      }

      ctx.globalAlpha = 1;
      if (heroSkyEl) heroSkyEl.style.transform = "scale(1.06) translate(" + (mx * -12).toFixed(1) + "px," + (my * -9).toFixed(1) + "px)";
      heroRAF = requestAnimationFrame(drawHero);
    }
    function startHero() { if (!heroRAF) { lastT = 0; heroRAF = requestAnimationFrame(drawHero); } }
    function stopHero() { if (heroRAF) { cancelAnimationFrame(heroRAF); heroRAF = 0; } }
    window.addEventListener("resize", function () { hDim = H.resize(); });
    if (reduceMotion) { drawHero(16); stopHero(); }
    else {
      startHero();
      doc.addEventListener("visibilitychange", function () { if (doc.hidden) stopHero(); else startHero(); });
    }
  }

  /* ============================================================
     FAREWELL CANVAS — calm starfield + rare shooting star
     ============================================================ */
  var starsCanvas = doc.getElementById("stars-canvas");
  if (starsCanvas && starsCanvas.getContext) {
    var S = setupCanvas(starsCanvas);
    var sDim = S.resize();
    var field = [];
    var STAR_N = window.innerWidth < 640 ? 70 : 130;
    for (var f2 = 0; f2 < STAR_N; f2++) {
      field.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.25, a: Math.random() * 0.6 + 0.2, tw: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.4 });
    }
    var guiding = { x: 0.5, y: 0.24, r: 2.4, tw: 0 };
    var shoot = null;
    var nextShoot = 3 + Math.random() * 5;
    var sLast = 0, starRAF = 0;

    function spawnShoot() {
      var fromLeft = Math.random() > 0.5;
      shoot = {
        x: fromLeft ? -0.05 : 1.05, y: 0.1 + Math.random() * 0.3,
        vx: (fromLeft ? 1 : -1) * (0.5 + Math.random() * 0.3),
        vy: 0.18 + Math.random() * 0.12, life: 0, max: 1.1
      };
    }

    function drawStars(t) {
      var dt = Math.min((t - sLast) / 1000, 0.05) || 0.016; sLast = t;
      var w = sDim.w, h = sDim.h;
      S.ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < field.length; i++) {
        var st = field[i]; st.tw += dt * st.sp;
        S.ctx.globalAlpha = st.a * (0.55 + 0.45 * Math.sin(st.tw));
        S.ctx.fillStyle = "#e7eefb";
        S.ctx.beginPath(); S.ctx.arc(st.x * w, st.y * h, st.r, 0, 6.2832); S.ctx.fill();
      }
      // guiding star with soft halo
      guiding.tw += dt;
      var ga = 0.7 + 0.3 * Math.sin(guiding.tw * 1.3);
      var gx = guiding.x * w, gy = guiding.y * h;
      var grad = S.ctx.createRadialGradient(gx, gy, 0, gx, gy, 26);
      grad.addColorStop(0, "rgba(240,222,180," + (0.9 * ga) + ")");
      grad.addColorStop(1, "rgba(240,222,180,0)");
      S.ctx.globalAlpha = 1; S.ctx.fillStyle = grad;
      S.ctx.beginPath(); S.ctx.arc(gx, gy, 26, 0, 6.2832); S.ctx.fill();
      S.ctx.globalAlpha = ga; S.ctx.fillStyle = "#fff6e2";
      S.ctx.beginPath(); S.ctx.arc(gx, gy, guiding.r, 0, 6.2832); S.ctx.fill();

      // shooting star
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) { spawnShoot(); nextShoot = 7 + Math.random() * 7; }
      if (shoot) {
        shoot.life += dt;
        shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
        var sx = shoot.x * w, sy = shoot.y * h;
        var tailX = sx - shoot.vx * w * 0.09, tailY = sy - shoot.vy * h * 0.09;
        var lg = S.ctx.createLinearGradient(tailX, tailY, sx, sy);
        var fade = Math.max(0, 1 - shoot.life / shoot.max);
        lg.addColorStop(0, "rgba(255,255,255,0)");
        lg.addColorStop(1, "rgba(255,248,230," + (0.85 * fade) + ")");
        S.ctx.globalAlpha = 1; S.ctx.strokeStyle = lg; S.ctx.lineWidth = 2; S.ctx.lineCap = "round";
        S.ctx.beginPath(); S.ctx.moveTo(tailX, tailY); S.ctx.lineTo(sx, sy); S.ctx.stroke();
        if (shoot.life > shoot.max || shoot.x < -0.1 || shoot.x > 1.1) shoot = null;
      }
      S.ctx.globalAlpha = 1;
      starRAF = requestAnimationFrame(drawStars);
    }
    function startStars() { if (!starRAF) starRAF = requestAnimationFrame(drawStars); }
    function stopStars() { if (starRAF) { cancelAnimationFrame(starRAF); starRAF = 0; } }
    window.addEventListener("resize", function () { sDim = S.resize(); });

    if (reduceMotion) {
      // draw a single static frame
      drawStars(16); stopStars();
    } else if ("IntersectionObserver" in window) {
      var farewellSec = doc.getElementById("farewell");
      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting && !doc.hidden) startStars(); else stopStars(); });
      }, { threshold: 0.05 });
      if (farewellSec) vis.observe(farewellSec);
      doc.addEventListener("visibilitychange", function () { if (doc.hidden) stopStars(); });
    } else {
      startStars();
    }
  }

  /* ============================================================
     CURSOR — a soft light follows the pointer, leaving a faint trail
     ============================================================ */
  (function () {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    var glow = doc.getElementById("cursor-glow");
    var trail = doc.getElementById("cursor-trail");
    if (!glow || !trail || !trail.getContext) return;
    root.classList.add("has-cursorfx");
    var tctx = trail.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function sizeTrail() { trail.width = Math.round(window.innerWidth * dpr); trail.height = Math.round(window.innerHeight * dpr); tctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    sizeTrail(); window.addEventListener("resize", sizeTrail);

    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, gx = cx, gy = cy;
    var sparks = [], lastX = cx, lastY = cy, moved = false;
    window.addEventListener("mousemove", function (e) {
      cx = e.clientX; cy = e.clientY; moved = true;
      if (Math.hypot(cx - lastX, cy - lastY) > 7) {
        sparks.push({ x: cx + (Math.random() * 8 - 4), y: cy + (Math.random() * 8 - 4), life: 1, r: Math.random() * 1.5 + 0.6, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 - 0.18 });
        if (sparks.length > 70) sparks.shift();
        lastX = cx; lastY = cy;
      }
    }, { passive: true });
    doc.addEventListener("mouseover", function (e) { if (e.target.closest && e.target.closest("a, button, .g-item, [role=button]")) glow.classList.add("is-hover"); });
    doc.addEventListener("mouseout", function (e) { if (e.target.closest && e.target.closest("a, button, .g-item, [role=button]")) glow.classList.remove("is-hover"); });
    doc.addEventListener("mouseleave", function () { glow.style.opacity = "0"; });
    doc.addEventListener("mouseenter", function () { glow.style.opacity = ""; });

    var craf = 0;
    function loop() {
      gx += (cx - gx) * 0.18; gy += (cy - gy) * 0.18;
      if (moved) glow.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)";
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i]; s.life -= 0.022; s.x += s.vx; s.y += s.vy;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        tctx.globalAlpha = s.life * 0.7;
        tctx.fillStyle = "#f3e6c4";
        tctx.beginPath(); tctx.arc(s.x, s.y, s.r * s.life, 0, 6.2832); tctx.fill();
      }
      tctx.globalAlpha = 1;
      craf = requestAnimationFrame(loop);
    }
    loop();
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) { cancelAnimationFrame(craf); craf = 0; } else if (!craf) loop(); });
  })();
})();
