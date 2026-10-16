const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5184/';
const routes = ['/', '/articles/', '/articles/what-is-shopify/', '/shopify-store-design/', '/book/'];
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 for (const width of [390,1440]) {
  for (const route of routes) {
   const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   // Older versions saved English automatically. It must not override the default.
   await context.addInitScript(() => localStorage.setItem('fikra-language','en'));
   const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(new URL(route+'?utm_source=qa#main',base).href);
   if(route!=='/book/')await page.waitForURL(url=>url.pathname==='/ar'+route);
   await page.waitForFunction(()=>window.FIKRA_I18N);
   assert.equal(await page.locator('html').getAttribute('lang'),'ar');
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   assert.equal(new URL(page.url()).searchParams.get('utm_source'),'qa');
   assert.equal(new URL(page.url()).hash,'#main');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(route==='/'){
    const kicker=page.locator('#home .editorial-hero-copy .proposal-kicker');
    assert.equal(await kicker.evaluate(el=>getComputedStyle(el).textAlign),'center');
    await kicker.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await page.locator('.editorial-hero-copy').screenshot({path:`/tmp/fikra-centered-kicker-ar-${width}.png`});
   }
   await page.locator('.fikra-language').click();
   await page.waitForFunction(()=>document.documentElement.lang==='en' && window.FIKRA_I18N);
   await page.reload();await page.waitForFunction(()=>window.FIKRA_I18N);
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   await page.goto(new URL('/articles/what-is-shopify/',base).href);
   await page.waitForFunction(()=>window.FIKRA_I18N);
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   assert.deepEqual(errors,[]);await context.close();console.log(width,route,'Arabic default, old preference reset, English selection retained PASS');
  }
 }
 for(const route of routes.filter(r=>r!=='/book/')){
  const page=await browser.newPage({javaScriptEnabled:false});await page.goto(new URL(route,base).href);
  await page.waitForURL(url=>url.pathname==='/ar'+route);
  assert.equal(await page.locator('html').getAttribute('lang'),'ar');await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
