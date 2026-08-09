(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     ヘッダー：スクロールで縮小／下スクロールで隠す・上スクロールで戻す
     ========================================================== */
  var header = document.getElementById("siteHeader");
  var lastScrollY = window.scrollY || 0;
  var headerTicking = false;

  function updateHeader() {
    var y = window.scrollY || 0;

    if (y > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }

    if (!reducedMotion) {
      if (y > lastScrollY && y > 160) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }

    lastScrollY = y;
    headerTicking = false;
  }

  function onScrollHeader() {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  }

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  updateHeader();

  /* ==========================================================
     スクロール連動の出現（IntersectionObserver + stagger）
     ========================================================== */
  var revealGroups = {};
  document.querySelectorAll(".reveal").forEach(function (el) {
    var section = el.closest("section") || document.body;
    var key = section.id || "default";
    if (!revealGroups[key]) revealGroups[key] = [];
    revealGroups[key].push(el);
  });

  Object.keys(revealGroups).forEach(function (key) {
    revealGroups[key].forEach(function (el, index) {
      el.style.transitionDelay = reducedMotion ? "0ms" : (index * 90) + "ms";
    });
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ==========================================================
     視差（パララックス） — rAFでまとめて処理
     ========================================================== */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  var parallaxTicking = false;

  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.15;
      var center = rect.top + rect.height / 2 - vh / 2;
      var offset = center * speed * -1;
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
    parallaxTicking = false;
  }

  function onScrollParallax() {
    if (!parallaxTicking) {
      window.requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }

  if (!reducedMotion && parallaxEls.length) {
    if ("IntersectionObserver" in window) {
      var parallaxObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.willChange = "transform";
            } else {
              entry.target.style.willChange = "auto";
            }
          });
        },
        { threshold: 0 }
      );
      parallaxEls.forEach(function (el) { parallaxObserver.observe(el); });
    }

    window.addEventListener("scroll", onScrollParallax, { passive: true });
    updateParallax();
  }

  /* ==========================================================
     固定CTAバー — ヒーローを抜けたら出現
     ========================================================== */
  var ctaBar = document.getElementById("ctaBar");
  var heroEl = document.getElementById("hero");

  if (ctaBar && heroEl && "IntersectionObserver" in window) {
    var ctaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          ctaBar.classList.toggle("is-visible", scrolledPast);
        });
      },
      { threshold: 0 }
    );
    ctaObserver.observe(heroEl);
  } else if (ctaBar) {
    ctaBar.classList.add("is-visible");
  }

  /* ==========================================================
     ナビゲーションのスムーススクロール（ヘッダー高さを考慮）
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top: top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });
})();
