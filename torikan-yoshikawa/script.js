// IntersectionObserver for scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all animated sections
const animatedElements = document.querySelectorAll(
  '.signature__content, .signature__image-wrapper, '
  + '.menu__content, .menu__image-wrapper, '
  + '.craftsmanship__content, '
  + '.detail__content, .detail__image-wrapper, '
  + '.party__inner, '
  + '.access__content, .access__map-wrapper, '
  + '.cta-section__title'
);

animatedElements.forEach(el => observer.observe(el));

// Header scroll effect
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  
  if (scrollY > 50) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}, { passive: true });

// Parallax effect for hero background and craftsmanship
let ticking = false;
const heroElement = document.querySelector('.hero__bg');
const craftsmanshipBg = document.querySelector('.craftsmanship__bg');

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroRect = document.getElementById('hero');
      const craftsmanshipRect = document.getElementById('craftsmanship');
      
      // Hero parallax - move upward
      if (heroElement && scrollY < window.innerHeight) {
        const offset = scrollY * 0.5;
        heroElement.style.transform = `translateY(${offset}px)`;
      }
      
      // Craftsmanship parallax - zoom effect
      if (craftsmanshipBg && craftsmanshipRect) {
        const craftsmanshipTop = craftsmanshipRect.offsetTop;
        const distance = scrollY - (craftsmanshipTop - window.innerHeight);
        if (distance > -window.innerHeight && distance < craftsmanshipRect.offsetHeight) {
          const scale = 1 + (distance / (craftsmanshipRect.offsetHeight + window.innerHeight)) * 0.08;
          craftsmanshipBg.style.transform = `scale(${Math.max(1, Math.min(scale, 1.08))})`;
        }
      }
      
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Counter animation for party number
const counterElement = document.querySelector('[data-count]');
if (counterElement) {
  const targetNumber = parseInt(counterElement.dataset.count, 10);
  
  const partyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !counterElement.classList.contains('counted')) {
        counterElement.classList.add('counted');
        
        // Check for prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
          counterElement.textContent = targetNumber;
        } else {
          animateCounter(counterElement, 0, targetNumber, 800);
        }
        
        partyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  partyObserver.observe(counterElement);
}

function animateCounter(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Smooth scroll for anchor links
const navLinks = document.querySelectorAll('.header__link, [href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#') && href !== '#' && href !== '#cta_section') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Show/hide CTA bar based on hero section visibility
const ctaBar = document.getElementById('ctaBar');
const heroSection = document.getElementById('hero');

if (ctaBar && heroSection) {
  const ctaBarObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        ctaBar.style.display = 'flex';
      } else {
        ctaBar.style.display = 'none';
      }
    });
  }, { threshold: 0 });
  
  ctaBarObserver.observe(heroSection);
}

// Handle reduced motion preference for initial setup
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  const jsElements = document.querySelectorAll('.js .hero, .js .hero__eyebrow, .js .hero__char, .js .hero__subtitle, .js .hero__scroll');
  jsElements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  
  const overlay = document.querySelector('.hero__overlay');
  if (overlay) {
    overlay.style.clipPath = 'inset(0 0 0 0)';
  }
}