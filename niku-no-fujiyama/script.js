/* ============================================================
   肉のフジヤマ デモサイト script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ============================================================ */
(function () {
  "use strict";

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = reduceMotionQuery.matches;

  /* ---------------------------------------------------------
     1. ヒーローの登場演出
     --------------------------------------------------------- */
  function initHero() {
    var hero = document.getElementById("hero");
    if (!hero) return;

    var start = function () {
      // レイアウト確定後に少し遅らせてクラスを付与し、確実に遷移させる
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          hero.classList.add("is-ready");
        });
      });
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
      // フォールバック：load が遅い場合に備える
      window.setTimeout(start, 1200);
    }
  }

  /* ---------------------------------------------------------
     2. スクロール連動の出現（IntersectionObserver + stagger）
     --------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    // セクションごとに出現順の連番を振り、60〜120ms刻みで時間差をつける
    var counters = new Map();
    items.forEach(function (el) {
      var group = el.closest("section") || document.body;
      var count = counters.get(group) || 0;
      var delay = Math.min(count, 6) * 90;
      el.style.transitionDelay = delay + "ms";
      counters.set(group, count + 1);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target); // 一度出たら戻さない
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     3. 視差（パララックス） + 追従ヘッダー + スクロールキュー
        まとめて requestAnimationFrame で処理する
     --------------------------------------------------------- */
  function initScrollEffects() {
    var header = document.getElementById("siteHeader");
    var heroBg = document.querySelector(".hero-bg");
    var scrollCue = document.querySelector(".scroll-cue");
    var hero = document.getElementById("hero");
    var ctaBar = document.getElementById("ctaBar");

    var lastY = window.scrollY || 0;
    var ticking = false;
    var headerScrollThreshold = 40;

    function applyWillChange(el, active) {
      if (!el) return;
      el.style.willChange = active ? "transform" : "auto";
    }

    // ヒーローが画面内にある間だけパララックスを有効化（負荷軽減）
    var heroInView = true;
    if (heroBg && "IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            heroInView = entry.isIntersecting;
            applyWillChange(heroBg, heroInView && !prefersReducedMotion);
          });
        },
        { threshold: 0 }
      );
      heroObserver.observe(hero || heroBg);
    }

    // CTAバーの表示切り替え：ヒーローを抜けたら出す
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
    }

    function update() {
      var y = window.scrollY || 0;

      // 追従ヘッダー：縮小・不透明化、下スクロールで隠す／上スクロールで戻す
      if (header) {
        if (y > headerScrollThreshold) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
        if (y > lastY && y > header.offsetHeight * 2) {
          header.classList.add("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }
      }

      // パララックス（背景と前景で移動量を変える）
      if (heroBg && heroInView && !prefersReducedMotion) {
        var offset = y * 0.32;
        heroBg.style.transform = "translate3d(0, " + offset + "px, 0)";
      }

      // スクロールキューはヒーロー内でのみ表示
      if (scrollCue) {
        if (y > 60) {
          scrollCue.classList.add("is-hidden");
        } else {
          scrollCue.classList.remove("is-hidden");
        }
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     4. スムーズスクロール（ナビゲーション）
     --------------------------------------------------------- */
  function initNavLinks() {
    var links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = link.getAttribute("href");
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var headerOffset =
          (document.getElementById("siteHeader") || {}).offsetHeight || 0;
        var bannerOffset =
          (document.querySelector(".demo-banner") || {}).offsetHeight || 0;
        var top =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerOffset -
          bannerOffset -
          16;
        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  /* ---------------------------------------------------------
     初期化
     --------------------------------------------------------- */
  function init() {
    initHero();
    initReveal();
    initScrollEffects();
    initNavLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
