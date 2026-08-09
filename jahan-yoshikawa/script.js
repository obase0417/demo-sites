/* ==========================================================================
   JAHAN インド・ネパール料理（ジャーハン） — demo-018
   ヒーロー演出／スクロール連動出現／パララックス／追従ヘッダー／CTAバー制御
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
   * 1. ヒーロー登場演出
   * ------------------------------------------------------------------- */
  var hero = document.getElementById('hero');
  if (hero) {
    if (reduceMotion) {
      hero.classList.add('is-loaded');
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          hero.classList.add('is-loaded');
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
   * 2. スクロール連動の出現（IntersectionObserver + stagger）
   * ------------------------------------------------------------------- */
  var revealGroups = {};
  var revealEls = document.querySelectorAll('[data-reveal]');

  revealEls.forEach(function (el) {
    var group = el.getAttribute('data-reveal-group') || 'default';
    if (!revealGroups[group]) revealGroups[group] = [];
    revealGroups[group].push(el);
  });

  Object.keys(revealGroups).forEach(function (group) {
    revealGroups[group].forEach(function (el, index) {
      el.style.transitionDelay = reduceMotion ? '0ms' : (index * 90) + 'ms';
    });
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.willChange = 'transform, opacity, clip-path';
          el.classList.add('is-visible');
          el.addEventListener('transitionend', function handler() {
            el.style.willChange = 'auto';
            el.removeEventListener('transitionend', handler);
          });
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
   * 3. 視差（パララックス） + 4. 追従ヘッダー（rAFでまとめて処理）
   * ------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var lastScrollY = window.scrollY || 0;
  var ticking = false;
  var headerH = header ? header.offsetHeight : 64;

  function updateHeader(scrollY) {
    if (!header) return;
    if (scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    if (scrollY > lastScrollY && scrollY > headerH * 1.5) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
  }

  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.12;
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var center = rect.top + rect.height / 2 - vh / 2;
      var offset = center * -speed;
      offset = Math.max(-40, Math.min(40, offset));
      var panel = el.classList.contains('panel') ? el : el.querySelector('.panel');
      var target = panel || el;
      target.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
    });
  }

  function onScrollFrame() {
    var scrollY = window.scrollY || 0;
    updateHeader(scrollY);
    updateParallax();
    lastScrollY = scrollY;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () {
    headerH = header ? header.offsetHeight : 64;
    requestTick();
  }, { passive: true });

  requestTick();

  /* ---------------------------------------------------------------------
   * 5. 固定CTAバーの出入り（ヒーローを抜けたら表示）
   * ------------------------------------------------------------------- */
  var ctaBar = document.getElementById('ctaBar');
  if (ctaBar && hero && 'IntersectionObserver' in window) {
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.boundingClientRect.top < 0 && !entry.isIntersecting) {
          ctaBar.classList.add('is-visible');
        } else if (entry.isIntersecting) {
          ctaBar.classList.remove('is-visible');
        }
      });
    }, { threshold: 0 });
    ctaObserver.observe(hero);
  } else if (ctaBar) {
    ctaBar.classList.add('is-visible');
  }

  /* ---------------------------------------------------------------------
   * 6. アンカーのスムーススクロール（ヘッダー分オフセット）
   * ------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (headerH - 8);
      window.scrollTo({
        top: top,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });
})();
