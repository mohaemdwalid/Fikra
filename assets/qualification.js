(() => {
  'use strict';
  const dialog = document.createElement('dialog');
  dialog.className = 'fikra-qualification';
  dialog.setAttribute('aria-labelledby', 'qualification-title');
  document.body.append(dialog);
  const answers = {};
  let step = 0, opener = null;
  const copy = (en, ar) => document.documentElement.lang === 'ar' ? ar : en;
  const questions = [
    {key: 'service', en: 'What do you need for your Shopify store?', ar: 'ما الذي تحتاجه لمتجرك على شوبيفاي؟', options: [['A new Shopify store', 'إنشاء متجر شوبيفاي جديد'], ['Redesign my existing store', 'إعادة تصميم متجري الحالي'], ['Improve specific pages or features', 'تحسين صفحات أو خصائص محدّدة'], ['I need advice first', 'أحتاج إلى استشارة أولًا']]},
    {key: 'brand', en: 'Tell us about your brand.', ar: 'أخبرنا عن علامتك التجارية.'},
    {key: 'products', en: 'How many products do you plan to sell?', ar: 'كم منتجًا تنوي عرضه في المتجر؟', options: [['1–20 products', 'من ١ إلى ٢٠ منتجًا'], ['21–50 products', 'من ٢١ إلى ٥٠ منتجًا'], ['51–100 products', 'من ٥١ إلى ١٠٠ منتج'], ['More than 100 products', 'أكثر من ١٠٠ منتج'], ['Not sure yet', 'لم أحدّد بعد']]},
    {key: 'timing', en: 'When would you like to launch?', ar: 'متى ترغب في إطلاق المتجر؟', options: [['As soon as possible', 'في أقرب وقت ممكن'], ['Within 1 month', 'خلال شهر'], ['Within 2–3 months', 'خلال شهرين إلى ثلاثة أشهر'], ['Just exploring for now', 'أستكشف الخيارات حاليًا']]},
    {key: 'budget', en: 'Do you have a budget in mind?', ar: 'هل لديك ميزانية محدّدة؟'}
  ];
  function save(form) {
    const data = new FormData(form);
    if (step === 1) { answers.brand = data.get('brand').trim(); answers.website = data.get('website').trim(); }
    else answers[questions[step].key] = data.get('answer')?.trim() || '';
  }
  function render(focus = true) {
    const q = questions[step];
    dialog.replaceChildren();
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'fikra-close'; close.textContent = '×';
    close.setAttribute('aria-label', copy('Close questionnaire', 'إغلاق الأسئلة'));
    close.addEventListener('click', () => dialog.close());
    const progress = document.createElement('p'); progress.className = 'qualification-progress';
    progress.textContent = copy(`Question ${step + 1} of ${questions.length}`, `السؤال ${step + 1} من ${questions.length}`);
    const title = document.createElement('h2'); title.id = 'qualification-title'; title.textContent = copy(q.en, q.ar);
    const form = document.createElement('form'); form.className = 'qualification-form';
    if (q.options) {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend'); legend.className = 'qualification-sr'; legend.textContent = copy(q.en, q.ar); fieldset.append(legend);
      q.options.forEach(([en, ar]) => {
        const label = document.createElement('label'); label.className = 'qualification-option';
        const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'answer'; radio.value = en; radio.required = true; radio.checked = answers[q.key] === en;
        const text = document.createElement('span'); text.textContent = copy(en, ar); label.append(radio, text); fieldset.append(label);
      });
      form.append(fieldset);
    } else if (step === 1) {
      const brandLabel = document.createElement('label'); brandLabel.textContent = copy('Brand or business name', 'اسم العلامة أو النشاط التجاري');
      const brand = document.createElement('input'); brand.name = 'brand'; brand.required = true; brand.maxLength = 120; brand.autocomplete = 'organization'; brand.value = answers.brand || ''; brandLabel.append(brand);
      const websiteLabel = document.createElement('label'); websiteLabel.textContent = copy('Website or Instagram (optional)', 'الموقع أو حساب إنستغرام (اختياري)');
      const website = document.createElement('input'); website.name = 'website'; website.maxLength = 250; website.dir = 'ltr'; website.placeholder = 'example.com / @yourbrand'; website.value = answers.website || ''; websiteLabel.append(website);
      form.append(brandLabel, websiteLabel);
    } else {
      const note = document.createElement('p'); note.textContent = copy('Optional. Choose an approximate budget in QAR, or discuss it on the call.', 'اختياري. اختر الميزانية التقريبية بالريال القطري، أو ناقشها خلال المكالمة.');
      const label = document.createElement('label'); label.textContent = copy('Project budget (optional)', 'ميزانية المشروع (اختياري)');
      const input = document.createElement('select'); input.name = 'answer';
      const ranges = [
        ['', 'Select a budget', 'اختر الميزانية'],
        ['Under QAR 3,000', 'Under QAR 3,000', 'أقل من ٣٬٠٠٠ ر.ق'],
        ['QAR 3,000–4,999', 'QAR 3,000–4,999', 'من ٣٬٠٠٠ إلى ٤٬٩٩٩ ر.ق'],
        ['QAR 5,000–9,999', 'QAR 5,000–9,999', 'من ٥٬٠٠٠ إلى ٩٬٩٩٩ ر.ق'],
        ['QAR 10,000 or more', 'QAR 10,000 or more', '١٠٬٠٠٠ ر.ق أو أكثر'],
        ['To discuss on the call', 'Discuss on the call', 'أناقشها خلال المكالمة']
      ];
      ranges.forEach(([value, en, ar]) => { const option = document.createElement('option'); option.value = value; option.textContent = copy(en, ar); input.append(option); });
      input.value = answers.budget || ''; label.append(input); form.append(note, label);
    }
    const actions = document.createElement('div'); actions.className = 'qualification-actions';
    if (step) {
      const back = document.createElement('button'); back.type = 'button'; back.className = 'qualification-back'; back.textContent = copy('Back', 'السابق');
      back.addEventListener('click', () => { save(form); step--; render(); }); actions.append(back);
    }
    const next = document.createElement('button'); next.type = 'submit'; next.className = 'proposal-cta'; next.textContent = step === 4 ? copy('Choose a date & time', 'اختر اليوم والوقت') : copy('Continue', 'متابعة'); actions.append(next); form.append(actions);
    const privacy = document.createElement('p'); privacy.className = 'qualification-note'; privacy.textContent = copy('Next, choose your appointment in the calendar. You can copy your project details to share with the team.', 'بعد ذلك اختر موعدك في التقويم. يمكنك نسخ تفاصيل مشروعك لمشاركتها مع الفريق.'); form.append(privacy);
    form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity()) return; save(form);
      if (step < questions.length - 1) { step++; render(); return; }
      const target = document.querySelector('#fikra-booking-form [name="project"]');
      const lines = [['Service', answers.service], ['Brand', answers.brand], ['Website / Instagram', answers.website || 'Not provided'], ['Products', answers.products], ['Preferred launch', answers.timing], ['Budget', answers.budget || 'To discuss']];
      const summary = lines.map(([key, value]) => `${key}: ${value}`).join('\n');
      window.dispatchEvent(new CustomEvent('fikra:qualification', {detail: {summary}}));
      if (target) {
        const previous = target.dataset.qualificationSummary || '';
        const extra = previous && target.value.startsWith(previous) ? target.value.slice(previous.length).trim() : target.value.trim();
        target.value = summary + (extra ? '\n\n' + extra : ''); target.dataset.qualificationSummary = summary;
      }
      dialog.close();
      document.querySelector('.w-nav-button.w--open')?.click();
      const section = document.querySelector('#booking');
      section.scrollIntoView({behavior: 'instant'});
      const heading = section.querySelector('h2'); heading.tabIndex = -1; heading.focus({preventScroll: true});
    });
    dialog.append(close, progress, title, form);
    if (focus && dialog.open) title.tabIndex = -1, title.focus();
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-fikra-booking]');
    if (!trigger) return;
    event.preventDefault(); event.stopImmediatePropagation(); opener = trigger; step = 0;
    render(false); dialog.showModal();
  }, true);
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll: true}); });
  window.addEventListener('fikra:language', () => { if (dialog.open) { const form = dialog.querySelector('form'); if (form) save(form); render(); } });
})();
