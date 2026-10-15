(() => {
  const cards = [...document.querySelectorAll('.showcase-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ar = () => document.documentElement.lang === 'ar';
  function labels() {
    document.querySelectorAll('[data-showcase-en]').forEach(el => { el.textContent = ar() ? el.dataset.showcaseAr : el.dataset.showcaseEn; });

  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      const video = target.querySelector('video');
      if (isIntersecting && !reduced.matches && !target.dataset.userPaused && !document.hidden) video.play().catch(labels);
      else video.pause();
    });
  }, {threshold: .3});
  cards.forEach(card => {
    const video = card.querySelector('video'); video.muted = true;
    observer.observe(card);

  });
  let queued = false;
  function update() {
    queued = false;
    cards.forEach((card, i) => {
      if (reduced.matches || i === cards.length - 1) { card.style.transform = ''; card.style.filter = ''; return; }
      const next = cards[i + 1].getBoundingClientRect();
      const top = parseFloat(getComputedStyle(card).top);
      const progress = Math.max(0, Math.min(1, (top + card.offsetHeight - next.top) / card.offsetHeight));
      card.style.transform = `scale(${1 - progress * .06})`;
      card.style.filter = `brightness(${1 - progress * .35})`;
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive: true}); addEventListener('resize', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) cards.forEach(card => card.querySelector('video').pause()); schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cards.forEach(card => card.querySelector('video').pause()); });
  addEventListener('fikra:language', labels); labels(); update();
})();
