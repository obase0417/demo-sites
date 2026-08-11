(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const faces = document.querySelector('.faces');
  const bar = document.querySelector('.bar');
  const mobileCta = document.querySelector('.mobile-cta');
  let lastY = 0;
  let ticking = false;

  const heroEyebrow = document.querySelector('.hero-eyebrow span');
  if (heroEyebrow) {
    const label = heroEyebrow.textContent;
    heroEyebrow.setAttribute('aria-hidden', 'true');
    heroEyebrow.innerHTML = [...label].map((letter, index) =>
      `<span class="hero-letter" style="--letter-index:${index}">${letter === ' ' ? '&nbsp;' : letter}</span>`
    ).join('');
  }

  window.addEventListener('load', () => root.classList.add('is-ready'), { once: true });

  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]')];
      entry.target.style.setProperty('--delay', `${Math.max(0, siblings.indexOf(entry.target)) * 90}ms`);
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  revealItems.forEach((item) => revealObserver.observe(item));

  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const state = entry.target.dataset.faceStory;
      document.querySelectorAll('.face-label').forEach((label) => label.classList.toggle('is-active', label.dataset.face === state));
    });
  }, { threshold: .55 });
  document.querySelectorAll('[data-face-story]').forEach((story) => storyObserver.observe(story));

  const updateScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > lastY && y > 180);
    mobileCta.classList.toggle('is-visible', y > hero.offsetHeight * .72);
    const faceRect = faces.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -faceRect.top / Math.max(1, faces.offsetHeight - innerHeight)));
    faces.classList.toggle('is-night', progress > .52);
    const barRect = bar.getBoundingClientRect();
    const offset = Math.max(-12, Math.min(12, (innerHeight / 2 - (barRect.top + barRect.height / 2)) * .035));
    bar.style.setProperty('--bar-pos', `${offset}%`);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
})();
