(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- フェードイン ---------------- */
  const revealTargets = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- ヘッダー：ヒーロー通過で色反転 ---------------- */
  const header = document.getElementById("siteHeader");
  const hero = document.getElementById("hero");

  if (header && hero && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          header.classList.toggle("is-scrolled", !entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    headerObserver.observe(hero);
  }

  /* ---------------- ナビ開閉 ---------------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "メニューを開く");
      });
    });
  }

  /* ---------------- 固定CTAバー：フッター手前で退避 ---------------- */
  const ctaBar = document.getElementById("ctaBar");
  const footer = document.querySelector(".site-footer");

  if (ctaBar && footer && "IntersectionObserver" in window) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ctaBar.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );
    ctaObserver.observe(footer);
  }
})();
