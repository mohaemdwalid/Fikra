(() => {
  'use strict';
  const section = document.querySelector('#vsl');
  if (!section) return;
  const video = section.querySelector('[data-vsl-video]');
  const placeholder = section.querySelector('[data-vsl-placeholder]');
  const error = section.querySelector('[data-vsl-error]');
  const fallback = section.querySelector('[data-vsl-fallback]');
  const safeMediaUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (url.username || url.password) return null;
      return url.protocol === 'https:' || (url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)) ? url.href : null;
    } catch { return null; }
  };
  const hostedPlayer = section.querySelector('wistia-player');
  if (hostedPlayer) {
    const title = () => { hostedPlayer.setAttribute('aria-label', window.FIKRA_I18N?.t('FIKRA introduction video') || 'FIKRA introduction video'); };
    title();
    addEventListener('fikra:language', title);
    if (fallback) fallback.href = `https://fast.wistia.com/embed/iframe/${hostedPlayer.getAttribute('media-id')}`;
    return;
  }
  const source = safeMediaUrl(window.FIKRA_CONFIG?.vslVideoUrl);
  if (!source) return; // Leave an honest, non-interactive placeholder until the video is supplied.
  const poster = safeMediaUrl(window.FIKRA_CONFIG?.vslPosterUrl);
  video.src = source;
  if (poster) video.poster = poster;
  fallback.href = source;
  placeholder.hidden = true;
  video.hidden = false;
  video.addEventListener('error', () => { error.hidden = false; });
  video.addEventListener('playing', () => { error.hidden = true; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
})();
