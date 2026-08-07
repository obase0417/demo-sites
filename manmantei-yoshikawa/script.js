/* ===================================================
   中華処 萬万亭 デモサイト script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   =================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------
     1. スクロール連動の出現（IntersectionObserver）
     ------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.willChange = 'opacity, transform, clip-path';
          el.classList.add('in-view');

          var cleared = false;
          var clearWillChange = function () {
            if (cleared) { return; }
            cleared = true;
            el.style.willChange = 'auto';
          };
          el.addEventListener('transitionend', clearWillChange, { once: true });
          window.setTimeout(clearWillChange, 1500);

          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* -------------------------------------------------
     2. 数字のカウントアップ
     ------------------------------------------------- */
  var statNums = Array.prototype.slice.call(document.querySelectorAll('.stat__num'));

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;

    if (reduceMotion) {
      el.textContent = target.toLocaleString('ja-JP');
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) { start = timestamp; }
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = easeOutCubic(progress);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString('ja-JP');
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statNums.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statNums.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNums.forEach(function (el) {
      el.textContent = (parseInt(el.getAttribute('data-target'), 10) || 0).toLocaleString('ja-JP');
    });
  }

  /* -------------------------------------------------
     3. 追従ヘッダー / パララックス / CTAバー
        （scroll は passive、処理は requestAnimationFrame でまとめる）
     ------------------------------------------------- */
  var header = document.getElementById('site-header');
  var heroBgWrap = document.getElementById('hero-bg-wrap');
  var hero = document.getElementById('hero');
  var ctaBar = document.getElementById('cta-bar');
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.parallax'));

  var lastScrollY = window.scrollY || 0;
  var ticking = false;
  var heroHeight = hero ? hero.offsetHeight : 0;

  window.addEventListener('resize', function () {
    heroHeight = hero ? hero.offsetHeight : 0;
  }, { passive: true });

  function updateHeader(scrollY) {
    if (!header) { return; }

    if (scrollY > 24) {
      header.classList.add('site-header--solid');
    } else {
      header.classList.remove('site-header--solid');
    }

    if (scrollY > heroHeight * 0.9 && scrollY > lastScrollY) {
      header.classList.add('site-header--hidden');
    } else if (scrollY < lastScrollY) {
      header.classList.remove('site-header--hidden');
    }
  }

  function updateParallax(scrollY) {
    if (reduceMotion) { return; }

    if (heroBgWrap) {
      var heroOffset = scrollY * 0.32;
      heroBgWrap.style.transform = 'translate3d(0,' + heroOffset + 'px,0)';
    }

    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.12;
      var rect = el.getBoundingClientRect();
      var viewportCenter = window.innerHeight / 2;
      var elCenter = rect.top + rect.height / 2;
      var distance = (elCenter - viewportCenter) * speed;
      el.style.transform = 'translate3d(0,' + distance + 'px,0)';
    });
  }

  function update() {
    var scrollY = window.scrollY || window.pageYOffset;

    updateHeader(scrollY);
    updateParallax(scrollY);

    lastScrollY = scrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  /* -------------------------------------------------
     4. 固定CTAバーの出入り（ヒーローを抜けたら表示）
     ------------------------------------------------- */
  if ('IntersectionObserver' in window && hero && ctaBar) {
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          ctaBar.classList.remove('cta-bar--visible');
        } else {
          ctaBar.classList.add('cta-bar--visible');
        }
      });
    }, { threshold: 0, rootMargin: '-60% 0px -10% 0px' });

    ctaObserver.observe(hero);
  } else if (ctaBar) {
    ctaBar.classList.add('cta-bar--visible');
  }
})();
