// Arabic is the default on every public English route, before first paint.
(() => {
  const arabicPath = document.currentScript?.dataset.arPath;
  if (!arabicPath) return;
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  let language = 'ar';
  try {
    // Only a deliberate language selection overrides the Arabic default.
    const saved = localStorage.getItem('fikra-language-choice');
    if (saved === 'ar' || saved === 'en') language = saved;
  } catch {}
  if (requested === 'ar' || requested === 'en') language = requested;
  if (language === 'ar') {
    url.pathname = arabicPath;
    location.replace(url.pathname + url.search + url.hash);
  }
})();
