/** One decoder per visible recording, shared by all sixteen curved canvas facets. */
export function mountCurvedVideos(host: HTMLElement, aspect: number) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = new Map<string, HTMLVideoElement>();
  const posters = new Map<string, HTMLImageElement>();
  const blocked = new Set<string>();
  let frame = 0, visible = false, disposed = false, last = 0;
  function pause() { videos.forEach(video => video.pause()); }
  function paint() {
    const active = new Set<string>();
    const bounds = host.getBoundingClientRect();
    const tiles = [...host.querySelectorAll<HTMLElement>('[data-video-tile]')];
    for (const tile of tiles) {
      const rect = tile.getBoundingClientRect();
      if (getComputedStyle(tile).visibility === 'hidden' || rect.right <= bounds.left || rect.left >= bounds.right) continue;
      const canvases = [...tile.querySelectorAll<HTMLCanvasElement>('canvas[data-video-src]')];
      const first = canvases[0];
      if (!first) continue;
      const src = first.dataset.videoSrc!, poster = first.dataset.videoPoster!;
      let image = posters.get(poster);
      if (!image) { image = new Image(); image.onload = () => { if (!disposed) paint(); }; image.src = poster; posters.set(poster, image); }
      let video = videos.get(src);
      if (visible && !document.hidden && !reduced.matches) {
        active.add(src);
        if (!video) {
          video = document.createElement('video'); video.muted = true; video.loop = true; video.playsInline = true;
          video.preload = 'none'; video.src = src; video.setAttribute('aria-hidden', 'true');
          video.addEventListener('error', () => blocked.add(src));
          videos.set(src, video);
        }
        if (video.paused && !blocked.has(src)) void video.play().catch(() => blocked.add(src));
      }
      const source = !reduced.matches && video && video.readyState >= 2 && !blocked.has(src) ? video : image;
      if (!source) continue;
      const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
      const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
      if (!sw || !sh) continue;
      const cropWidth = Math.min(sw, sh * aspect), cropHeight = cropWidth / aspect;
      const x = (sw - cropWidth) / 2, y = (sh - cropHeight) / 2;
      canvases.forEach((canvas, index) => {
        const width = Math.max(1, Math.ceil(canvas.clientWidth)), height = Math.max(1, Math.ceil(canvas.clientHeight));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        const context = canvas.getContext('2d', {alpha: false});
        if (!context) return;
        context.drawImage(source, x + index * cropWidth / canvases.length, y,
          Math.min(cropWidth / canvases.length + cropWidth / (width * canvases.length), sw - x - index * cropWidth / canvases.length),
          cropHeight, 0, 0, width, height);
      });
    }
    videos.forEach((video, src) => { if (!active.has(src)) video.pause(); });
  }
  function tick(now: number) {
    frame = 0;
    if (now - last >= 1000 / 30) { last = now; paint(); }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const playing = visible && !document.hidden && !reduced.matches;
    host.toggleAttribute('data-media-paused', !playing);
    if (!playing) pause();
    paint();
    if (playing) frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
  observer.observe(host);
  const resize = new ResizeObserver(() => paint()); resize.observe(host);
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
  sync();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
    document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync);
    pause(); videos.forEach(video => { video.removeAttribute('src'); video.load(); });
    posters.forEach(image => { image.onload = null; });
  };
}
