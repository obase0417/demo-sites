/* ==========================================================================
   Cafe feu（カフェ フー） — Demo Site Script
   外部通信なし（fetch / XHR / WebSocket / 外部スクリプト読み込みは行わない）
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;

  /* ------------------------------------------------------------------
     1. Hero load sequence
     ------------------------------------------------------------------ */
  function markReady() {
    // 2フレーム待ってからクラスを付与し、初期スタイルの適用を確実にする
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.add("is-ready");
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markReady);
  } else {
    markReady();
  }

  /* ------------------------------------------------------------------
     2. Header: shrink on scroll, hide on scroll-down, show on scroll-up
     ------------------------------------------------------------------ */
  var header = document.getElementById("site-header");
  var lastY = window.scrollY;
  var ticking = false;
  var COMPACT_THRESHOLD = 40;
  var HIDE_THRESHOLD = 140;

  function onScrollHeader() {
    var y = window.scrollY;

    if (header) {
      if (y > COMPACT_THRESHOLD) {
        header.classList.add("is-compact");
      } else {
        header.classList.remove("is-compact");
      }

      if (y > HIDE_THRESHOLD && y > lastY) {
        header.classList.add("is-hidden");
      } else if (y < lastY) {
        header.classList.remove("is-hidden");
      }
    }

    lastY = y;
    ticking = false;
  }

  function requestHeaderTick() {
    if (!ticking) {
      requestAnimationFrame(onScrollHeader);
      ticking = true;
    }
  }
  window.addEventListener("scroll", requestHeaderTick, { passive: true });

  /* ------------------------------------------------------------------
     3. Scroll-reveal (IntersectionObserver, staggered via --i)
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && revealEls.length) {
    var groups = {};

    revealEls.forEach(function (el) {
      var parentKey = el.parentElement ? el.parentElement : document.body;
      if (!groups.has) { /* noop for older engines */ }
    });

    // グループごとの出現順に応じて --i を自動付与（インラインで指定済みの場合は上書きしない）
    var siblingsSeen = new WeakMap();
    revealEls.forEach(function (el) {
      if (el.style.getPropertyValue("--i")) return;
      var parent = el.parentElement || document.body;
      var count = siblingsSeen.get(parent) || 0;
      el.style.setProperty("--i", String(count));
      siblingsSeen.set(parent, count + 1);
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // IntersectionObserver 非対応時はすべて表示
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------
     4. Parallax on hero media (background photo moves slower than content)
     ------------------------------------------------------------------ */
  var heroMedia = document.querySelector(".hero__media");
  var heroSection = document.getElementById("hero");
  var parallaxTicking = false;

  function updateParallax() {
    parallaxTicking = false;
    if (!heroMedia || !heroSection) return;

    var rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    var progress = 1 - rect.top / window.innerHeight; // 0(画面下)→1(画面上)を超えて進行
    var offset = Math.max(-1, Math.min(1.4, progress)) * 60; // px

    heroMedia.style.willChange = "transform";
    heroMedia.style.transform =
      "translate3d(0, " + offset.toFixed(1) + "px, 0) scale(1.08)";
  }

  function requestParallaxTick() {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }

  if (!reduceMotion && heroMedia) {
    window.addEventListener("scroll", requestParallaxTick, { passive: true });
    window.addEventListener("resize", requestParallaxTick, { passive: true });
    updateParallax();
  }

  /* ------------------------------------------------------------------
     5. Fixed CTA bar: appear once hero is scrolled past
     ------------------------------------------------------------------ */
  var ctaBar = document.getElementById("cta-bar");

  if (ctaBar && heroSection) {
    if ("IntersectionObserver" in window) {
      var ctaObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              ctaBar.classList.remove("is-visible");
            } else {
              ctaBar.classList.add("is-visible");
            }
          });
        },
        { root: null, threshold: 0 }
      );
      ctaObserver.observe(heroSection);
    } else {
      ctaBar.classList.add("is-visible");
    }
  }

  /* ------------------------------------------------------------------
     6. will-change クリーンアップ（アニメーション終了後に外す）
     ------------------------------------------------------------------ */
  document.querySelectorAll(".feature__img, .interior__img").forEach(function (el) {
    el.addEventListener("transitionend", function () {
      el.style.willChange = "";
    });
    el.addEventListener("mouseenter", function () {
      el.style.willChange = "transform";
    });
  });
})();
