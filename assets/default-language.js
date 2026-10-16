// Run in the homepage head before paint; explicit choices take precedence.
(() => {
  if (!['/', '/index.html'].includes(location.pathname)) return;
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  let language = 'ar';
  try {
    const saved = localStorage.getItem('fikra-language');
    if (saved === 'ar' || saved === 'en') language = saved;
  } catch {}
  if (requested === 'ar' || requested === 'en') language = requested;
  if (language === 'ar') {
    url.pathname = '/ar/';
    location.replace(url.pathname + url.search + url.hash);
  }
})();
