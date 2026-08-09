/* =========================================================
   酒乃おはこ屋 デモサイト script.js
   外部通信は一切行いません（fetch / XHR 不使用）
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. デモ注記バナーの高さを CSS 変数へ反映
     --------------------------------------------------------- */
  function syncBannerHeight() {
    var banner = document.querySelector('[data-banner]');
    if (!banner) return;
    var h = Math.ceil(banner.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--banner-h', h + 'px');
  }

  /* ---------------------------------------------------------
     2. ヒーローの登場演出
        body.is-home-ready を付与し、CSSの transition-delay で
        時間差の組み立てを行う
     --------------------------------------------------------- */
  function playHeroEntrance() {
    if (reduceMotion) {
      document.body.classList.add('is-home-ready');
      return;
    }
    // 2フレーム待ってから発火させ、初期スタイルの適用漏れを防ぐ
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('is-home-ready');
      });
    });
  }

  /* ---------------------------------------------------------
     3. スクロール連動の出現（IntersectionObserver + stagger）
     --------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // セクション単位でstaggerのdelayを付与（同一セクション内で60〜120ms間隔）
    var counters = new WeakMap();
    items.forEach(function (el) {
      var group = el.closest('section, header, footer') || document.body;
      var n = counters.get(group) || 0;
      var delay = Math.min(n, 6) * 90;
      el.style.setProperty('--reveal-delay', delay + 'ms');
      counters.set(group, n + 1);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     4. 追従ヘッダー（縮小・不透明化・下スクロールで隠す）
     --------------------------------------------------------- */
  function initHeader(onScrollTick) {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);

      if (y > lastY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        header.style.willChange = 'transform';
        requestAnimationFrame(update);
        ticking = true;
      }
      onScrollTick();
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     5. 視差（パララックス） — ヒーロー背景のみ、rAFでまとめる
     --------------------------------------------------------- */
  function initParallax(onScrollTick) {
    var layer = document.querySelector('[data-parallax]');
    var hero = document.querySelector('[data-hero]');
    if (!layer || !hero || reduceMotion) return;

    var ticking = false;

    function update() {
      var y = window.scrollY;
      var heroHeight = hero.offsetHeight;
      if (y < heroHeight) {
        layer.style.willChange = 'transform';
        layer.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
      onScrollTick();
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     6. will-change の後片付け（スクロール停止後にリセット）
     --------------------------------------------------------- */
  function createWillChangeCleanup() {
    var timer = null;
    return function scheduleCleanup() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var header = document.querySelector('[data-header]');
        var layer = document.querySelector('[data-parallax]');
        if (header) header.style.willChange = 'auto';
        if (layer) layer.style.willChange = 'auto';
      }, 220);
    };
  }

  /* ---------------------------------------------------------
     7. 固定CTAバーの出入り（ヒーローを抜けたらせり上がる）
     --------------------------------------------------------- */
  function initCtaBar() {
    var bar = document.querySelector('[data-cta-bar]');
    var hero = document.querySelector('[data-hero]');
    if (!bar) return;

    if (!hero || !('IntersectionObserver' in window)) {
      bar.classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

    observer.observe(hero);
  }

  /* ---------------------------------------------------------
     8. reduced-motion時はスムーススクロールを無効化
     --------------------------------------------------------- */
  function initScrollBehavior() {
    if (reduceMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  /* ---------------------------------------------------------
     初期化
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    syncBannerHeight();
    initScrollBehavior();
    playHeroEntrance();
    initReveal();
    initCtaBar();

    var scheduleWillChangeCleanup = createWillChangeCleanup();
    initHeader(scheduleWillChangeCleanup);
    initParallax(scheduleWillChangeCleanup);
  });

  window.addEventListener('resize', function () {
    syncBannerHeight();
  }, { passive: true });
})();
