// Separate-page navigation and qualification flow; never creates an appointment.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const lang of (process.env.TEST_LANGUAGE ? [process.env.TEST_LANGUAGE] : ['en','ar']))for(const width of [320,390,768,1440]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{window.calCalls=[];window.Cal=(...a)=>window.calCalls.push(a)});
 await p.goto(new URL('?lang=en&utm_source=instagram&utm_campaign=consultation&email=private@example.com', process.env.PREVIEW_URL || 'http://127.0.0.1:5184/').href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.FIKRA_I18N);
 assert.equal(await p.locator('#fikra-lead-form,#booking').count(),0);
 if(lang==='ar')await p.locator('.fikra-language').click();
 const href=await p.locator('#home [data-fikra-booking]').getAttribute('href');assert.match(href,/\/book\//);assert.ok(!href.includes('email='));
 await p.locator('#home [data-fikra-booking]').click();await p.waitForURL('**/book/**');await p.waitForFunction(()=>window.FIKRA_I18N);
 assert.equal(new URL(p.url()).searchParams.get('lang'),lang);assert.equal(new URL(p.url()).searchParams.get('utm_source'),'instagram');assert.equal(await p.locator('html').getAttribute('lang'),lang);assert.equal(await p.locator('#fikra-calendar-panel').isVisible(),false);
 await p.locator('[data-step-next]').click();assert.notEqual(await p.locator('[data-step-error]').innerText(),'');assert.equal(await p.locator('[data-step="0"]').isVisible(),true);
 await p.locator('[data-step="0"] .booking-choice').nth(1).click();if(width===390||width===1440)await p.screenshot({path:`/tmp/fikra-booking-page-${lang}-${width}.png`});
 await p.locator('[name=product_count]').nth(1).check(); await p.locator('[data-step-next]').click();assert.equal(await p.locator('[data-step="1"]').isVisible(),true);
 await p.locator('[name=website]').fill('javascript:alert(1)');await p.locator('[data-step-next]').click();assert.equal(await p.locator('[data-step="1"]').isVisible(),true);
 await p.locator('[name=website]').fill('');await p.locator('[data-step-next]').click();await p.locator('[data-step="2"] .booking-choice').nth(2).click();await p.locator('[data-step-back]').click();assert.equal(await p.locator('[data-step="1"]').isVisible(),true);await p.locator('[data-step-next]').click();assert.equal(await p.locator('[name=budget]:checked').inputValue(),'Below QAR 5,000');await p.locator('[data-step-next]').click();
 await p.locator('[name=name]').fill('Booking QA');await p.locator('[name=email]').fill('qa@example.com');await p.locator('[name=phone]').fill('+97412345678');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const result=p.waitForResponse(r=>r.url().endsWith('/api/leads')&&r.request().method()==='POST');await p.locator('[type=submit]').click();const response=await result;assert.equal(response.status(),201);
 const sent=await response.request().postDataJSON();assert.equal(sent.project,'Store Redesign');assert.equal(sent.budget,'Below QAR 5,000');assert.equal(sent.language,lang);assert.equal(sent.utm.utm_source,'instagram');assert.equal(sent.website,'');assert.equal(sent.product_count,'25 to 100');
 await p.waitForFunction(()=>window.calCalls.some(c=>c[0]==='inline'));assert.equal(await p.locator('#fikra-calendar-panel').isVisible(),true);assert.equal(await p.locator('form').isVisible(),false);assert.equal(await p.evaluate(()=>window.calCalls.filter(c=>c[0]==='inline').length),1);assert.equal(await p.evaluate(()=>window.dataLayer.filter(e=>e.event==='fikra_lead_submitted').length),1);assert.deepEqual(errors,[]);console.log('PASS',lang,width,'homepage → separate page, language/UTMs, 4 steps, validation/back, persisted lead, calendar gate');await p.close();
}
const old=await b.newPage();await old.goto(new URL('#booking', process.env.PREVIEW_URL || 'http://127.0.0.1:5184/').href,{waitUntil:'domcontentloaded'});await old.waitForURL('**/book/**');console.log('PASS legacy #booking redirect');await old.close();await b.close();})().catch(e=>{console.error(e);process.exit(1)});
