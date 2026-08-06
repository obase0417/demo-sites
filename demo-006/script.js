/* ===================================================================
   和菓子司まるしん — デモサイト script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   =================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     ヘッダー：スクロールで縮小・不透明化、下スクロールで隠す
  --------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY || 0;

  function updateHeader() {
    if (!header) return;
    var y = window.scrollY || 0;
    header.classList.toggle('is-scrolled', y > 40);
    if (y > lastY && y > 140) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastY = y;
  }

  /* ---------------------------------------------------------------
     パララックス（requestAnimationFrame でまとめて処理）
  --------------------------------------------------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    parallaxEls.forEach(function (el) {
      if (!el.classList.contains('in-view')) return;
      var rect = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var progress = (center - vh / 2) / vh; // 画面中央基準の相対位置
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var translate = progress * speed * 100;
      el.style.transform = 'translate3d(0,' + translate.toFixed(2) + 'px,0)';
    });
  }

  /* ---------------------------------------------------------------
     CTAバー：ヒーローを抜けたら表示
  --------------------------------------------------------------- */
  var ctaBar = document.getElementById('ctaBar');
  var heroSection = document.getElementById('hero');
  var heroVisible = true;

  function updateCtaBar() {
    if (!ctaBar) return;
    ctaBar.classList.toggle('is-visible', !heroVisible);
  }

  /* ---------------------------------------------------------------
     スクロール処理は rAF でまとめる
  --------------------------------------------------------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader();
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------------------------------------------------------------
     ヒーローの可視監視（IntersectionObserver）
  --------------------------------------------------------------- */
  if (heroSection && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroVisible = entry.isIntersecting;
      });
      updateCtaBar();
    }, { threshold: 0, rootMargin: '-10% 0px -70% 0px' });
    heroObserver.observe(heroSection);
  } else {
    heroVisible = false;
  }

  /* ---------------------------------------------------------------
     パララックス対象の in-view 切り替え（画面外では計算・描画しない）
  --------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var parallaxObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
        if (!entry.isIntersecting) {
          entry.target.style.transform = '';
        }
      });
    }, { threshold: 0 });
    parallaxEls.forEach(function (el) { parallaxObserver.observe(el); });
  } else {
    parallaxEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------------------------------------------------------
     スクロール連動の出現（stagger 付き reveal）
  --------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var groupCounters = {};

  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    var key = parent ? (parent.className || 'root') + '-' + (parent.parentElement ? parent.parentElement.className : '') : 'root';
    if (groupCounters[key] === undefined) groupCounters[key] = 0;
    var idx = groupCounters[key]++;
    el.style.transitionDelay = reduceMotion ? '0ms' : (idx * 90) + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('will-anim');
          entry.target.classList.add('is-visible');
          entry.target.style.willChange = 'transform, opacity, clip-path';
          var el = entry.target;
          var clear = function () {
            el.style.willChange = 'auto';
            el.removeEventListener('transitionend', clear);
          };
          el.addEventListener('transitionend', clear);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------
     ヒーロー登場演出（読み込み後、時間差で組み立てる）
  --------------------------------------------------------------- */
  function startHero() {
    if (!heroSection) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroSection.classList.add('is-ready');
      });
    });
  }
  if (document.readyState === 'complete') {
    startHero();
  } else {
    window.addEventListener('load', startHero);
  }

  /* ---------------------------------------------------------------
     数字のカウントアップ（創業からの年数）
  --------------------------------------------------------------- */
  var statEls = Array.prototype.slice.call(document.querySelectorAll('[data-count-to]'));

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (statEls.length) {
    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
      statEls.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    }
  }

  /* ---------------------------------------------------------------
     モバイルナビの開閉
  --------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.slice.call(siteNav.querySelectorAll('a')).forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------
     初期状態を反映
  --------------------------------------------------------------- */
  updateHeader();
  updateCtaBar();
})();
