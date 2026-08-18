document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const hero = document.getElementById('hero');
  const heroTitle = hero.querySelector('.hero__title');
  const heroImage = hero.querySelector('.hero__image');
  const conceptSection = document.getElementById('concept');
  const menuBlocks = document.querySelectorAll('.menu__block');
  const galleryWrapper = document.querySelector('.gallery__scroll-wrapper');
  const reviewsSection = document.getElementById('reviews');
  const reviewsNumber = document.querySelector('.reviews__number');
  const reviewsStars = document.querySelector('.reviews__stars');
  const reviewsText = document.querySelector('.reviews__text');
  const accessItems = document.querySelectorAll('.access__item');
  const contactSection = document.getElementById('contact');

  let isHeroAnimated = false;
  let isReviewsAnimated = false;

  // Animation helper functions
  function splitTextIntoSpans(element) {
    const text = element.innerText;
    element.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');
  }

  function animateHeroTitle() {
    if (isHeroAnimated) return;
    isHeroAnimated = true;
    splitTextIntoSpans(heroTitle);
    heroTitle.classList.add('is-animating');
    const spans = heroTitle.querySelectorAll('span');
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.add('animate');
      }, index * 160);
    });
  }

  function animateHeroImage() {
    if (!heroImage.classList.contains('is-loaded')) {
      heroImage.classList.add('is-loaded');
    }
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === conceptSection) {
            const content = entry.target.querySelector('.concept__content');
            if (content) {
              content.classList.add('is-visible');
            }
          } else if (entry.target === galleryWrapper) {
            entry.target.classList.add('is-visible');
          } else if (entry.target === reviewsSection) {
            animateReviewsCountUp();
          } else if (entry.target.classList.contains('menu__block')) {
            entry.target.classList.add('is-visible');
          } else if (entry.target.classList.contains('access__item')) {
            entry.target.classList.add('is-visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(conceptSection);
    observer.observe(galleryWrapper);
    observer.observe(reviewsSection);
    menuBlocks.forEach(block => observer.observe(block));
    
    const accessContent = document.querySelector('.access__content');
    if (accessContent) {
      const itemsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !entry.target.classList.contains('is-visible')) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, index * 100);
          }
        });
      }, { threshold: 0.3 });
      
      accessItems.forEach(item => itemsObserver.observe(item));
    }
  }

  function animateReviewsCountUp() {
    if (isReviewsAnimated) return;
    isReviewsAnimated = true;

    const targetValue = 4.96;
    const duration = 1200;
    const startTime = Date.now();

    reviewsNumber.classList.add('is-counting');
    
    const countInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = (targetValue * progress).toFixed(2);
      reviewsNumber.innerText = currentValue;

      if (progress === 1) {
        clearInterval(countInterval);
        reviewsNumber.innerText = '4.96';
      }
    }, 16);

    setTimeout(() => {
      reviewsStars.classList.add('is-visible');
      reviewsText.classList.add('is-visible');
    }, 100);
  }

  function initHeaderScroll() {
    let lastScrollTop = 0;
    let lastDirection = 'down';

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 160) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      lastScrollTop = scrollTop;
    }, { passive: true });
  }

  function initParallax() {
    const conceptImage = document.querySelector('.concept__image');
    
    window.addEventListener('scroll', () => {
      if (!conceptImage) return;
      
      const scrolled = window.pageYOffset;
      const rect = conceptImage.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const yPos = (scrolled - elementTop) * 0.3;
        conceptImage.style.transform = `translateY(${yPos}px)`;
      }
    }, { passive: true });
  }

  function initSmoothScrollLinks() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const offsetTop = target.offsetTop - 64;
            window.scrollTo({
              top: Math.max(0, offsetTop),
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // Initialization
  animateHeroTitle();
  animateHeroImage();
  initHeaderScroll();
  initScrollAnimations();
  initParallax();
  initSmoothScrollLinks();

  // Handle reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
});

// IntersectionObserver for fade-in animations on other sections
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.tagName === 'SECTION' && !entry.target.id.includes('hero')) {
          if (!entry.target.classList.contains('is-visible')) {
            entry.target.classList.add('is-visible');
          }
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    if (section.id !== 'hero') {
      observer.observe(section);
    }
  });
});
