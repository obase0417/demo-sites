/* =========================================================
   MooNnail（ムーンネイル） デモサイト script.js
   外部通信は一切行いません（fetch/XHR/WebSocket/外部スクリプト無し）
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- LINEリンク（デモのため未設定）のクリック抑止 ---------- */
  var lineLinks = document.querySelectorAll('[data-line-link]');
  lineLinks.forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.getAttribute('href') === '#') {
        e.preventDefault();
      }
    });
  });

  /* ---------- ヒーローの登場演出 ---------- */
  var hero = document.getElementById('hero');
  function startHero() {
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('hero-in');
      });
    });
  }
  if (document.readyState === 'complete') {
    startHero();
  } else {
    window.addEventListener('load', startHero);
    // フォールバック：読み込みが遅い場合も一定時間で開始
    setTimeout(startHero, 1200);
  }

  /* ---------- スクロール連動の出現（IntersectionObserver） ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  // グループ内での時間差（stagger）を設定
  var groups = document.querySelectorAll('[data-reveal-group]');
  groups.forEach(function (group) {
    var items = group.querySelectorAll('.reveal');
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target); // 一度出たら戻さない
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 追従ヘッダー & 固定CTAバー & パララックス ---------- */
  var header = document.getElementById('siteHeader');
  var ctaBar = document.getElementById('ctaBar');
  var parallaxEls = document.querySelectorAll('[data-parallax]');

  if (!reduceMotion) {
    var lastY = window.scrollY || 0;
    var ticking = false;
    var scrollStopTimer = null;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    function update() {
      var y = window.scrollY || 0;

      // 追従ヘッダー：下スクロールで隠し、上スクロールで戻す
      if (header) {
        if (y > 60) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        if (y > lastY && y > 140) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }
      }

      // 固定CTAバー：ヒーローを抜けたら表示
      if (ctaBar && hero) {
        var heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 80) {
          ctaBar.classList.add('is-visible');
        } else {
          ctaBar.classList.remove('is-visible');
        }
      }

      // パララックス（transformのみを操作）
      parallaxEls.forEach(function (el) {
        el.style.willChange = 'transform';
        var speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
        var rect = el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });

      lastY = y;
      ticking = false;

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(function () {
        parallaxEls.forEach(function (el) { el.style.willChange = 'auto'; });
      }, 250);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  } else {
    // reduced motion: ヘッダーは常時表示、CTAバーはヒーロー通過後は常に表示のみ切り替え（動きなし）
    if (ctaBar && hero) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            ctaBar.classList.add('is-visible');
          } else {
            ctaBar.classList.remove('is-visible');
          }
        });
      }, { threshold: 0 });
      io2.observe(hero);
    }
  }

})();
