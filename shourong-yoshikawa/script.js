/* =========================================================
   萬的中華 笑龍 — script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ========================================================= */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var ctaBar = document.getElementById('ctaBar');
  var heroSection = document.getElementById('hero');
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = reduceMotionQuery.matches;
  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', function (e) {
      reduceMotion = e.matches;
      if (reduceMotion) {
        parallaxEls.forEach(function (el) { el.style.transform = ''; });
      }
    });
  }

  var lastScrollY = window.scrollY || window.pageYOffset || 0;
  var ticking = false;

  function heroHeight() {
    return heroSection ? heroSection.offsetHeight : window.innerHeight;
  }

  /* ---------- 追従ヘッダー：縮小・不透明化・上下スクロールでの出し入れ ---------- */
  function updateHeader(scrollY) {
    if (!header) return;

    if (scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    var pastHero = scrollY > heroHeight() * 0.55;
    var scrollingDown = scrollY > lastScrollY + 2;
    var scrollingUp = scrollY < lastScrollY - 2;

    if (pastHero && scrollingDown) {
      header.classList.add('is-hidden');
    } else if (scrollingUp || !pastHero) {
      header.classList.remove('is-hidden');
    }
  }

  /* ---------- 固定CTAバー：ヒーローを抜けたらフェードイン ---------- */
  function updateCtaBar(scrollY) {
    if (!ctaBar) return;
    if (scrollY > heroHeight() * 0.6) {
      ctaBar.classList.add('is-visible');
    } else {
      ctaBar.classList.remove('is-visible');
    }
  }

  /* ---------- パララックス（背景写真と前景テキストで速度を変える） ---------- */
  function updateParallax() {
    if (reduceMotion) return;
    var viewportH = window.innerHeight;
    var viewportCenter = viewportH / 2;

    parallaxEls.forEach(function (el) {
      var factor = parseFloat(el.getAttribute('data-parallax')) || 0;
      var rect = el.getBoundingClientRect();

      // 画面外に大きく外れている要素は計算をスキップ（負荷軽減）
      if (rect.bottom < -viewportH || rect.top > viewportH * 2) return;

      var elCenter = rect.top + rect.height / 2;
      var offset = (viewportCenter - elCenter) * factor;
      el.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
    });
  }

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    updateHeader(scrollY);
    updateCtaBar(scrollY);
    updateParallax();
    lastScrollY = scrollY;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  window.addEventListener('orientationchange', requestTick, { passive: true });

  // 初期状態を反映
  onScroll();

  /* ---------- スクロール連動の出現（IntersectionObserver・stagger はCSSのdelayクラスで付与） ---------- */
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 一度出たら戻さない
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.15
    });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // IntersectionObserver 非対応環境でもコンテンツは表示する
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
