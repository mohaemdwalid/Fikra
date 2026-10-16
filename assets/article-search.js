(() => {
  const search = document.querySelector('.article-search');
  if (!search) return;
  const input = search.querySelector('input');
  const status = search.querySelector('[role="status"]');
  const cards = [...document.querySelectorAll('.article-card')];
  const sections = [...document.querySelectorAll('.article-topic')];
  const filters = [...document.querySelectorAll('.article-topics a')];
  const pagination = [...document.querySelectorAll('.article-pagination')];
  const results = document.querySelector('#article-results');
  const ar = document.documentElement.lang === 'ar';
  const pageSize = 12;
  const number = value => value.toLocaleString(ar ? 'ar' : 'en');
  const normalise = value => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
  const texts = new Map(cards.map(card => [card, normalise(card.textContent + ' ' + card.dataset.searchTerms)]));
  let category = '', currentPage = 1;

  function readLocation() {
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    const requested = params.get('topic') || (location.hash.startsWith('#topic-') ? location.hash.slice(7) : '');
    category = filters.some(link => link.dataset.category === requested) ? requested : '';
    currentPage = Math.max(1, parseInt(params.get('page'), 10) || 1);
  }

  function saveLocation() {
    const url = new URL(location.href);
    for (const key of ['q', 'topic', 'page']) url.searchParams.delete(key);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    if (category) url.searchParams.set('topic', category);
    if (currentPage > 1) url.searchParams.set('page', String(currentPage));
    if (url.hash.startsWith('#topic-')) url.hash = '';
    history.replaceState(null, '', url);
  }

  function button(label, page, {disabled = false, active = false, ariaLabel = label} = {}) {
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = label;
    control.disabled = disabled;
    control.setAttribute('aria-label', ariaLabel);
    if (active) control.setAttribute('aria-current', 'page');
    control.addEventListener('click', () => {
      currentPage = page;
      update();
      results.scrollIntoView({block: 'start'});
      results.focus({preventScroll: true});
    });
    return control;
  }

  function update({save = true} = {}) {
    const words = normalise(input.value).split(' ').filter(Boolean);
    const matches = cards.filter(card => (!category || card.dataset.category === category) && words.every(word => texts.get(card).includes(word)));
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    currentPage = Math.min(currentPage, pages);
    const start = (currentPage - 1) * pageSize;
    const visible = new Set(matches.slice(start, start + pageSize));
    cards.forEach(card => { card.hidden = !visible.has(card); });
    sections.forEach(section => { section.hidden = ![...section.querySelectorAll('.article-card')].some(card => visible.has(card)); });
    filters.forEach(link => {
      if (link.dataset.category === category) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    status.textContent = matches.length
      ? (ar ? `عرض ${number(start + 1)}–${number(Math.min(start + pageSize, matches.length))} من ${number(matches.length)} مقال` : `Showing ${number(start + 1)}–${number(Math.min(start + pageSize, matches.length))} of ${number(matches.length)} articles`)
      : (ar ? 'لا توجد مقالات مطابقة. جرّب كلمة أخرى أو اختر كل المواضيع.' : 'No matching articles. Try another search or choose All topics.');
    pagination.forEach(nav => {
      nav.replaceChildren();
      nav.hidden = pages <= 1;
      if (pages <= 1) return;
      nav.append(button(ar ? 'السابق' : 'Previous', currentPage - 1, {disabled: currentPage === 1}));
      for (let page = 1; page <= pages; page++) {
        nav.append(button(number(page), page, {active: currentPage === page, ariaLabel: ar ? `الصفحة ${number(page)}` : `Page ${page}`}));
      }
      nav.append(button(ar ? 'التالي' : 'Next', currentPage + 1, {disabled: currentPage === pages}));
    });
    if (save) saveLocation();
  }

  search.hidden = false;
  input.addEventListener('input', () => { currentPage = 1; update(); });
  filters.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    category = link.dataset.category;
    input.value = '';
    currentPage = 1;
    update();
  }));
  window.addEventListener('popstate', () => { readLocation(); update({save: false}); });
  readLocation();
  update({save: false});
})();
