(() => {
  'use strict';
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const visible = new WeakSet();
  const hero = document.querySelector('.proposal-hero');
  const targets = [...document.querySelectorAll([
    '.proposal-hero h1', '.proposal-hero .proposal-kicker', '.proposal-lead',
    '.proposal-summary',
    '.proposal-section > .proposal-container > h2',
    '.proposal-section > .proposal-container > .proposal-kicker',
    '.proposal-section > .proposal-container > .proposal-intro',
    '.proposal-card', '.proposal-offer-main', '.proposal-offer-details',
    '.proposal-faq details', '#testimonials h2', '#testimonials .reviews-subtitle',
    '#booking h2', '#booking .fikra-booking-intro'
  ].join(','))].filter(el => !el.querySelector('.proposal-cta'));
  function reveal(el) {
    if (visible.has(el)) return;
    visible.add(el);
    if (reduced.matches || el.contains(document.activeElement)) return;
    const heading = /H[12]/.test(el.tagName);
    const peers = [...el.parentElement.children].filter(node => targets.includes(node));
    const delay = Math.min(peers.indexOf(el) * 120, hero?.contains(el) ? 360 : 240);
    const frames = heading
      ? [{opacity: 0, transform: 'translateY(52px)', filter: 'blur(7px)', clipPath: 'inset(0 0 100% 0)'}, {opacity: 1, transform: 'translateY(0)', filter: 'blur(0)', clipPath: 'inset(-12% -2% -12% -2%)'}]
      : [{opacity: 0, transform: 'translateY(36px)'}, {opacity: 1, transform: 'translateY(0)'}];
    active.get(el)?.cancel();
    const animation = el.animate(frames, {duration: heading ? 1250 : 950, delay: Math.max(0, delay), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'});
    active.set(el, animation);
    animation.finished.then(() => { if (active.get(el) === animation) active.delete(el); }, () => {});
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal(entry.target);
      else {
        // Rearm only after the element has completely left the viewport.
        const rect = entry.boundingClientRect;
        if (rect.bottom <= 0 || rect.top >= innerHeight - 24) {
          visible.delete(entry.target);
          active.get(entry.target)?.cancel(); active.delete(entry.target);
        }
      }
    }
  }, {threshold: [0, .12], rootMargin: '0px 0px -24px 0px'});
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
    targets.forEach(el => {
      visible.delete(el);
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight - 24) reveal(el);
    });
  });
  updateProgress();
})();
