(() => {
  'use strict';
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const seen = new WeakSet();
  const hero = document.querySelector('.proposal-hero');
  const targets = [...document.querySelectorAll([
    '.proposal-hero h1', '.proposal-hero .proposal-kicker', '.proposal-lead',
    '.proposal-hero-actions', '.proposal-summary',
    '.proposal-section > .proposal-container > h2',
    '.proposal-section > .proposal-container > .proposal-kicker',
    '.proposal-section > .proposal-container > .proposal-intro',
    '.proposal-card', '.proposal-offer-main', '.proposal-offer-details',
    '.proposal-faq details', '#testimonials h2', '#testimonials .reviews-subtitle',
    '#booking h2', '#booking .fikra-booking-intro'
  ].join(','))];
  function reveal(el) {
    if (seen.has(el)) return;
    seen.add(el);
    if (reduced.matches || el.contains(document.activeElement)) return;
    const heading = /H[12]/.test(el.tagName);
    const peers = [...el.parentElement.children].filter(node => targets.includes(node));
    const delay = Math.min(peers.indexOf(el) * 70, hero?.contains(el) ? 210 : 140);
    const frames = heading
      ? [{opacity: 0, transform: 'translateY(24px)', filter: 'blur(3px)'}, {opacity: 1, transform: 'translateY(0)', filter: 'blur(0)'}]
      : [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'translateY(0)'}];
    const animation = el.animate(frames, {duration: heading ? 800 : 650, delay: Math.max(0, delay), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
    active.set(el, animation);
    animation.finished.then(() => { if (active.get(el) === animation) active.delete(el); }, () => {});
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target); observer.unobserve(entry.target);
    }
  }, {threshold: .08, rootMargin: '0px 0px -24px 0px'});
  targets.forEach(el => observer.observe(el));
  // Keyboard navigation never leaves focused content waiting for a reveal.
  document.addEventListener('focusin', event => {
    for (const [el, animation] of active) {
      if (el.contains(event.target)) { animation.cancel(); active.delete(el); }
    }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { active.forEach(animation => animation.cancel()); active.clear(); }
  });
  const progress = document.createElement('div');
  progress.className = 'fikra-scroll-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
  let queued = false;
  function updateProgress() {
    queued = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    const fraction = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }
  addEventListener('scroll', schedule, {passive: true}); addEventListener('resize', schedule);
  addEventListener('fikra:language', () => {
    active.forEach(animation => animation.cancel()); active.clear(); schedule();
  });
  updateProgress();
})();
