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
      a.className = 'fikra-action'; a.textContent = t('Request a free call'); content.prepend(a);
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
