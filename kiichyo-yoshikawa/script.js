/* ==========================================================================
   やきとり きっちょう — script.js
   外部通信は行いません（fetch / XHR / WebSocket 不使用）
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- デモバナーの実高さを CSS 変数に反映 ---------------------------- */
  function syncBannerHeight() {
    var banner = document.querySelector('[data-banner]');
    if (!banner) return;
    var h = banner.offsetHeight;
    document.documentElement.style.setProperty('--banner-h', h + 'px');
  }
  syncBannerHeight();
  window.addEventListener('resize', debounce(syncBannerHeight, 150), { passive: true });

  /* ---- ハンバーガーナビの開閉 ------------------------------------------ */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      siteNav.classList.toggle('is-open', !isOpen);
    });

    var navLinks = siteNav.querySelectorAll('[data-nav-link]');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', closeNav);
    }
  }

  /* ---- スクロール連動出現（IntersectionObserver + stagger） ------------ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---- 追従ヘッダー：縮小・不透明化・下スクロールで隠す ---------------- */
  var header = document.querySelector('[data-header]');
  var lastScrollY = window.scrollY;
  var scrollDelta = 0;
  var ticking = false;

  function updateHeader() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 60);

      var diff = y - lastScrollY;
      scrollDelta += diff;

      if (y < 80) {
        header.classList.remove('is-hidden');
      } else if (scrollDelta > 12) {
        header.classList.add('is-hidden');
        scrollDelta = 0;
      } else if (scrollDelta < -12) {
        header.classList.remove('is-hidden');
        scrollDelta = 0;
      }
      lastScrollY = y;
    }
    ticking = false;
  }

  /* ---- パララックス（transform のみ、rAFでまとめる） -------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
      var offset = (rect.top - vh / 2) * speed * -1;
      el.style.transform = 'translate3d(0,' + (offset * -0.3) + 'px,0)';
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateHeader();
        updateParallax();
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', debounce(updateParallax, 100), { passive: true });
  updateHeader();
  updateParallax();

  /* ---- 固定CTAバー：ヒーローを抜けたらせり上がる ------------------------ */
  var ctaBar = document.querySelector('[data-cta-bar]');
  var hero = document.querySelector('[data-hero]');

  if (ctaBar && hero && typeof IntersectionObserver !== 'undefined') {
    var ctaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          ctaBar.classList.toggle('is-visible', !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    ctaObserver.observe(hero);
  } else if (ctaBar) {
    ctaBar.classList.add('is-visible');
  }

  /* ---- 補助関数 ---------------------------------------------------------- */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }
})();
