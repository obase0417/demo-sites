/* =========================================================
   solo design hair（ソロデザイン） demo site script
   外部通信は一切行いません（fetch / XHR / WebSocket 不使用）
   ========================================================= */
(function () {
  "use strict";

  var reduceMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = reduceMotionMQ.matches;

  /* ---------------------------------------------------------
     1. スクロール連動の出現（IntersectionObserver + stagger）
  --------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function applyDelay(el) {
    var delay = el.getAttribute("data-delay");
    if (delay) {
      el.style.transitionDelay = delay + "ms";
    }
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    revealEls.forEach(applyDelay);

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------
     2. 追従ヘッダー（縮小・背景不透明化・下スクロールで隠す）
     3. パララックス（ヒーロー背景）
     4. 固定CTAバーの出入り
     — スクロール処理は rAF に集約
  --------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  var ctaBar = document.getElementById("ctaBar");
  var hero = document.getElementById("hero");
  var heroBg = hero ? hero.querySelector("[data-parallax]") : null;

  var lastY = window.scrollY || 0;
  var ticking = false;
  var heroPassed = false;

  function updateHeader(y) {
    if (!header) return;
    if (y > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
    if (y > lastY && y > 120) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }
  }

  function updateParallax(y) {
    if (!heroBg || prefersReduced) return;
    var factor = parseFloat(heroBg.getAttribute("data-parallax")) || 0.2;
    var heroHeight = hero.offsetHeight || window.innerHeight;
    if (y < heroHeight * 1.2) {
      heroBg.style.transform = "translate3d(0," + (y * factor * -1) + "px,0)";
    }
  }

  function updateCtaBar(y) {
    if (!ctaBar || !hero) return;
    var heroBottom = hero.offsetTop + hero.offsetHeight;
    var shouldShow = y > heroBottom - window.innerHeight * 0.6;
    if (shouldShow !== heroPassed) {
      heroPassed = shouldShow;
      ctaBar.classList.toggle("is-visible", shouldShow);
    }
  }

  function onScrollFrame() {
    var y = window.scrollY || window.pageYOffset || 0;
    updateHeader(y);
    updateParallax(y);
    updateCtaBar(y);
    lastY = y;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    function () {
      onScrollFrame();
    },
    { passive: true }
  );

  /* will-change: パララックス対象にだけ、動く直前に付与し続ける必要はないため
     スクロール開始/終了で付け外しする（負荷対策） */
  var willChangeTimer = null;
  window.addEventListener(
    "scroll",
    function () {
      if (!heroBg) return;
      heroBg.style.willChange = "transform";
      window.clearTimeout(willChangeTimer);
      willChangeTimer = window.setTimeout(function () {
        heroBg.style.willChange = "auto";
      }, 220);
    },
    { passive: true }
  );

  /* 初期状態を反映 */
  onScrollFrame();

  /* ---------------------------------------------------------
     5. ヒーロー登場演出の起動
     CSS側の line-mask / kenburns は読み込み後すぐ開始してよいが、
     フォント読み込み待ちで揃うように 'ready' クラスを付与するだけに留める
  --------------------------------------------------------- */
  window.addEventListener("load", function () {
    document.documentElement.classList.add("ready");
  });

  /* ---------------------------------------------------------
     6. ナビゲーションのスムーススクロール（同一ページ内アンカー）
  --------------------------------------------------------- */
  var navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
      window.scrollTo({
        top: top,
        behavior: prefersReduced ? "auto" : "smooth",
      });
    });
  });

  /* ---------------------------------------------------------
     reduced-motion の変化を実行時にも反映
  --------------------------------------------------------- */
  reduceMotionMQ.addEventListener &&
    reduceMotionMQ.addEventListener("change", function (e) {
      prefersReduced = e.matches;
      if (prefersReduced) {
        revealEls.forEach(function (el) {
          el.classList.add("in-view");
        });
      }
    });
})();
