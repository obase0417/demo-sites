/* =========================================================
   刺身・地場野菜 よしだ家 デモサイト script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     1. 固定バナー／ヘッダーの実高さを計測して CSS 変数へ反映
     --------------------------------------------------- */
  var banner = document.querySelector('.demo-banner');
  var header = document.querySelector('.site-header');

  function syncFixedHeights() {
    if (banner) {
      root.style.setProperty('--banner-h', banner.offsetHeight + 'px');
    }
    if (header) {
      root.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
  }
  syncFixedHeights();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncFixedHeights, 150);
  }, { passive: true });

  /* ---------------------------------------------------
     2. 追従ヘッダー：スクロール量で背景クロスフェード＋
        下スクロールで隠す／上スクロールで戻す
     --------------------------------------------------- */
  var lastScrollY = window.scrollY || 0;
  var headerTicking = false;
  var SCROLL_SOLID_THRESHOLD = 60;

  function updateHeader() {
    var y = window.scrollY || 0;

    if (header) {
      if (y > SCROLL_SOLID_THRESHOLD) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }

      if (y > lastScrollY && y > window.innerHeight * 0.6) {
        header.classList.add('site-header--hidden');
      } else {
        header.classList.remove('site-header--hidden');
      }
    }

    lastScrollY = y;
    headerTicking = false;
  }

  function onScrollForHeader() {
    if (!headerTicking) {
      headerTicking = true;
      window.requestAnimationFrame(updateHeader);
    }
  }
  updateHeader();
  window.addEventListener('scroll', onScrollForHeader, { passive: true });

  /* ---------------------------------------------------
     3. ヒーロー登場演出：藍の幕ワイプ → 縦組み見出し立ち上げ
        → eyebrow / コピーのフェードイン
     --------------------------------------------------- */
  var hero = document.querySelector('.hero');

  function playHeroIntro() {
    if (!hero) return;
    if (reduceMotion) {
      hero.classList.add('hero--curtain-open', 'hero--revealed');
      return;
    }
    window.requestAnimationFrame(function () {
      setTimeout(function () {
        hero.classList.add('hero--curtain-open');
      }, 150);
      setTimeout(function () {
        hero.classList.add('hero--revealed');
      }, 550);
    });
  }
  playHeroIntro();

  /* ---------------------------------------------------
     4. スクロール連動の出現（IntersectionObserver）
        .reveal / .reveal-clip 要素に is-visible を付与
        一度出たら戻さない
     --------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    var clipTitle = document.querySelector('.craftsmanship__title');
    if (clipTitle) {
      revealObserver.observe(clipTitle);
    }

    /* メニュー項目：60〜120ms の時間差で順番にフェードアップ */
    var menuList = document.getElementById('menuList');
    if (menuList) {
      var menuItems = menuList.querySelectorAll('li');
      var menuObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            menuItems.forEach(function (item, i) {
              item.style.transitionDelay = (i * 90) + 'ms';
              item.classList.add('is-visible');
            });
            obs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      menuObserver.observe(menuList);
    }
  } else {
    /* IntersectionObserver 非対応環境のフォールバック：即表示 */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    var fallbackTitle = document.querySelector('.craftsmanship__title');
    if (fallbackTitle) fallbackTitle.classList.add('is-visible');
  }

  /* ---------------------------------------------------
     5. 視差（パララックス）
        data-parallax を持つ要素を、所属セクションの
        スクロール進捗に応じて transform: translateY で動かす
     --------------------------------------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var visibleParallaxEls = [];

  if (parallaxEls.length && !reduceMotion) {
    if ('IntersectionObserver' in window) {
      var parallaxVisibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var idx = visibleParallaxEls.indexOf(entry.target);
          if (entry.isIntersecting) {
            entry.target.style.willChange = 'transform';
            if (idx === -1) visibleParallaxEls.push(entry.target);
          } else {
            entry.target.style.willChange = 'auto';
            if (idx !== -1) visibleParallaxEls.splice(idx, 1);
          }
        });
      }, { rootMargin: '20% 0px 20% 0px' });

      parallaxEls.forEach(function (el) {
        parallaxVisibilityObserver.observe(el);
      });
    } else {
      visibleParallaxEls = parallaxEls;
    }

    var parallaxTicking = false;

    function updateParallax() {
      var vh = window.innerHeight;
      visibleParallaxEls.forEach(function (el) {
        var container = el.parentElement;
        var rect = container.getBoundingClientRect();
        var total = rect.height + vh;
        var progress = 1 - Math.min(Math.max(rect.bottom / total, 0), 1);
        var amplitude = parseFloat(el.getAttribute('data-parallax-amp')) || 40;
        var offset = (progress - 0.5) * amplitude;
        el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
      });
      parallaxTicking = false;
    }

    function onScrollForParallax() {
      if (!parallaxTicking) {
        parallaxTicking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }

    updateParallax();
    window.addEventListener('scroll', onScrollForParallax, { passive: true });
    window.addEventListener('resize', onScrollForParallax, { passive: true });
  }

  /* ---------------------------------------------------
     6. 固定CTAバー（スマホ）：読み込み後にスライドインで登場
     --------------------------------------------------- */
  var ctaBar = document.getElementById('ctaBar');
  if (ctaBar) {
    if (reduceMotion) {
      ctaBar.classList.add('is-visible');
    } else {
      setTimeout(function () {
        ctaBar.classList.add('is-visible');
      }, 900);
    }
  }

})();
