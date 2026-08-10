(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
   * 1. Staggered scroll-reveal via IntersectionObserver
   * ------------------------------------------------------------------ */
  const initStagger = () => {
    document.querySelectorAll('[data-stagger-group]').forEach((group) => {
      const items = group.querySelectorAll('[data-reveal]');
      items.forEach((el, i) => {
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = `${i * 90}ms`;
        }
      });
    });
  };

  const initReveal = () => {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || prefersReduced) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  };

  /* ------------------------------------------------------------------
   * 2. Hero entrance — time-based, staggered on load
   * ------------------------------------------------------------------ */
  const initHero = () => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hero.classList.add('is-ready');
      });
    });
  };

  /* ------------------------------------------------------------------
   * 3. Fixed header — shrink on scroll, hide on scroll-down, show on scroll-up
   * ------------------------------------------------------------------ */
  const initHeader = () => {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      if (y > lastY && y > window.innerHeight * 0.6) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  };

  /* ------------------------------------------------------------------
   * 4. Fixed bottom CTA bar — appears once the hero is scrolled past
   * ------------------------------------------------------------------ */
  const initCtaBar = () => {
    const bar = document.querySelector('[data-cta-bar]');
    const hero = document.querySelector('[data-hero]');
    if (!bar || !hero) return;

    if (!('IntersectionObserver' in window)) {
      bar.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          bar.classList.toggle('is-visible', !entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-70% 0px 0px 0px' }
    );
    io.observe(hero);
  };

  /* ------------------------------------------------------------------
   * 5. Parallax — hero background & content drift at different rates
   * ------------------------------------------------------------------ */
  const initParallax = () => {
    if (prefersReduced) return;
    const media = document.querySelector('[data-parallax-media]');
    const content = document.querySelector('[data-parallax-content]');
    const hero = document.querySelector('[data-hero]');
    if (!media || !hero) return;

    let ticking = false;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const heroHeight = rect.height || window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1.4);

      media.style.willChange = 'transform';
      media.style.transform = `translateY(${progress * 60}px)`;

      if (content) {
        content.style.willChange = 'transform, opacity';
        content.style.transform = `translateY(${progress * -24}px)`;
        content.style.opacity = String(Math.max(1 - progress * 1.1, 0));
      }
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  };

  /* ------------------------------------------------------------------
   * init
   * ------------------------------------------------------------------ */
  const start = () => {
    initStagger();
    initReveal();
    initHero();
    initHeader();
    initCtaBar();
    initParallax();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
