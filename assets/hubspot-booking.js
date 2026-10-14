(() => {
  const section = document.querySelector('#booking');
  if (!section) return;
  const ar = () => document.documentElement.lang === 'ar';
  const details = section.querySelector('[data-booking-project-details]');
  const summary = details.querySelector('textarea');
  const copy = details.querySelector('button');
  const status = details.querySelector('[role="status"]');
  function labels() {
    details.querySelector('summary').textContent = ar() ? 'تفاصيل مشروعك' : 'Your project details';
    details.querySelector('label').firstChild.textContent = ar() ? 'ملخّص المشروع' : 'Project summary';
    details.querySelector('p').textContent = ar()
      ? 'انسخ هذه التفاصيل لمشاركتها مع الفريق. لا تُرسل إجابات هذه الأسئلة تلقائيًا إلى HubSpot.'
      : 'Copy these details to share with the team. These questionnaire answers are not sent to HubSpot automatically.';
    copy.textContent = ar() ? 'نسخ التفاصيل' : 'Copy details';
    section.querySelector('[data-booking-fallback]').textContent = ar() ? 'افتح تقويم الحجز في نافذة جديدة ↗' : 'Open booking calendar in a new tab ↗';
    status.textContent = '';
  }
  addEventListener('fikra:qualification', ({detail}) => {
    summary.value = detail.summary; details.hidden = false; labels();
  });
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(summary.value); status.textContent = ar() ? 'تم نسخ التفاصيل' : 'Details copied'; }
    catch { details.open = true; summary.focus(); summary.select(); status.textContent = ar() ? 'حدّد النص وانسخه.' : 'Select and copy the text.'; }
  });
  addEventListener('fikra:language', labels);
  labels();
  // Use the official embed loader supplied by the calendar owner.
  const loader = document.createElement('script');
  loader.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
  loader.async = true; document.body.append(loader);
})();
