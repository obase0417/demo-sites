(function () {
  'use strict';

  /* -------------------------------------------------------
     0. respect prefers-reduced-motion: reduce
  ------------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     1. scoped stagger delays for [data-reveal] siblings
  ------------------------------------------------------- */
  function assignStaggerDelays() {
    var groups = new Map();
    var els = document.querySelectorAll('[data-reveal]');
    els.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(function (list) {
      list.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
      });
    });
  }

  /* -------------------------------------------------------
     2. IntersectionObserver scroll reveal
  ------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------------
     3. header: shrink / hide on scroll
  ------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var lastY = window.scrollY || 0;
    var ticking = false;

    function update() {
      var y = window.scrollY || 0;
      if (y > 40) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');

      if (y > lastY && y > 160) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* -------------------------------------------------------
     4. mobile nav toggle
  ------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('is-open');
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) close(); else open();
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) close();
    }, { passive: true });
  }

  /* -------------------------------------------------------
     5. fixed CTA bar: appears once hero is left
  ------------------------------------------------------- */
  function initCtaBar() {
    var bar = document.getElementById('ctaBar');
    var hero = document.getElementById('hero');
    if (!bar || !hero) return;

    if (!('IntersectionObserver' in window)) {
      bar.classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          bar.classList.remove('is-visible');
        } else {
          bar.classList.add('is-visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(hero);
  }

  /* -------------------------------------------------------
     6. parallax on [data-parallax] elements (rAF batched)
  ------------------------------------------------------- */
  function initParallax() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!targets.length || prefersReducedMotion) return;

    var ticking = false;
    var idleTimer = null;

    function setWillChange(on) {
      targets.forEach(function (el) {
        el.style.willChange = on ? 'transform' : 'auto';
      });
    }

    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      targets.forEach(function (el) {
        var wrap = el.parentElement;
        var rect = wrap.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var progress = (center - vh / 2) / vh; // roughly -1..1
        var offset = Math.max(-1, Math.min(1, progress)) * 26; // px
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
      ticking = false;
    }

    function onScroll() {
      setWillChange(true);
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { setWillChange(false); }, 260);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* -------------------------------------------------------
     7. hero entrance: kick in reveal immediately (hero is
        already in viewport on load, so the shared reveal
        system fires right away via the observer above).
        Here we just make sure the kenburns animation only
        plays when motion is allowed.
  ------------------------------------------------------- */
  function initHero() {
    var media = document.querySelector('.hero-media');
    if (!media) return;
    if (prefersReducedMotion) {
      media.style.animation = 'none';
      media.style.transform = 'none';
    }
  }

  /* -------------------------------------------------------
     init
  ------------------------------------------------------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    assignStaggerDelays();
    initReveal();
    initHeader();
    initNav();
    initCtaBar();
    initParallax();
    initHero();
  });
})();
