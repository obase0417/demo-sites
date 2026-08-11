(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const cta = document.querySelector('.mobile-cta');
  const hero = document.querySelector('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousY = window.scrollY;
  let ticking = false;

  const reveal = () => {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.willChange = 'transform, opacity';
        entry.target.classList.add('is-visible');
        window.setTimeout(() => { entry.target.style.willChange = 'auto'; }, 800);
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    document.querySelectorAll('.reveal, .stagger').forEach((element) => observer.observe(element));
  };

  const updateScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    header.classList.toggle('hidden', y > previousY && y > 180);
    cta.classList.toggle('show', y > Math.max(50, hero.offsetHeight - 80));
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      const speed = Number(element.dataset.parallax);
      element.style.transform = `translate3d(0, ${Math.min(y * speed, 46)}px, 0)`;
    });
    previousY = y;
    ticking = false;
  };

  if (!reduceMotion) reveal();
  else document.querySelectorAll('.reveal, .stagger').forEach((element) => element.classList.add('is-visible'));
  updateScroll();
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });
  root.classList.add('ready');
})();
