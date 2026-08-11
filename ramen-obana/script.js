(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  const cta = document.querySelector('.mobile-cta');
  let lastY = 0;
  let ticking = false;

  window.addEventListener('load', () => hero.classList.add('is-ready'), { once: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll(':scope > .reveal')];
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = `${Math.min(index * 90, 270)}ms`;
      entry.target.classList.add('is-visible');
      entry.target.addEventListener('transitionend', () => {
        entry.target.style.willChange = 'auto';
      }, { once: true });
      entry.target.style.willChange = 'transform, opacity';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach((number) => {
        const target = Number(number.dataset.count);
        const duration = reducedMotion ? 1 : 900;
        const start = performance.now();
        const update = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          number.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      });
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  const stats = document.querySelector('.stats');
  if (stats) countObserver.observe(stats);

  const updateScroll = () => {
    const y = window.scrollY;
    const pastHero = y > window.innerHeight * 0.72;
    header.classList.toggle('is-solid', pastHero);
    header.classList.toggle('is-hidden', y > lastY && y > 180);
    cta.classList.toggle('is-visible', pastHero);
    if (!reducedMotion) {
      document.querySelectorAll('.parallax-photo').forEach((photo) => {
        const rect = photo.parentElement.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.055;
        photo.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });
  updateScroll();
})();
