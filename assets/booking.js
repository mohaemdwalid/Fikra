(() => {
  'use strict';
  const section = document.querySelector('#booking');
  const t = text => window.FIKRA_I18N?.t(text) || text;
  const locale = () => document.documentElement.lang === 'ar' ? 'ar-QA' : 'en-GB';
  const timezone = 'Asia/Qatar';
  const today = new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  const maxDay = new Date(`${today}T12:00:00Z`); maxDay.setUTCDate(maxDay.getUTCDate() + 60);
  const latest = maxDay.toISOString().slice(0, 10);
  let month = new Date(`${today.slice(0, 7)}-01T12:00:00Z`);
  let selectedDate = null, selectedSlot = null, busy = false, request = null;
  const monthLabel = section.querySelector('[data-month]');
  const days = section.querySelector('[data-days]');
  const weekdays = section.querySelector('[data-weekdays]');
  const times = section.querySelector('[data-times]');
  const status = section.querySelector('[data-booking-status]');
  const form = section.querySelector('form');
  const submit = form.querySelector('[type="submit"]');
  const success = section.querySelector('[data-booking-success]');
  const before = section.querySelector('[data-month-prev]');
  const after = section.querySelector('[data-month-next]');
  function renderCalendar() {
    monthLabel.textContent = new Intl.DateTimeFormat(locale(), {month: 'long', year: 'numeric', timeZone: 'UTC'}).format(month);
    weekdays.replaceChildren(); days.replaceChildren();
    for (let i = 0; i < 7; i++) {
      const label = document.createElement('span');
      label.textContent = new Intl.DateTimeFormat(locale(), {weekday: 'short', timeZone: 'UTC'}).format(new Date(Date.UTC(2026, 0, 4 + i)));
      weekdays.append(label);
    }
    const offset = month.getUTCDay();
    const count = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    for (let i = 0; i < offset; i++) { const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); days.append(blank); }
    for (let i = 1; i <= count; i++) {
      const date = `${month.toISOString().slice(0, 7)}-${String(i).padStart(2, '0')}`;
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = new Intl.NumberFormat(locale()).format(i);
      button.setAttribute('aria-label', new Intl.DateTimeFormat(locale(), {dateStyle: 'full', timeZone: 'UTC'}).format(new Date(`${date}T12:00:00Z`)));
      button.setAttribute('aria-pressed', String(date === selectedDate));
      button.disabled = busy || date < today || date > latest;
      if (date === today) button.setAttribute('aria-current', 'date');
      button.addEventListener('click', () => selectDate(date)); days.append(button);
    }
    before.disabled = busy || month.toISOString().slice(0, 7) <= today.slice(0, 7);
    after.disabled = busy || month.toISOString().slice(0, 7) >= latest.slice(0, 7);
    before.setAttribute('aria-label', t('Previous month'));
    after.setAttribute('aria-label', t('Next month'));
  }
  async function selectDate(date) {
    selectedDate = date; selectedSlot = null; submit.disabled = true;
    status.textContent = ''; times.textContent = t('Loading available times…'); renderCalendar();
    request?.abort(); request = new AbortController();
    try {
      const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, {signal: request.signal});
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (date !== selectedDate) return;
      times.replaceChildren();
      if (!data.configured) { times.textContent = t('Availability is being configured. Contact us on Instagram.'); return; }
      if (!data.slots.length) { times.textContent = t('No times available on this day. Choose another date.'); return; }
      for (const slot of data.slots) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'fikra-slot';
        button.textContent = new Intl.DateTimeFormat(locale(), {timeZone: timezone, hour: 'numeric', minute: '2-digit'}).format(new Date(slot.value));
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          selectedSlot = slot.value; submit.disabled = false;
          times.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        });
        times.append(button);
      }
    } catch (error) {
      if (error.name !== 'AbortError') times.textContent = t('Booking is not connected. Please contact us on Instagram.');
    }
  }
  function moveMonth(delta) {
    month.setUTCMonth(month.getUTCMonth() + delta); renderCalendar();
  }
  before.addEventListener('click', () => moveMonth(-1));
  after.addEventListener('click', () => moveMonth(1));
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-fikra-booking]');
    if (!trigger) return;
    event.preventDefault(); event.stopImmediatePropagation(); section.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    if (document.querySelector('.w-nav-button.w--open')) document.querySelector('.w-nav-button').click();
  }, true);
  const icsDate = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !form.reportValidity()) return;
    if (!selectedSlot) { status.textContent = t('Select a time first.'); return; }
    busy = true; submit.disabled = true; submit.textContent = t('Confirming…');
    times.querySelectorAll('button').forEach(button => { button.disabled = true; }); renderCalendar();
    const fields = new FormData(form);
    const payload = {name: fields.get('name'), email: fields.get('email'), project: fields.get('project'), slot: selectedSlot};
    try {
      const response = await fetch('/api/bookings', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) { await selectDate(selectedDate); status.textContent = t('This time is no longer available. Choose another slot.'); }
        else status.textContent = t('Please try again or contact us on Instagram.');
        return;
      }
      form.hidden = true; success.hidden = false;
      const heading = document.createElement('h3'); heading.dataset.i18n = 'Your appointment is reserved.'; heading.textContent = t(heading.dataset.i18n);
      const date = document.createElement('p'); date.textContent = new Intl.DateTimeFormat(locale(), {dateStyle: 'full', timeStyle: 'short', timeZone: timezone}).format(new Date(data.slot)) + ' · ' + timezone;
      const reference = document.createElement('p'); reference.className = 'fikra-booking-reference'; reference.textContent = `#${data.id}`; reference.dir = 'ltr';
      const download = document.createElement('a'); download.className = 'fikra-action'; download.dataset.i18n = 'Save appointment to calendar'; download.textContent = t(download.dataset.i18n);
      const start = new Date(data.slot); const end = new Date(start.getTime() + data.durationMinutes * 60000);
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FIKRA//Booking//EN', 'BEGIN:VEVENT', `UID:${data.id}@fikra.local`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, 'SUMMARY:FIKRA Shopify discovery call', 'DESCRIPTION:Contact @fikraagency.qa on Instagram to arrange call details.', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
      download.href = URL.createObjectURL(new Blob([ics], {type: 'text/calendar;charset=utf-8'})); download.download = 'fikra-appointment.ics';
      success.replaceChildren(heading, date, reference, download);
      const note = document.createElement('p'); note.dataset.i18n = 'Booking details are stored to arrange your call. Email confirmations are not enabled yet.'; note.textContent = t(note.dataset.i18n); success.append(note);
      const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'fikra-booking-reset'; reset.dataset.i18n = 'Book another call'; reset.textContent = t(reset.dataset.i18n);
      reset.addEventListener('click', () => { URL.revokeObjectURL(download.href); form.reset(); form.hidden = false; success.hidden = true; selectDate(selectedDate); }); success.append(reset);
      success.tabIndex = -1; success.focus();
    } catch { status.textContent = t('Please try again or contact us on Instagram.'); }
    finally { busy = false; submit.textContent = t('Confirm booking'); submit.disabled = !selectedSlot; times.querySelectorAll('button').forEach(button => { button.disabled = false; }); renderCalendar(); }
  });
  window.addEventListener('fikra:language', () => { renderCalendar(); if (selectedDate && !busy) selectDate(selectedDate); });
  renderCalendar();
})();
