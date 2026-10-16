(() => {
  'use strict';
  const campaign = new URLSearchParams(location.search);
  function destination(path) {
    let url;
    try { url = new URL(path, location.origin); if (url.origin !== location.origin) throw Error(); }
    catch { url = new URL('/book/', location.origin); }
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const value = campaign.get(key);
      if (value && /^[a-zA-Z0-9_.~ -]{1,120}$/.test(value)) url.searchParams.set(key, value);
    }
    url.searchParams.set('lang', document.documentElement.lang === 'ar' ? 'ar' : 'en');
    return url.pathname + url.search;
  }
  const bookingDestination = () => destination(window.FIKRA_CONFIG?.bookingPageUrl || '/book/');
  function updateLinks() {
    document.querySelectorAll('[data-fikra-booking], a[href="#booking"]').forEach(link => {
      if (link.tagName === 'A') link.href = bookingDestination();
    });
    document.querySelectorAll('.booking-home, .booking-back-home').forEach(link => { link.href = destination(document.documentElement.lang === 'ar' ? '/ar/' : '/'); });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-fikra-booking]');
    if (!link || link.tagName !== 'A') return;
    link.href = bookingDestination();
    document.querySelector('dialog[open]')?.close();
    document.querySelector('.w-nav-button.w--open')?.click();
  }, true);
  addEventListener('fikra:language', updateLinks);
  updateLinks();
  if (!document.body.classList.contains('booking-page') && location.hash === '#booking') location.replace(bookingDestination());
})();
