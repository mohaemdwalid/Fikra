const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/i18n.js', 'utf8');
const dictionary = fs.readFileSync('assets/funnel-copy.js', 'utf8');
function page(lang, search = '') {
  const links = [];
  const events = [];
  const navigation = [];
  const location = {origin:'http://127.0.0.1:5184', search, hash:'#faq', replace: value => navigation.push(value), assign: value => navigation.push(value)};
  const document = {
    documentElement: {lang, dataset:{staticLocale:lang}},
    createElement: () => ({setAttribute(name,value){this[name]=value;},addEventListener(){}}),
    querySelector(selector) {
      if (selector === '.navbar-wrapper') return {append: el => links.push(el)};
      const match = selector.match(/hreflang="(en|ar)"/);
      return match ? {href: 'https://fikra.mohamedxmod99.workers.dev' + (match[1] === 'ar' ? '/ar/shopify-store-design/' : '/shopify-store-design/')} : null;
    }
  };
  const context = {window:{dispatchEvent:event => events.push(event)}, document, location, URL, URLSearchParams, CustomEvent:class {constructor(type, data){this.type=type;this.detail=data.detail;}}, localStorage:{getItem:()=> 'ar',setItem(){}}};
  vm.createContext(context); vm.runInContext(dictionary, context); vm.runInContext(source, context);
  return {links, events, navigation, context};
}
test('English URL stays English despite a saved Arabic preference; alternate link keeps local host and campaign', () => {
  const p = page('en', '?utm_source=instagram');
  assert.equal(p.navigation.length,0);
  assert.equal(p.links[0].href,'/ar/shopify-store-design/?utm_source=instagram#faq');
  assert.equal(p.events[0].detail,'en');
});
test('Arabic URL keeps Arabic copy and links to the matching English page', () => {
  const p = page('ar');
  assert.equal(p.links[0].href,'/shopify-store-design/?lang=en#faq');
  assert.equal(p.context.window.FIKRA_I18N.t('Our Work'),'أعمالنا');
  assert.equal(p.events[0].detail,'ar');
});
test('Legacy language query reaches the matching static page without losing attribution', () => {
  const p = page('en', '?lang=ar&utm_source=google');
  assert.deepEqual(p.navigation,['/ar/shopify-store-design/?utm_source=google#faq']);
});
