(() => {
  'use strict';
  const form = document.querySelector('#fikra-lead-form');
  if (!form || !document.body.classList.contains('booking-page')) return;
  const steps = [...form.querySelectorAll('[data-step]')];
  const next = form.querySelector('[data-step-next]');
  const back = form.querySelector('[data-step-back]');
  const submit = form.querySelector('[type=submit]');
  const error = form.querySelector('[data-step-error]');
  const progress = form.querySelector('[role=progressbar]');
  const count = form.querySelector('[data-step-count]');
  const t = value => window.FIKRA_I18N?.t(value) || value;
  let step = 0;
  const activeSteps = () => form.elements.project.value === 'New Shopify Store' ? [0, 2, 3] : [0, 1, 2, 3];
  function render(focus = false) {
    steps.forEach((element, index) => { element.hidden = index !== step; });
    back.hidden = step === 0;
    next.hidden = step === steps.length - 1;
    submit.hidden = step !== steps.length - 1;
    next.textContent = t(step === 1 && !form.elements.website.value.trim() ? 'Skip for now' : 'Continue');
    const path = activeSteps();
    const position = path.indexOf(step) + 1;
    count.textContent = document.documentElement.lang === 'ar' ? `الخطوة ${position} من ${path.length}` : `Step ${position} of ${path.length}`;
    progress.setAttribute('aria-valuenow', String(position));
    progress.setAttribute('aria-valuemax', String(path.length));
    progress.setAttribute('aria-valuetext', count.textContent);
    [...progress.children].forEach((part, index) => { part.hidden = !path.includes(index); part.classList.toggle('is-current', index <= step); });
    error.textContent = '';
    if (focus) {
      steps[step].querySelector('legend').focus({preventScroll: true});
      form.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }
  function validateStep() {
    const requiredGroups = step === 0 ? ['project', 'product_count'] : step === 2 ? ['budget'] : [];
    for (const name of requiredGroups) {
      if (!form.querySelector(`input[name="${name}"]:checked`)) {
        error.textContent = t('Please choose an option to continue.');
        form.querySelector(`input[name="${name}"]`).focus();
        return false;
      }
    }
    if (step === 1) {
      const input = form.elements.website;
      input.setCustomValidity('');
      if (input.value.trim()) {
        try { const url = new URL(input.value.trim()); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw Error(); }
        catch { input.setCustomValidity(t('Enter a full URL starting with https:// or http://.')); input.reportValidity(); return false; }
      }
    }
    return true;
  }
  function advance() {
    if (validateStep() && step < steps.length - 1) { const path = activeSteps(); step = path[path.indexOf(step) + 1]; render(true); }
  }
  next.addEventListener('click', advance);
  back.addEventListener('click', () => { if (step > 0) { const path = activeSteps(); step = path[path.indexOf(step) - 1]; render(true); } });
  form.addEventListener('submit', event => {
    if (step < steps.length - 1) { event.preventDefault(); event.stopImmediatePropagation(); advance(); }
    // The existing booking controller validates and persists the final step.
  }, true);
  form.addEventListener('input', event => {
    event.target.setCustomValidity?.(''); error.textContent = '';
    if (event.target.name === 'project') {
      if (event.target.value === 'New Shopify Store') { form.elements.website.value = ''; form.elements.website.setCustomValidity(''); }
      render();
    }
    if (event.target.name === 'website') next.textContent = t(event.target.value.trim() ? 'Continue' : 'Skip for now');
  });
  addEventListener('fikra:language', () => { steps.forEach(element => element.querySelectorAll('input').forEach(input => input.setCustomValidity(''))); render(); });
  render();
})();
