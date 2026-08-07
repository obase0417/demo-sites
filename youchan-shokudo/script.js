/* =========================================================
   博多ラーメン 洋ちゃん食堂 — デモサイト script.js
   外部通信なし（fetch/XHR/WebSocket/外部スクリプト読込は行わない）
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------
     1. ヒーローの登場演出
  --------------------------------------------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    if (reduceMotion) {
      hero.classList.add('hero--ready');
    } else {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          hero.classList.add('hero--ready');
        });
      });
    }
  }

  /* ---------------------------------------------
     2. スクロール連動の出現（IntersectionObserver + stagger）
  --------------------------------------------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal], .kodawari__media')
  );

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      // セクション単位でグルーピングし、出現順に60〜120msの時間差をつける
      var groupCounters = {};
      revealEls.forEach(function (el) {
        var section = el.closest('section, .marquee, main > *');
        var key = section ? (section.id || section.className || 'group') : 'default';
        groupCounters[key] = groupCounters[key] || 0;
        var index = groupCounters[key]++;
        el.style.transitionDelay = Math.min(index * 90, 540) + 'ms';
      });

      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
      );

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------------------------------------------
     3. 追従ヘッダー（縮小・不透明化・下スクロールで隠す）
  --------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var lastScrollY = window.scrollY;
  var headerTicking = false;

  function updateHeader() {
    var y = window.scrollY;
    if (header) {
      if (y > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      if (y > lastScrollY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastScrollY = y;
    headerTicking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!headerTicking) {
        window.requestAnimationFrame(updateHeader);
        headerTicking = true;
      }
    },
    { passive: true }
  );

  /* ---------------------------------------------
     4. 固定CTAバーの出入り（ヒーローを抜けたら表示）
  --------------------------------------------- */
  var ctaBar = document.querySelector('[data-cta-bar]');
  if (ctaBar && hero) {
    if ('IntersectionObserver' in window) {
      var ctaObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              ctaBar.classList.remove('is-visible');
            } else {
              ctaBar.classList.add('is-visible');
            }
          });
        },
        { threshold: 0 }
      );
      ctaObserver.observe(hero);
    } else {
      ctaBar.classList.add('is-visible');
    }
  }

  /* ---------------------------------------------
     5. 視差（パララックス） — rAFでまとめて処理
  --------------------------------------------- */
  if (!reduceMotion) {
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

    if (parallaxEls.length) {
      var inViewMap = new WeakMap();

      if ('IntersectionObserver' in window) {
        var parallaxObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              inViewMap.set(entry.target, entry.isIntersecting);
            });
          },
          { threshold: 0 }
        );
        parallaxEls.forEach(function (el) {
          inViewMap.set(el, false);
          parallaxObserver.observe(el);
        });
      } else {
        parallaxEls.forEach(function (el) { inViewMap.set(el, true); });
      }

      var parallaxActive = false;

      function runParallax() {
        var anyInView = false;
        parallaxEls.forEach(function (el) {
          if (!inViewMap.get(el)) return;
          anyInView = true;
          var rect = el.getBoundingClientRect();
          var center = rect.top + rect.height / 2 - window.innerHeight / 2;
          var factor = parseFloat(el.getAttribute('data-parallax-factor') || '0.12');
          el.style.willChange = 'transform';
          el.style.transform = 'translateY(' + (center * factor * -1) + 'px)';
        });
        if (anyInView) {
          window.requestAnimationFrame(runParallax);
        } else {
          parallaxActive = false;
          parallaxEls.forEach(function (el) { el.style.willChange = ''; });
        }
      }

      function kickParallax() {
        if (!parallaxActive) {
          parallaxActive = true;
          window.requestAnimationFrame(runParallax);
        }
      }

      window.addEventListener('scroll', kickParallax, { passive: true });
      kickParallax();
    }
  }
})();
