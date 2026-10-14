(() => {
  const cards = [...document.querySelectorAll('.showcase-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ar = () => document.documentElement.lang === 'ar';
  function labels() {
    document.querySelectorAll('[data-showcase-en]').forEach(el => { el.textContent = ar() ? el.dataset.showcaseAr : el.dataset.showcaseEn; });
    cards.forEach(card => {
      const video = card.querySelector('video');
      const play = card.querySelector('[data-showcase-action="play"]');
      play.textContent = video.paused ? '▷' : 'Ⅱ';
      play.setAttribute('aria-label', ar() ? (video.paused ? 'تشغيل الفيديو' : 'إيقاف الفيديو مؤقتًا') : (video.paused ? 'Play video' : 'Pause video'));
      const sound = card.querySelector('[data-showcase-action="sound"]');
      sound.textContent = video.muted ? '♪̸' : '♪';
      sound.setAttribute('aria-label', ar() ? (video.muted ? 'تشغيل الصوت' : 'كتم الصوت') : (video.muted ? 'Unmute video' : 'Mute video'));
      sound.setAttribute('aria-pressed', String(!video.muted));
      card.querySelector('[data-showcase-action="expand"]').setAttribute('aria-label', ar() ? 'عرض الفيديو بملء الشاشة' : 'Fullscreen video');
    });
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
    video.addEventListener('play', labels); video.addEventListener('pause', labels);
    card.addEventListener('click', async event => {
      const button = event.target.closest('[data-showcase-action]'); if (!button) return;
      switch (button.dataset.showcaseAction) {
        case 'play':
          if (video.paused) { delete card.dataset.userPaused; await video.play().catch(() => {}); }
          else { card.dataset.userPaused = 'true'; video.pause(); }
          break;
        case 'sound': video.muted = !video.muted; break;
        case 'expand':
          try { if (video.requestFullscreen) await video.requestFullscreen(); else video.webkitEnterFullscreen?.(); } catch {}
          break;
      }
      labels();
    });
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
