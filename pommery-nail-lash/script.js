/* ==========================================================================
   pommery（ポメリー）Nail & Lash — デモサイト script.js
   外部通信は一切行わない（fetch / XHR / WebSocket 不使用）
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. ヒーロー登場演出
     ------------------------------------------------------------------ */
  var hero = document.getElementById("hero");
  function triggerHero() {
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-loaded");
      });
    });
  }
  if (document.readyState === "complete") {
    triggerHero();
  } else {
    window.addEventListener("load", triggerHero, { once: true });
  }

  /* ------------------------------------------------------------------
     2. スクロール連動の出現（IntersectionObserver・stagger は --d で指定済み）
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.style.willChange = "opacity, transform";
          el.classList.add("is-inview");
          el.addEventListener(
            "transitionend",
            function () { el.style.willChange = "auto"; },
            { once: true }
          );
          observer.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-inview"); });
  }

  /* ------------------------------------------------------------------
     3. 追従ヘッダー（縮小・表示/非表示）＋ 固定CTAバーの出入り
        スクロール処理は rAF にまとめて 1 本化する
     ------------------------------------------------------------------ */
  var header = document.getElementById("siteHeader");
  var ctaBar = document.getElementById("ctaBar");
  var lastY = window.scrollY || 0;
  var ticking = false;

  function onScrollFrame() {
    var y = window.scrollY || 0;

    if (header) {
      if (y > 60) header.classList.add("site-header--scrolled");
      else header.classList.remove("site-header--scrolled");

      if (y > lastY && y > 220) header.classList.add("site-header--hidden");
      else header.classList.remove("site-header--hidden");
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* CTAバーはヒーローを抜けたタイミングで出す */
  if (ctaBar && hero && "IntersectionObserver" in window) {
    var ctaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            ctaBar.classList.remove("is-visible");
          } else if (entry.boundingClientRect.top < 0) {
            ctaBar.classList.add("is-visible");
          }
        });
      },
      { threshold: 0 }
    );
    ctaObserver.observe(hero);
  } else if (ctaBar) {
    ctaBar.classList.add("is-visible");
  }

  /* ------------------------------------------------------------------
     4. 視差（パララックス）— rAF でまとめて処理
     ------------------------------------------------------------------ */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  function updateParallax() {
    if (reduceMotion || !parallaxEls.length) return;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.2;
      var rect = el.parentElement.getBoundingClientRect();
      var offset = rect.top * speed;
      el.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
    });
    requestAnimationFrame(updateParallax);
  }
  if (!reduceMotion && parallaxEls.length) {
    requestAnimationFrame(updateParallax);
  }

  /* ------------------------------------------------------------------
     5. モバイルナビの開閉
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "メニューを開く");
      });
    });
  }

  /* ------------------------------------------------------------------
     6. 数字のカウントアップ（★評価・口コミ件数）
     ------------------------------------------------------------------ */
  var countEls = document.querySelectorAll(".count-up");
  function animateCount(el) {
    var raw = el.getAttribute("data-count-to") || "0";
    var target = parseFloat(raw);
    var decimals = raw.indexOf(".") > -1 ? raw.split(".")[1].length : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && countEls.length) {
    var countObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(animateCount);
  }
})();
