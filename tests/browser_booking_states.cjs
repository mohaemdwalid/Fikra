// Callback request regression check: persisted lead confirmation, no calendar embed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const {chooseProjectAndBudget, bookingPageUrl}=require('./browser_booking_helpers.cjs');

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(bookingPageUrl(),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.FIKRA_I18N);
  await chooseProjectAndBudget(page,'Improvements','QAR 5,000+ — discuss scope');
  const form=page.locator('#fikra-lead-form');
  await form.locator('[name=name]').fill('QA');
  await form.locator('[name=email]').fill('qa@example.com');
  await form.locator('[name=phone]').fill('+97412345678');

  await page.route('**/api/leads',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'}));
  await form.locator('[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#lead-status').textContent.includes('could not save'));
  assert.equal(await form.isVisible(),true);
  assert.equal(await page.locator('#lead-success').isVisible(),false);
  await page.unroute('**/api/leads');

  await page.route('**/api/leads',route=>{
    const id=route.request().postDataJSON().id;
    route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({id,status:'saved'})});
  });
  await form.locator('[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#lead-success').hidden===false);
  assert.equal(await form.isVisible(),false);
  assert.match(await page.locator('#lead-success').innerText(),/I’ll call you to discuss your project/);
  assert.equal(await page.locator('iframe[src*="cal.com"]').count(),0);
  assert.equal(await page.locator('script[src*="cal.com"]').count(),0);
  assert.equal(await page.evaluate(()=>window.dataLayer.filter(event=>event.event==='fikra_lead_submitted').length),1);
  await page.getByRole('button',{name:'التبديل إلى العربية'}).click();
  assert.match(await page.locator('#lead-success').innerText(),/سأتصل بك لمناقشة مشروعك/);
  assert.deepEqual(errors,[]);
  console.log('PASS: failed save remains on form; saved lead shows bilingual callback confirmation; no Cal.com embed; one lead event');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
