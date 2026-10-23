// Callback request regression check: persisted lead confirmation, no calendar embed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const {chooseProject, bookingPageUrl}=require('./browser_booking_helpers.cjs');

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  for (const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(bookingPageUrl(),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.FIKRA_I18N);
  await chooseProject(page,'Low store sales');
  const form=page.locator('#fikra-lead-form');
  await form.locator('[name=name]').fill('QA');
  assert.equal(await form.locator('[name=email]').count(),0);
  await form.locator('[name=phone]').fill('+97412345678');

  await page.route('**/api/leads',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'}));
  await form.locator('[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#lead-status').textContent.includes('could not save'));
  assert.equal(await form.isVisible(),true);
  assert.equal(await page.locator('#lead-success').isVisible(),false);
  await page.unroute('**/api/leads');

  await page.route('**/api/leads',route=>{
    const payload=route.request().postDataJSON();
    assert.equal('email' in payload,false);
    assert.equal(payload.budget,'Not sure');
    assert.equal(payload.project,'Low store sales');
    const id=payload.id;
    route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({id,status:'saved'})});
  });
  await form.locator('[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#lead-success').hidden===false);
  assert.equal(await form.isVisible(),false);
  assert.equal(await page.locator('#booking-title').innerText(),'Your Shopify journey starts here!');
  assert.match(await page.locator('#lead-success').innerText(),/We’ll call you shortly/);
  assert.equal(await page.locator('iframe[src*="cal.com"]').count(),0);
  assert.equal(await page.locator('script[src*="cal.com"]').count(),0);
  assert.equal(await page.evaluate(()=>window.dataLayer.filter(event=>event.event==='fikra_lead_submitted').length),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`/tmp/fikra-phone-thanks-en-${width}.png`});
  await page.getByRole('button',{name:'التبديل إلى العربية'}).click();
  assert.match(await page.locator('#lead-success').innerText(),/سنتصل بك قريبًا/);
  assert.equal(await page.locator('#booking-title').innerText(),'رحلتك مع شوبيفاي تبدأ هنا!');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`/tmp/fikra-phone-thanks-ar-${width}.png`});
  assert.deepEqual(errors,[]);
  await page.close();
  }
  console.log('PASS: failed save remains on form; saved lead shows bilingual callback confirmation; no Cal.com embed; one lead event');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
