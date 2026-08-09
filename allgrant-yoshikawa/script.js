/* ==========================================================================
   ALL GRANT — demo site script
   すべてのアニメーションは transform / opacity / filter / clip-path のみを操作します。
   外部通信（fetch / XHR / WebSocket 等）は一切行いません。
   ========================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------------
   * 1. ヒーローの登場演出
   *    行ごとの見出し・サブコピー・CTAに時間差でトランジション遅延を設定し、
   *    2フレーム後に html.hero-play を付与して一斉に発火させる。
   * --------------------------------------------------------------------- */
  function initHero() {
    var els = document.querySelectorAll('.reveal-hero, .line');
    els.forEach(function (el) {
      var i = parseInt(el.getAttribute('data-hero-index') || '0', 10);
      el.style.setProperty('--delay', (i * 120) + 'ms');
    });

    if (prefersReduced) {
      document.documentElement.classList.add('hero-play');
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add('hero-play');
      });
    });
  }

  /* -----------------------------------------------------------------------
   * 2. スクロール連動の出現（IntersectionObserver + stagger）
   *    .reveal-group 内の .reveal 要素には出現順に 70ms 刻みの遅延を付与し、
   *    一度画面に入ったら監視を解除して戻さない。
   * --------------------------------------------------------------------- */
  function initReveal() {
    var groups = document.querySelectorAll('.reveal-group');
    groups.forEach(function (group) {
      var items = group.querySelectorAll('.reveal');
      items.forEach(function (el, i) {
        el.style.setProperty('--delay', (i * 70) + 'ms');
      });
    });

    var all = document.querySelectorAll('.reveal');

    if (prefersReduced || !('IntersectionObserver' in window)) {
      all.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    all.forEach(function (el) { io.observe(el); });
  }

  /* -----------------------------------------------------------------------
   * 3. 追従ヘッダー + 4. 固定CTAバーの出入り
   *    スクロール量に応じてヘッダーを縮小・不透明化。下スクロールで隠し、
   *    上スクロールで戻す。ヒーローを抜けたらCTAバーをせり上げる。
   * --------------------------------------------------------------------- */
  function initScrollUI() {
    var header = document.getElementById('siteHeader');
    var ctaBar = document.getElementById('ctaBar');
    var hero = document.getElementById('hero');
    if (!header) return;

    var lastY = window.scrollY || 0;
    var ticking = false;

    if (hero && ctaBar) {
      if ('IntersectionObserver' in window) {
        var heroIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            ctaBar.classList.toggle('is-visible', !entry.isIntersecting);
          });
        }, { threshold: 0.05 });
        heroIO.observe(hero);
      } else {
        ctaBar.classList.add('is-visible');
      }
    }

    function update() {
      var y = window.scrollY || 0;
      header.classList.toggle('is-scrolled', y > 40);

      if (y > lastY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* -----------------------------------------------------------------------
   * 5. 視差（パララックス）
   *    ヒーロー背景のラッパーとテキストで移動量を変える。requestAnimationFrame
   *    でまとめて処理し、ヒーローが画面外のときは計算を止めて負荷を抑える。
   * --------------------------------------------------------------------- */
  function initParallax() {
    if (prefersReduced) return;

    var hero = document.getElementById('hero');
    if (!hero) return;
    var media = hero.querySelector('.hero__media');
    var content = hero.querySelector('.hero__content');
    if (!media) return;

    var active = true;
    var ticking = false;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          active = entry.isIntersecting;
          media.style.willChange = active ? 'transform' : 'auto';
          if (content) content.style.willChange = active ? 'transform' : 'auto';
          if (!active) {
            media.style.transform = '';
            if (content) content.style.transform = '';
          }
        });
      }, { threshold: 0 });
      io.observe(hero);
    }

    function update() {
      if (active) {
        var y = window.scrollY || 0;
        media.style.transform = 'translate3d(0,' + (y * 0.32) + 'px,0)';
        if (content) content.style.transform = 'translate3d(0,' + (y * -0.06) + 'px,0)';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* -----------------------------------------------------------------------
   * init
   * --------------------------------------------------------------------- */
  function init() {
    initHero();
    initReveal();
    initScrollUI();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
