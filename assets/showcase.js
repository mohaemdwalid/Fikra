(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.showcase-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  const ar = () => document.documentElement.lang === 'ar';
  function load(video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
    video.dataset.loaded = 'true';
    video.load();
  }
  function labels() {
    document.querySelectorAll('[data-showcase-en]').forEach(el => { el.textContent = ar() ? el.dataset.showcaseAr : el.dataset.showcaseEn; });
    cards.forEach(card => {
      const video = card.querySelector('video');
      const button = card.querySelector('.showcase-playback');
      if (!button) return;
      button.textContent = video.paused ? '▶' : 'Ⅱ';
      button.setAttribute('aria-label', ar() ? (video.paused ? 'تشغيل عرض المتجر' : 'إيقاف عرض المتجر مؤقتًا') : (video.paused ? 'Play store recording' : 'Pause store recording'));
    });
  }
  function autoplay(card) {
    const video = card.querySelector('video');
    if (!reduced.matches && !card.dataset.userPaused && visible.has(card) && !document.hidden) {
      load(video); video.play().catch(labels);
    }
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) { visible.add(target); autoplay(target); }
      else { visible.delete(target); target.querySelector('video').pause(); }
    });
  }, {threshold: .3});
  cards.forEach(card => {
    const video = card.querySelector('video'); video.muted = true;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'showcase-playback';
    card.querySelector('.showcase-media').append(button);
    video.addEventListener('play', labels); video.addEventListener('pause', labels);
    button.addEventListener('click', () => {
      if (video.paused) { delete card.dataset.userPaused; load(video); video.play().catch(labels); }
      else { card.dataset.userPaused = 'true'; video.pause(); }
    });
    observer.observe(card);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) cards.forEach(card => card.querySelector('video').pause());
    else visible.forEach(autoplay);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cards.forEach(card => card.querySelector('video').pause());
    else visible.forEach(autoplay);
  });
  addEventListener('fikra:language', labels); labels();
})();
