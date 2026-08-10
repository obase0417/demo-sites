(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const mobileCta = document.querySelector('.mobile-cta');
  const hero = document.querySelector('.hero');
  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const pastHero = y > hero.offsetHeight - 110;
    header.classList.toggle('scrolled', y > 20);
    header.classList.toggle('hidden', y > lastY && y > 170);
    mobileCta.classList.toggle('visible', pastHero);
    if (!reduceMotion) {
      hero.style.setProperty('--parallax-y', `${Math.min(y * .14, 90)}px`);
      document.querySelectorAll('.gallery-photo').forEach((item) => {
        const rect = item.getBoundingClientRect();
        item.style.transform = `translateX(${(window.innerWidth / 2 - (rect.left + rect.width / 2)) * .035}px)`;
      });
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target.parentElement?.querySelectorAll('.reveal, .reveal-line') || [entry.target];
      const siblings = [...group].filter((el) => el === entry.target || entry.target.parentElement === el.parentElement);
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = `${Math.min(index * 90, 270)}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14 });
  document.querySelectorAll('.reveal, .reveal-line').forEach((el) => observer.observe(el));

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const start = performance.now();
      const duration = 850;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
        element.textContent = element.classList.contains('late-time') ? `${String(value).padStart(2, '0')}:00` : String(value).padStart(2, '0');
        if (progress < 1) requestAnimationFrame(tick);
      };
      if (!reduceMotion) requestAnimationFrame(tick); else element.textContent = element.classList.contains('late-time') ? '29:00' : String(target).padStart(2, '0');
      countObserver.unobserve(element);
    });
  }, { threshold: .45 });
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

  const gallery = document.querySelector('.gallery');
  let down = false, startX = 0, scrollLeft = 0;
  gallery.addEventListener('pointerdown', (event) => { down = true; startX = event.clientX; scrollLeft = gallery.scrollLeft; gallery.setPointerCapture(event.pointerId); });
  gallery.addEventListener('pointermove', (event) => { if (down) gallery.scrollLeft = scrollLeft - (event.clientX - startX); });
  ['pointerup', 'pointercancel'].forEach((type) => gallery.addEventListener(type, () => { down = false; }));
})();
