/* =========================================================
   製麺練場 風布うどん — デモサイト JS
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ========================================================= */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ヘッダー：スクロール連動 ---------- */
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY || 0;
  var ticking = false;

  function updateHeader(y) {
    if (!header) return;
    header.classList.toggle('site-header--scrolled', y > 40);
    if (y > lastY && y > 160) {
      header.classList.add('site-header--hidden');
    } else {
      header.classList.remove('site-header--hidden');
    }
  }

  /* ---------- パララックス対象 ---------- */
  var parallaxTargets = [];
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-parallax]'),
    function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax'));
      parallaxTargets.push({ el: el, speed: isNaN(speed) ? 0.12 : speed });
    }
  );

  function updateParallax() {
    if (reducedMotion || !parallaxTargets.length) return;
    var vh = window.innerHeight;
    parallaxTargets.forEach(function (t) {
      var rect = t.el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = rect.top / vh; // 1 -> 0 -> -x
      var offset = progress * t.speed * 60;
      t.el.style.transform =
        'translate(-50%, calc(-50% + ' + offset.toFixed(2) + 'px)) scale(' +
        (t.el.classList.contains('is-kenburns') ? '1.02' : '1.18') + ')';
    });
  }

  function onScroll() {
    var y = window.scrollY || 0;
    updateHeader(y);
    updateParallax();
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* ---------- ヒーロー登場演出 ---------- */
  function startHero() {
    document.documentElement.classList.add('is-ready');
    var heroPanel = document.getElementById('heroPanel');
    if (heroPanel) {
      heroPanel.style.willChange = 'transform';
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          heroPanel.classList.add('is-kenburns');
        });
      });
      heroPanel.addEventListener(
        'transitionend',
        function () {
          heroPanel.style.willChange = 'auto';
        },
        { once: true }
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHero);
  } else {
    startHero();
  }

  /* ---------- スクロール連動の出現（IntersectionObserver） ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function armWillChange(el) {
    el.style.willChange = 'opacity, transform, clip-path';
    el.addEventListener(
      'transitionend',
      function () {
        el.style.willChange = 'auto';
      },
      { once: true }
    );
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            armWillChange(entry.target);
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  /* ---------- 固定CTAバー：ヒーローを抜けたら表示 ---------- */
  var ctaBar = document.getElementById('ctaBar');
  var hero = document.getElementById('hero');

  if (ctaBar && hero) {
    if ('IntersectionObserver' in window) {
      var ctaObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ctaBar.classList.toggle('cta-bar--visible', !entry.isIntersecting);
          });
        },
        { threshold: 0, rootMargin: '-70% 0px 0px 0px' }
      );
      ctaObserver.observe(hero);
    } else {
      ctaBar.classList.add('cta-bar--visible');
    }
  }

  /* ---------- アンカーのスムーススクロール ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll('a[href^="#"]'),
    function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') {
          e.preventDefault();
          return;
        }
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      });
    }
  );
})();
