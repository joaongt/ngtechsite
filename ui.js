// Shared interface behaviour for every page. Content stays usable without it.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('header');

  // Scroll progress bar and compact header.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  // Floating WhatsApp button, reusing the page's own pre-filled message.
  const pageLink = document.querySelector('.closing a[href*="wa.me"][href*="text="]');
  const float = document.createElement('a');
  float.className = 'wa-float';
  float.href = pageLink ? pageLink.href : 'https://wa.me/5531989878715';
  float.target = '_blank';
  float.rel = 'noopener noreferrer';
  float.setAttribute('aria-label', 'Falar com a NGTech no WhatsApp');
  float.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.8l.4-.5.2-.4v-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z"/></svg><span>Falar no WhatsApp</span>';
  document.body.append(float);

  const closing = document.querySelector('.closing');
  let closingInView = false;
  if (closing && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      closingInView = entry.isIntersecting;
      onScroll();
    }).observe(closing);
  }

  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    header.classList.toggle('is-scrolled', y > 24);
    float.classList.toggle('is-on', y > 480 && !closingInView);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // Cursor-following light on cards.
  const spotCards = document.querySelectorAll('.pain-card,.svc-card,.case-card,.project,.detail-grid article,.phase-card,.spreadsheet-card');
  spotCards.forEach(card => {
    card.classList.add('spot');
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  });

  // Staggered reveal for elements script.js does not already cover.
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
        // Clear the stagger so it does not delay later hover transitions.
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1000);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.pain-card,.svc-card,.case-card,.detail-grid article,.spreadsheet-card,.case-detail,.price-demo,.calc,.guide,.promise-list li,.faq details,.steps article').forEach(element => {
      const index = [...element.parentElement.children].indexOf(element);
      element.classList.add('reveal');
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(element);
    });
  } else {
    document.querySelectorAll('.steps article').forEach(step => step.classList.add('is-visible'));
  }

  // Replay a short entrance when the portfolio filter changes.
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-category]:not([hidden])').forEach(project => {
      project.classList.remove('is-filtering', 'reveal');
      project.style.opacity = '';
      void project.offsetWidth;
      project.classList.add('is-filtering');
    });
  }));
})();
