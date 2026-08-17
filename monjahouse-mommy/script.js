/* ==========================================================================
   お好み焼き・もんじゃハウス マミー デモサイト script.js
   外部通信は一切行いません（fetch / XHR / WebSocket なし）
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     0. ユーティリティ
     ------------------------------------------------------------------------ */
  function onScrollRaf(callback) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     1. ヒーロー登場演出（縦ワイプ→英字小見出し→大見出し→本文の多段フェード）
     ------------------------------------------------------------------------ */
  function initHeroEntrance() {
    // 初期表示直後に is-loaded を付与し、CSS 側の遅延トランジションを起動する
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.add('is-loaded');
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. ヒーローのパララックス＋沈み込み（スクロール連動）
     ------------------------------------------------------------------------ */
  function initHeroParallax() {
    var hero = document.getElementById('hero');
    var bgWrap = document.getElementById('hero-bg-wrap');
    if (!hero || !bgWrap || prefersReducedMotion) return;

    var heroHeight = hero.offsetHeight;
    var willChangeTimer = null;

    function update() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > heroHeight * 1.2) return; // ヒーローを大きく離れたら計算を止める
      var ratio = Math.min(scrollY / heroHeight, 1);
      var translate = ratio * 90; // 沈み込むような視差移動量
      bgWrap.style.transform = 'translateY(' + translate + 'px)';

      bgWrap.style.willChange = 'transform';
      if (willChangeTimer) clearTimeout(willChangeTimer);
      willChangeTimer = setTimeout(function () {
        bgWrap.style.willChange = 'auto';
      }, 250);
    }

    onScrollRaf(update);
    window.addEventListener('resize', function () {
      heroHeight = hero.offsetHeight;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     3. 追従ヘッダー（縮小・不透明化・下スクロールで隠す／上スクロールで戻す）
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var lastScrollY = window.pageYOffset || 0;
    var scrolledThreshold = 40;
    var hideThreshold = 120;
    var willChangeTimer = null;

    function update() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollY > scrolledThreshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      if (scrollY > hideThreshold && scrollY > lastScrollY) {
        header.classList.add('is-hidden');
      } else if (scrollY < lastScrollY) {
        header.classList.remove('is-hidden');
      }

      lastScrollY = scrollY;

      header.style.willChange = 'transform, background-color';
      if (willChangeTimer) clearTimeout(willChangeTimer);
      willChangeTimer = setTimeout(function () {
        header.style.willChange = 'auto';
      }, 300);
    }

    onScrollRaf(update);
    update();
  }

  /* ------------------------------------------------------------------------
     4. スクロール連動フェードアップ（data-reveal属性、60〜120msの時間差）
     ------------------------------------------------------------------------ */
  function initReveal() {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    // 同じ親要素内での出現順に応じてstaggerディレイを割り当てる
    var indexMap = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var idx = indexMap.get(parent) || 0;
      if (!prefersReducedMotion) {
        el.style.transitionDelay = (Math.min(idx, 6) * 90) + 'ms';
      }
      indexMap.set(parent, idx + 1);
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     5. メニュー価格のカウントアップ
     ------------------------------------------------------------------------ */
  function initPriceCountUp() {
    var priceEls = document.querySelectorAll('.price-number[data-count-to]');
    if (!priceEls.length) return;

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;

      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }

      var duration = 1200;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.round(target * eased);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      priceEls.forEach(animateCount);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    priceEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     6. 宴会プランセクションのオレンジ・ワイプ演出
     ------------------------------------------------------------------------ */
  function initPartyWipe() {
    var party = document.querySelector('.party');
    var conditionItems = document.querySelectorAll('.party-conditions li');
    if (!party) return;

    if (!prefersReducedMotion) {
      conditionItems.forEach(function (li, i) {
        li.style.transitionDelay = (300 + i * 130) + 'ms';
      });
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      party.classList.add('in-view');
      conditionItems.forEach(function (li) { li.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          party.classList.add('in-view');
          conditionItems.forEach(function (li) { li.classList.add('is-visible'); });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    observer.observe(party);
  }

  /* ------------------------------------------------------------------------
     7. 店内ギャラリーの横スクロール視差
     ------------------------------------------------------------------------ */
  function initGalleryParallax() {
    var track = document.getElementById('gallery-track');
    if (!track || prefersReducedMotion) return;

    var photos = track.querySelectorAll('.gallery-photo');
    var ticking = false;
    var willChangeTimer = null;

    function update() {
      var scrollLeft = track.scrollLeft;
      photos.forEach(function (photo, i) {
        var direction = i % 2 === 0 ? 1 : -1;
        var offset = scrollLeft * 0.06 * direction;
        photo.style.transform = 'translateX(' + offset + 'px)';
        photo.style.willChange = 'transform';
      });

      if (willChangeTimer) clearTimeout(willChangeTimer);
      willChangeTimer = setTimeout(function () {
        photos.forEach(function (photo) { photo.style.willChange = 'auto'; });
      }, 250);

      ticking = false;
    }

    track.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     8. 固定CTAバー（ヒーローを抜けたら下からせり上がり、以後は常時表示）
     ------------------------------------------------------------------------ */
  function initFixedCtaBar() {
    var bar = document.getElementById('fixed-cta-bar');
    var hero = document.getElementById('hero');
    if (!bar || !hero) return;

    if (!('IntersectionObserver' in window)) {
      bar.classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          bar.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '-80% 0px 0px 0px' });

    observer.observe(hero);
  }

  /* ------------------------------------------------------------------------
     初期化
     ------------------------------------------------------------------------ */
  function init() {
    initHeroEntrance();
    initHeroParallax();
    initHeader();
    initReveal();
    initPriceCountUp();
    initPartyWipe();
    initGalleryParallax();
    initFixedCtaBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
