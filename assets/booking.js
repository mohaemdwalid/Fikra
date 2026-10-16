(() => {
  'use strict';
  const section = document.querySelector('#booking');
  if (!section) return;
  const form = section.querySelector('form');
  const panel = section.querySelector('#fikra-calendar-panel');
  const status = section.querySelector('#lead-status');
  const calendarStatus = section.querySelector('#calendar-status');
  const confirmation = section.querySelector('#booking-confirmation');
  const fallback = section.querySelector('[data-booking-fallback]');
  const submit = form.querySelector('[type=submit]');
  const strings = {
    eyebrow: ['Free Shopify Consultation', 'استشارة شوبيفاي مجانية'],
    heading: ['Book Your Free Shopify Consultation', 'احجز استشارتك المجانية لمتجر شوبيفاي'],
    intro: ['Tell us a little about your project, then choose a time that suits you.', 'أخبرنا قليلًا عن مشروعك، ثم اختر الوقت المناسب لك.'],
    name: ['Full name', 'الاسم الكامل'], email: ['Email address', 'البريد الإلكتروني'],
    phone: ['WhatsApp number', 'رقم واتساب'], phoneHint: ['Include your country code.', 'أدخل رمز الدولة مع الرقم.'],
    project: ['Project type', 'نوع المشروع'], choose: ['Select an option', 'اختر أحد الخيارات'],
    new: ['New Shopify Store', 'متجر شوبيفاي جديد'], redesign: ['Store Redesign', 'إعادة تصميم المتجر'], improvements: ['Improvements', 'تحسينات'],
    budget: ['Estimated budget', 'الميزانية التقديرية'], budget1: ['Below QAR 4,000', 'أقل من ٤٬٠٠٠ ر.ق'],
    budget2: ['QAR 4,000–6,000', '٤٬٠٠٠–٦٬٠٠٠ ر.ق'], budget3: ['QAR 6,000–8,000', '٦٬٠٠٠–٨٬٠٠٠ ر.ق'],
    budget4: ['QAR 8,000–10,000', '٨٬٠٠٠–١٠٬٠٠٠ ر.ق'], unsure: ['Not sure', 'غير متأكد'],
    website: ['Existing website URL (optional)', 'رابط الموقع الحالي (اختياري)'],
    privacy: ['We save these details to prepare for your consultation. Cal.com handles your booking and its configured notifications.', 'نحفظ هذه البيانات للتحضير لاستشارتك. يتولى Cal.com الحجز والإشعارات التي تم إعدادها.'],
    continue: ['Save details & choose a time', 'احفظ البيانات واختر الوقت'], saving: ['Saving your details…', 'جارٍ حفظ بياناتك…'],
    invalid: ['Please check the highlighted field.', 'يرجى مراجعة الحقل المحدد.'],
    required: ['Please complete this field.', 'يرجى إكمال هذا الحقل.'],
    invalidEmail: ['Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.'],
    invalidPhone: ['Enter a valid number with country code, for example +974 1234 5678.', 'أدخل رقمًا صحيحًا مع رمز الدولة، مثل ‎+974 1234 5678.'],
    invalidWebsite: ['Enter a full website URL starting with https:// or http://.', 'أدخل رابط الموقع كاملًا ويبدأ بـ https:// أو http://.'],
    saveError: ['We could not save your details. Please try again. Your booking calendar has not been opened.', 'تعذّر حفظ بياناتك. يرجى المحاولة مجددًا. لم يتم فتح تقويم الحجز.'],
    saved: ['Your details are saved. Choose a time below to complete your booking.', 'تم حفظ بياناتك. اختر وقتًا بالأسفل لإكمال حجزك.'],
    calendarHeading: ['Choose your consultation time', 'اختر وقت استشارتك'],
    timezone: ['Check the timezone shown in the calendar before choosing a time.', 'تحقّق من المنطقة الزمنية المعروضة في التقويم قبل اختيار الوقت.'],
    widgetLanguage: ['The Cal.com calendar is shown in English. You can select your timezone in the calendar.', 'يظهر تقويم Cal.com باللغة الإنجليزية. يمكنك اختيار منطقتك الزمنية داخل التقويم.'],
    loading: ['Loading your booking calendar…', 'جارٍ تحميل تقويم الحجز…'],
    loadError: ['The calendar could not load. Use the link below to book directly with Cal.com.', 'تعذّر تحميل التقويم. استخدم الرابط بالأسفل للحجز مباشرة عبر Cal.com.'],
    fallback: ['Open booking calendar ↗', 'افتح تقويم الحجز ↗'],
    confirmed: ['Your consultation is confirmed by Cal.com. Check your email for the booking details and meeting link. Cal.com manages any configured reminders.', 'تم تأكيد استشارتك عبر Cal.com. راجع بريدك الإلكتروني للاطّلاع على تفاصيل الحجز ورابط الاجتماع. يتولى Cal.com إرسال التذكيرات التي تم إعدادها.'],
    pending: ['Cal.com received your booking request. It is awaiting confirmation or payment; follow the instructions in the calendar.', 'استلم Cal.com طلب حجزك. بانتظار التأكيد أو الدفع؛ اتبع التعليمات في التقويم.']
  };
  const ar = () => document.documentElement.lang === 'ar';
  const text = key => strings[key][ar() ? 1 : 0];
  let leadState = '', calendarState = '', bookingState = '', busy = false, mounted = false, timer;
  const leadId = crypto.randomUUID(); // Retry the same save safely; no PII in browser storage.
  const seen = new Set();
  const utm = {};
  // Only conventional campaign tokens; never send qualification or contact fields to analytics.
  const query = new URLSearchParams(location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = query.get(key);
    if (value && /^[a-zA-Z0-9_.~ -]{1,120}$/.test(value) && !value.includes('@')) utm[key] = value;
  }
  let bookingUrl;
  try {
    bookingUrl = new URL(window.FIKRA_CONFIG.bookingUrl);
    if (bookingUrl.origin !== 'https://cal.com' || bookingUrl.pathname.split('/').filter(Boolean).length !== 2) throw Error();
  } catch { submit.disabled = true; status.textContent = text('saveError'); return; }
  fallback.href = bookingUrl.href;
  function render() {
    section.querySelectorAll('[data-booking-copy]').forEach(el => { el.textContent = text(el.dataset.bookingCopy); });
    submit.textContent = text(busy ? 'saving' : 'continue');
    status.textContent = leadState ? text(leadState) : '';
    calendarStatus.textContent = calendarState ? text(calendarState) : '';
    confirmation.hidden = !bookingState;
    confirmation.textContent = bookingState ? text(bookingState) : '';
    section.querySelector('.fikra-calendar-language').hidden = !ar();
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
  function validate() {
    for (const input of form.elements) {
      if (!input.willValidate) continue;
      input.setCustomValidity('');
      if (input.required && !input.value.trim()) input.setCustomValidity(text('required'));
      else if (input.name === 'email' && input.validity.typeMismatch) input.setCustomValidity(text('invalidEmail'));
      else if (input.name === 'phone' && !/^\+[1-9]\d{6,14}$/.test(input.value.replace(/[\s().-]/g, ''))) input.setCustomValidity(text('invalidPhone'));
      else if (input.name === 'website' && input.value) {
        try { if (!['https:', 'http:'].includes(new URL(input.value).protocol)) throw Error(); }
        catch { input.setCustomValidity(text('invalidWebsite')); }
      }
    }
    return form.reportValidity();
  }
  form.addEventListener('input', e => e.target.setCustomValidity?.(''));
  function mount(details) {
    if (mounted) return;
    mounted = true;
    panel.hidden = false;
    form.hidden = true;
    calendarState = 'loading'; render();
    const prefill = {name: details.name, email: details.email, attendeePhoneNumber: details.phone,
      'metadata[fikraLeadId]': leadId, ...utm, theme: 'light', layout: 'month_view', locale: 'en'};
    // This event uses Google Meet: prefill the attendee field, never change its meeting location.
    const direct = new URL(bookingUrl);
    for (const [key, value] of Object.entries(prefill)) direct.searchParams.set(key, value);
    fallback.href = direct.href;
    const fail = () => { clearTimeout(timer); calendarState = 'loadError'; render(); };
    timer = setTimeout(fail, 25000);
    // Official Cal.com vanilla embed queue, installed once and only after a persisted lead.
    (function(C, A, L) {
      const p = (a, args) => a.q.push(args);
      const d = C.document;
      C.Cal = C.Cal || function() {
        const cal = C.Cal; const args = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          const script = d.createElement('script'); script.src = A; script.async = true;
          script.onerror = fail; d.head.appendChild(script); cal.loaded = true;
        }
        if (args[0] === L) {
          const api = function() { p(api, arguments); }; const namespace = args[1]; api.q = api.q || [];
          if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], args); p(cal, ['initNamespace', namespace]); }
          else p(cal, args);
          return;
        }
        p(cal, args);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');
    window.Cal('init', {origin: 'https://cal.com'});
    window.Cal('on', {action: 'linkReady', callback: () => { clearTimeout(timer); calendarState = ''; render(); }});
    window.Cal('on', {action: 'linkFailed', callback: fail});
    window.Cal('on', {action: 'bookingSuccessfulV2', callback: e => {
      const data = e.detail?.data;
      if (!data?.uid) return;
      if (String(data.status).toUpperCase() !== 'ACCEPTED' || data.paymentRequired) {
        bookingState = 'pending'; render(); return;
      }
      bookingState = 'confirmed'; render();
      track('fikra_booking_confirmed', data.uid);
    }});
    window.Cal('inline', {elementOrSelector: '#fikra-cal-inline', calLink: bookingUrl.pathname.slice(1), config: prefill});
    window.Cal('ui', {theme: 'light', cssVarsPerTheme: {light: {'cal-brand': '#005bea'}}, hideEventTypeDetails: false, layout: 'month_view'});
    panel.querySelector('h3').focus({preventScroll: true});
    panel.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || mounted) return;
    if (!validate()) { leadState = 'invalid'; render(); return; }
    busy = true; leadState = 'saving'; submit.disabled = true; render();
    const details = Object.fromEntries(new FormData(form));
    details.name = details.name.trim(); details.email = details.email.trim();
    details.phone = details.phone.replace(/[\s().-]/g, '');
    try {
      const response = await fetch('/api/leads', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...details, id: leadId, language: ar() ? 'ar' : 'en', utm}), signal: AbortSignal.timeout(15000)});
      const saved = await response.json();
      if (!response.ok || saved.id !== leadId || saved.status !== 'saved') throw Error();
      leadState = 'saved'; track('fikra_lead_submitted', leadId); mount(details);
    } catch { leadState = 'saveError'; }
    finally { busy = false; submit.disabled = false; render(); }
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
