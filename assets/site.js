(() => {
  'use strict';
  const config = window.FIKRA_CONFIG || {};
  const dialog = document.createElement('dialog');
  dialog.className = 'fikra-dialog';
  dialog.setAttribute('aria-labelledby', 'fikra-dialog-title');
  dialog.innerHTML = `<button type="button" class="fikra-close" aria-label="Close dialog">×</button>
    <h2 id="fikra-dialog-title">Let’s build your next idea.</h2>
    <div data-fikra-content></div>`;
  document.body.append(dialog);
  const content = dialog.querySelector('[data-fikra-content]');
  const originals = new WeakMap();
  const t = text => window.FIKRA_I18N?.t(text) || text;
  function localize() {
    const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!originals.has(node)) originals.set(node, node.textContent);
      node.textContent = t(originals.get(node));
    }
    dialog.querySelector('.fikra-close').setAttribute('aria-label', t('Close dialog'));
  }
  window.addEventListener('fikra:language', localize);
  let opener;
  const safeUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };
  const email = typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email) ? config.email : null;
  const whatsapp = /^\d{7,15}$/.test(config.whatsapp || '') ? config.whatsapp : null;
  if (whatsapp) {
    const link = document.createElement('a');
    link.className = 'fikra-whatsapp-float';
    link.href = `https://wa.me/${whatsapp}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.91 11.91 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.15 1.6 5.96L.02 24l6.25-1.64a11.9 11.9 0 0 0 5.77 1.47h.01C18.63 23.83 24 18.48 24 11.9c0-3.18-1.24-6.17-3.48-8.42ZM12.05 21.82a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.86 9.86 0 0 1-1.55-5.28c0-5.47 4.45-9.92 9.92-9.92a9.85 9.85 0 0 1 7.01 2.91 9.84 9.84 0 0 1 2.9 7.01c0 5.47-4.45 9.89-9.91 9.89Zm5.44-7.42c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.21 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg><span></span>';
    function localizeWhatsApp() {
      const arabic = document.documentElement.lang === 'ar';
      link.querySelector('span').textContent = arabic ? 'واتساب' : 'WhatsApp';
      link.setAttribute('aria-label', arabic ? 'تواصل معنا على واتساب: ‎+974 50696019' : 'Chat on WhatsApp: +974 50696019');
    }
    localizeWhatsApp();
    window.addEventListener('fikra:language', localizeWhatsApp);
    document.body.append(link);
  }
  function show(trigger) {
    opener = trigger;
    localize();
    if (!dialog.open) dialog.showModal();
  }
  function contact(trigger) {
    const instagram = safeUrl(config.instagramUrl);
    if (!email && !whatsapp && instagram) {
      content.innerHTML = '<p>Tell us about your Shopify store, a new website, or the improvements you have in mind.</p>';
      const link = document.createElement('a');
      link.href = instagram; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.className = 'fikra-action'; link.textContent = 'Message @fikraagency.qa on Instagram';
      content.append(link); show(trigger); return;
    }
    content.innerHTML = `<form class="fikra-form">
      <label>Your name<input name="name" autocomplete="name" maxlength="120" required></label>
      <label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>Tell us about your project<textarea name="message" maxlength="3000" required></textarea></label>
      <button class="fikra-action" type="submit">Continue to enquiry</button>
      <p class="fikra-status" role="status"></p></form>`;
    const form = content.querySelector('form');
    const status = form.querySelector('[role="status"]');
    if (!email && !whatsapp) {
      form.querySelector('[type="submit"]').disabled = true;
      status.textContent = 'Enquiries will open soon. Contact details are being confirmed; this form does not send messages yet.';
    } else {
      status.textContent = email ? 'Continue opens your email app with your enquiry ready to send.' : 'Continue opens WhatsApp with your enquiry ready to send.';
    }
    const booking = config.bookingPageUrl || '/book/';
    if (booking) {
      const a = document.createElement('a');
      a.href = booking; a.setAttribute('data-fikra-booking', '');
      a.className = 'fikra-action'; a.textContent = t('Get your free design'); content.prepend(a);
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity() || (!email && !whatsapp)) return;
      const data = new FormData(form);
      const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
      window.location.href = email
        ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('FIKRA project enquiry')}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`;
    });
    show(trigger);
  }
  dialog.querySelector('.fikra-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  document.addEventListener('click', event => {
    if (event.target.closest('.nav-menu-wrapper .nav-link[href^="#"]')) {
      document.querySelector('.w-nav-button.w--open')?.click();
    }
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-fikra-contact], [data-fikra-page]');
    if (!trigger) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (trigger.hasAttribute('data-fikra-contact')) contact(trigger);
    else {
      content.replaceChildren();
      const p = document.createElement('p');
      p.textContent = 'This page is being prepared. Contact FIKRA to discuss your project.';
      const button = document.createElement('button');
      button.className = 'fikra-action'; button.textContent = 'Contact FIKRA';
      button.addEventListener('click', () => contact(opener));
      content.append(p, button); show(trigger);
    }
  }, true);
  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-fikra-newsletter]');
    if (!form) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const url = safeUrl(config.newsletterUrl);
    if (url) { window.location.assign(url); return; }
    let status = form.querySelector('[role="status"]');
    if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); form.append(status); }
    status.textContent = t('Newsletter signup is coming soon. Your email has not been submitted.');
  }, true);
})();
