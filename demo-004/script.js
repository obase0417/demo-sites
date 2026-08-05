// フェードイン（IntersectionObserver）
const revealEls = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// フォーム送信抑止（デモのため）
const dummyForm = document.getElementById('dummy-form');
if (dummyForm) {
  dummyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const note = dummyForm.querySelector('.form-note');
    if (note) {
      note.hidden = false;
      note.textContent = 'このフォームはデモのため送信されません。実際のお問い合わせはお電話またはInstagramのDMをご利用ください。';
      if (typeof note.focus === 'function') {
        note.setAttribute('tabindex', '-1');
        note.focus();
      }
    }
  });
}
