/* =========================================================
   居酒屋やっちゃば（吉川店） デモサイト — script.js
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var fixedTop   = document.getElementById('fixedTop');
  var siteHeader = document.getElementById('siteHeader');
  var hero       = document.getElementById('hero');
  var heroParallax = document.getElementById('heroParallax');
  var ctaBar     = document.getElementById('ctaBar');
  var body       = document.body;

  /* ---------------------------------------------------
     0. fixed-top の高さぶんだけ本文をオフセット
  --------------------------------------------------- */
  function syncFixedTopOffset() {
    if (!fixedTop) return;
    var h = fixedTop.offsetHeight;
    document.documentElement.style.setProperty('--fixed-top-h', h + 'px');
    body.style.paddingTop = h + 'px';
  }

  /* ---------------------------------------------------
     1. ヒーローの登場演出
  --------------------------------------------------- */
  function playHeroIntro() {
    if (!hero) return;
    // 1フレーム待ってからクラスを付け、CSSトランジションを確実に発火させる
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-loaded');
      });
    });
  }

  /* ---------------------------------------------------
     2. スクロール連動の出現（IntersectionObserver）
        セクションごとに要素へ time-difference（stagger）を付与
  --------------------------------------------------- */
  function setupRevealStagger() {
    var groups = document.querySelectorAll('.section, .hero');
    groups.forEach(function (group) {
      var items = group.querySelectorAll(':scope > .reveal-item, :scope .menu__grid .reveal-item, :scope .about__list .reveal-item');
      var index = 0;
      items.forEach(function (el) {
        if (!el.style.transitionDelay) {
          var delay = Math.min(index * 90, 360);
          el.style.transitionDelay = delay + 'ms';
          index++;
        }
      });
    });
  }

  function setupRevealObserver() {
    var items = document.querySelectorAll('.reveal-item');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------
     3. 視差（パララックス） — rAF でまとめて処理
  --------------------------------------------------- */
  var parallaxTargets = [];
  function setupParallax() {
    if (reduceMotion) return;
    var nodes = document.querySelectorAll('[data-parallax-factor]');
    parallaxTargets = Array.prototype.map.call(nodes, function (el) {
      return { el: el, factor: parseFloat(el.getAttribute('data-parallax-factor')) || 0.05 };
    });
    if (heroParallax) {
      parallaxTargets.push({ el: heroParallax, factor: 0.12 });
    }
  }

  function updateParallax() {
    if (reduceMotion || !parallaxTargets.length) return;
    var viewportH = window.innerHeight;
    parallaxTargets.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();
      var center = rect.top + rect.height / 2 - viewportH / 2;
      var shift = center * item.factor * -1;
      item.el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    });
  }

  /* ---------------------------------------------------
     4. 追従ヘッダー — 縮小・背景不透明化・隠す/戻す
  --------------------------------------------------- */
  var lastScrollY = 0;
  var heroBottom = 0;

  function measureHero() {
    if (hero) heroBottom = hero.offsetTop + hero.offsetHeight;
  }

  function updateHeader() {
    var y = window.scrollY || window.pageYOffset;
    if (!fixedTop) return;

    fixedTop.classList.toggle('is-compact', y > 40);

    if (y > heroBottom) {
      if (y > lastScrollY) {
        fixedTop.classList.add('is-hidden');
      } else {
        fixedTop.classList.remove('is-hidden');
      }
    } else {
      fixedTop.classList.remove('is-hidden');
    }
    lastScrollY = y < 0 ? 0 : y;
  }

  /* ---------------------------------------------------
     6. 固定CTAバーの出入り — ヒーローを抜けたら表示
  --------------------------------------------------- */
  function setupCtaBarVisibility() {
    if (!ctaBar || !hero) return;
    if (!('IntersectionObserver' in window)) {
      ctaBar.classList.add('is-visible');
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ctaBar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-60% 0px 0px 0px' });
    observer.observe(hero);
  }

  /* ---------------------------------------------------
     rAF ループ（スクロール／リサイズをまとめて処理）
  --------------------------------------------------- */
  var ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader();
      updateParallax();
      ticking = false;
    });
  }

  /* ---------------------------------------------------
     デモ未設定リンク（LINE）のクリック時ガイド表示
  --------------------------------------------------- */
  function setupDemoDisabledLinks() {
    var links = document.querySelectorAll('[data-demo-disabled="true"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var existing = link.querySelector('.demo-disabled-tip');
        if (existing) return;
        var tip = document.createElement('span');
        tip.className = 'demo-disabled-tip';
        tip.textContent = '※ デモのためリンク先は未設定です';
        tip.style.cssText = [
          'position:absolute', 'left:50%', 'bottom:100%', 'transform:translate(-50%,-8px)',
          'background:#241B14', 'color:#F2E8D5', 'font-size:11px', 'padding:6px 10px',
          'border-radius:4px', 'white-space:nowrap', 'pointer-events:none'
        ].join(';');
        link.style.position = 'relative';
        link.appendChild(tip);
        window.setTimeout(function () {
          if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
        }, 2200);
      });
    });
  }

  /* ---------------------------------------------------
     init
  --------------------------------------------------- */
  function init() {
    syncFixedTopOffset();
    measureHero();
    setupRevealStagger();
    setupRevealObserver();
    setupParallax();
    setupCtaBarVisibility();
    setupDemoDisabledLinks();
    playHeroIntro();
    updateParallax();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', function () {
      syncFixedTopOffset();
      measureHero();
      onScrollOrResize();
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
