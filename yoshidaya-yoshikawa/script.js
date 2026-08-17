/* =========================================================
   刺身・地場野菜 よしだ家 — script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）。
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------
     0. ヒーロー登場シーケンス
     --------------------------------------------------- */
  function initHeroEntrance() {
    if (prefersReduced) {
      document.body.classList.add("is-loaded");
      return;
    }
    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        document.body.classList.add("is-loaded");
      }, 150);
    });
  }

  /* ---------------------------------------------------
     1. スクロール連動の出現（IntersectionObserver + stagger）
     --------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!items.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    // グループごとのstagger順序を事前計算
    var groupIndex = new WeakMap();
    var groupCounters = new WeakMap();
    items.forEach(function (el) {
      var group = el.closest("[data-reveal-group]");
      if (!group) return;
      var count = groupCounters.get(group) || 0;
      groupIndex.set(el, count);
      groupCounters.set(group, count + 1);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var explicitDelay = el.getAttribute("data-reveal-delay");
          var delay = 0;
          if (explicitDelay !== null) {
            delay = parseInt(explicitDelay, 10) || 0;
          } else {
            var idx = groupIndex.get(el);
            if (typeof idx === "number") {
              delay = Math.min(idx * 80, 640);
            }
          }
          el.style.transitionDelay = delay + "ms";
          el.style.animationDelay = delay + "ms";
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------
     2. ヘッダーのスクロール追従フェード
     --------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var ticking = false;

    function update() {
      var scrolled = window.scrollY > 24;
      header.classList.toggle("is-scrolled", scrolled);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------
     3. パララックス（rAFでまとめて処理）
     --------------------------------------------------- */
  function initParallax() {
    if (prefersReduced) return;
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!els.length) return;

    var active = new Set();

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              active.add(entry.target);
              entry.target.style.willChange = "transform";
            } else {
              active.delete(entry.target);
              entry.target.style.willChange = "";
            }
          });
        },
        { rootMargin: "25% 0px 25% 0px" }
      );
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { active.add(el); });
    }

    var vh = window.innerHeight;
    window.addEventListener("resize", function () { vh = window.innerHeight; }, { passive: true });

    function tick() {
      active.forEach(function (el) {
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) * factor;
        el.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      });
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------
     4. 店主紹介：スティッキー写真のscroll連動scale
     --------------------------------------------------- */
  function initStoryPhoto() {
    var photo = document.querySelector("[data-story-photo]");
    var wrap = document.querySelector(".story__media-wrap");
    if (!photo || !wrap) return;

    if (prefersReduced) return;

    var ticking = false;

    function update() {
      var rect = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height - vh;
      var progress = 0;
      if (total > 0) {
        progress = (0 - rect.top) / total;
      }
      progress = Math.max(0, Math.min(1, progress));
      var scale = 1 + progress * 0.16;
      photo.style.transform = "scale(" + scale.toFixed(3) + ")";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------------------------------------------------
     5. 引用符SVGの線描画
     --------------------------------------------------- */
  function initQuoteSvg() {
    var svg = document.querySelector("[data-quote-svg]");
    if (!svg) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      svg.classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            svg.classList.add("is-visible");
            io.unobserve(svg);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(svg);
  }

  /* ---------------------------------------------------
     6. 紺帯（アクセス以降）の上→下ワイプ暗転
     --------------------------------------------------- */
  function initIndigoBand() {
    var band = document.querySelector("[data-indigo-band]");
    if (!band) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      band.classList.add("in-view");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            band.classList.add("in-view");
            io.unobserve(band);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(band);
  }

  /* ---------------------------------------------------
     7. 固定CTAバー：ヒーローを抜けたらせり上がる
     --------------------------------------------------- */
  function initFixedCta() {
    var bar = document.querySelector("[data-fixed-cta]");
    var hero = document.querySelector(".hero");
    if (!bar || !hero) return;

    if (!("IntersectionObserver" in window)) {
      bar.classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          bar.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: "-10% 0px -80% 0px" }
    );
    io.observe(hero);
  }

  /* ---------------------------------------------------
     init
     --------------------------------------------------- */
  function init() {
    initHeroEntrance();
    initReveal();
    initHeader();
    initParallax();
    initStoryPhoto();
    initQuoteSvg();
    initIndigoBand();
    initFixedCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
