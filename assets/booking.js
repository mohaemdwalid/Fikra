(() => {
  'use strict';
  const section = document.querySelector('#booking');
  if (!section) return;
  const form = section.querySelector('form');
  const status = section.querySelector('#lead-status');
  const success = section.querySelector('#lead-success');
  const submit = form.querySelector('[type=submit]');
  const strings = {
    eyebrow: ['Free Shopify Project Call', 'مكالمة مجانية لمشروع شوبيفاي'],
    heading: ['Let’s talk about your Shopify store.', 'لنتحدّث عن متجرك على شوبيفاي.'],
    successHeading: ['Your Shopify journey starts here!', 'رحلتك مع شوبيفاي تبدأ هنا!'],
    name: ['Full name', 'الاسم الكامل'],
    phone: ['Phone number', 'رقم الجوال'], phoneHint: ['Choose your country code, then enter your mobile number.', 'اختر رمز الدولة، ثم أدخل رقم الجوال.'],
    project: ['Project type', 'نوع المشروع'], choose: ['Select an option', 'اختر أحد الخيارات'],
    new: ['New Shopify Store', 'متجر شوبيفاي جديد'], redesign: ['Store Redesign', 'إعادة تصميم المتجر'], improvements: ['Improvements', 'تحسينات'],
    budget: ['Estimated budget', 'الميزانية التقديرية'], budget1: ['Below QAR 4,000', 'أقل من ٤٬٠٠٠ ر.ق'],
    budget2: ['QAR 4,000–6,000', '٤٬٠٠٠–٦٬٠٠٠ ر.ق'], budget3: ['QAR 6,000–8,000', '٦٬٠٠٠–٨٬٠٠٠ ر.ق'],
    budget4: ['QAR 8,000–10,000', '٨٬٠٠٠–١٠٬٠٠٠ ر.ق'], unsure: ['I’d like help defining my budget', 'أحتاج مساعدة في تحديد ميزانيتي'],
    website: ['Existing website URL (optional)', 'رابط الموقع الحالي (اختياري)'],
    privacy: ['We’ll use your details to call you about your Shopify project.', 'سنستخدم بياناتك للتواصل معك بشأن مشروعك على شوبيفاي.'],
    continue: ['Request a call', 'اطلب مكالمة'], saving: ['Sending your request…', 'جارٍ إرسال طلبك…'],
    invalid: ['Please check the highlighted field.', 'يرجى مراجعة الحقل المحدد.'],
    required: ['Please complete this field.', 'يرجى إكمال هذا الحقل.'],
    invalidPhone: ['Enter a valid number with country code, for example +974 1234 5678.', 'أدخل رقمًا صحيحًا مع رمز الدولة، مثل ‎+974 1234 5678.'],
    invalidWebsite: ['Enter a full website URL starting with https:// or http://.', 'أدخل رابط الموقع كاملًا ويبدأ بـ https:// أو http://.'],
    saveError: ['We could not save your details. Please try again. Your request was not sent.', 'تعذّر حفظ بياناتك. يرجى المحاولة مجددًا. لم يتم إرسال طلبك.'],
    saved: ['Thank you for taking the first step toward launching or growing your online store. We’re excited to hear your ideas. We’ll call you shortly to plan what’s next.', 'شكرًا لاتخاذك الخطوة الأولى لإطلاق متجرك الإلكتروني أو تطويره على شوبيفاي. متحمّسون لسماع أفكارك، وسنتصل بك قريبًا لمناقشة الخطوة القادمة.']
  };
  const ar = () => document.documentElement.lang === 'ar';
  const text = key => strings[key][ar() ? 1 : 0];
  let leadState = '', busy = false, submitted = false;
  const leadId = crypto.randomUUID(); // Retry the same save safely; no PII in browser storage.
  const seen = new Set();
  const utm = {};
  // Only conventional campaign tokens; never send qualification or contact fields to analytics.
  const query = new URLSearchParams(location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = query.get(key);
    if (value && /^[a-zA-Z0-9_.~ -]{1,120}$/.test(value) && !value.includes('@')) utm[key] = value;
  }
  function render() {
    section.querySelectorAll('[data-booking-copy]').forEach(el => {
      const key = el.dataset.bookingCopy;
      el.textContent = text(key === 'heading' && submitted ? 'successHeading' : key);
    });
    submit.textContent = text(busy ? 'saving' : 'continue');
    status.textContent = leadState ? text(leadState) : '';
    success.hidden = !submitted;
    success.textContent = submitted ? text('saved') : '';
  }
  function track(event, id) {
    const key = `${event}:${id}`;
    if (seen.has(key)) return;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    seen.add(key);
    // GTM is the single analytics delivery path; do not also call fbq here.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event, event_id: id});
  }
  const phoneCountry = form.querySelector('[data-phone-country]');
  function internationalPhone() {
    let value = form.elements.phone.value.trim()
      .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
      .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
      .replace(/[\s().-]/g, '');
    if (!phoneCountry) return value;
    if (value.startsWith('00')) value = '+' + value.slice(2);
    if (value.startsWith('+')) return value;
    if (['+966', '+971'].includes(phoneCountry.value)) value = value.replace(/^0/, '');
    return phoneCountry.value + value;
  }
  function validPhone(value) {
    if (!/^\+[1-9]\d{6,14}$/.test(value)) return false;
    if (!phoneCountry) return true;
    const lengths = {'+974': 8, '+966': 9, '+971': 9, '+965': 8, '+973': 8, '+968': 8};
    const prefix = Object.keys(lengths).find(code => value.startsWith(code));
    return !!prefix && value.length - prefix.length === lengths[prefix];
  }
  phoneCountry?.addEventListener('change', () => {
    form.elements.phone.setCustomValidity('');
    form.elements.phone.placeholder = ['+966', '+971'].includes(phoneCountry.value) ? '50 123 4567' : '1234 5678';
  });
  function validate() {
    for (const input of form.elements) {
      if (!input.willValidate) continue;
      input.setCustomValidity('');
      if (input.required && !input.value.trim()) input.setCustomValidity(text('required'));
      else if (input.name === 'phone' && !validPhone(internationalPhone())) input.setCustomValidity(text('invalidPhone'));
      else if (input.name === 'website' && input.value) {
        try { if (!['https:', 'http:'].includes(new URL(input.value).protocol)) throw Error(); }
        catch { input.setCustomValidity(text('invalidWebsite')); }
      }
    }
    return form.reportValidity();
  }
  form.addEventListener('input', e => e.target.setCustomValidity?.(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || submitted) return;
    if (!validate()) { leadState = 'invalid'; render(); return; }
    busy = true; leadState = ''; submit.disabled = true; render();
    const details = Object.fromEntries(new FormData(form));
    details.name = details.name.trim();
    details.phone = internationalPhone();
    try {
      const response = await fetch('/api/leads', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...details, id: leadId, language: ar() ? 'ar' : 'en', utm}), signal: AbortSignal.timeout(15000)});
      const saved = await response.json();
      if (!response.ok || saved.id !== leadId || saved.status !== 'saved') throw Error();
      track('fikra_lead_submitted', leadId);
      submitted = true;
      form.hidden = true;
    } catch { leadState = 'saveError'; }
    finally { busy = false; submit.disabled = false; render(); if (submitted) success.focus({preventScroll: true}); }
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-fikra-booking]');
    if (!trigger) return;
    document.querySelector('dialog[open]')?.close();
    document.querySelector('.w-nav-button.w--open')?.click();
  });
  addEventListener('fikra:language', () => { for (const input of form.elements) input.setCustomValidity?.(''); render(); });
  render();
})();
