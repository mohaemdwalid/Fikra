// Browser regression check; never submits a Cal.com appointment.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const assert=require('node:assert/strict');
const {chooseProjectAndBudget, bookingPageUrl}=require('./browser_booking_helpers.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [lang,width] of [['en',1440],['en',390],['ar',1440],['ar',390]]) {
  const context=await browser.newContext({viewport:{width,height:1000},timezoneId:'Asia/Qatar'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*.mp4',r=>r.abort());await page.goto(bookingPageUrl('?utm_source=instagram&utm_campaign=consultation'));
  await page.waitForFunction(()=>window.FIKRA_I18N);
  if(lang==='ar')await page.getByRole('button',{name:'التبديل إلى العربية'}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  const form=page.locator('#fikra-lead-form');await form.scrollIntoViewIfNeeded();
  await page.locator('[data-step-next]').click();assert.equal(await page.locator('#fikra-calendar-panel').isVisible(),false);
  await chooseProjectAndBudget(page, 'Store Redesign', 'QAR 4,000–6,000');
  await form.locator('[name=name]').fill('Fikra QA Test');await form.locator('[name=email]').fill('fikra-qa@example.com');await form.locator('[name=phone]').fill('+974 1234 5678');
  await page.locator('#booking').screenshot({path:`/tmp/fikra-${lang}-${width}-form.png`});
  const response=page.waitForResponse(r=>r.url().endsWith('/api/leads')&&r.request().method()==='POST');await form.locator('[type=submit]').click();assert.equal((await response).status(),201);
  await page.waitForSelector('#fikra-cal-inline iframe',{timeout:30000});
  const frame=page.frameLocator('#fikra-cal-inline iframe');await frame.getByText('Free Shopify Consultation',{exact:true}).waitFor({timeout:45000});
  await frame.locator('[data-testid=day]:not([disabled])').nth(1).click();
  await frame.locator('[data-testid=time]:not([disabled])').first().click({timeout:30000});
  await frame.locator('input[name=name]').waitFor({timeout:10000});
  console.log(lang,width,'PREFILL',await frame.locator('input').evaluateAll(els=>els.map(e=>({name:e.name,type:e.type,value:e.value}))), 'calendar', (await frame.locator('body').innerText()).slice(-3500));
  assert.equal(await frame.locator('input[name=name]').inputValue(),'Fikra QA Test');
  assert.equal(await frame.locator('input[name=email]').inputValue(),'fikra-qa@example.com');
  assert.equal(await frame.locator('input[name=attendeePhoneNumber]').inputValue(),'12345678');
  assert.match(await frame.locator('body').innerText(), /\+974/);
  assert.equal(new URL(await page.locator('[data-booking-fallback]').getAttribute('href')).searchParams.get('utm_source'), 'instagram');
  const ev=await page.evaluate(()=>window.dataLayer.filter(x=>x.event?.startsWith('fikra_')));assert.equal(ev.length,1);assert.equal(ev[0].event,'fikra_lead_submitted');
  assert.equal(await page.locator('#booking-confirmation').isVisible(),false);
  console.log('LAYOUT',lang,width,await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,load:document.querySelector('#calendar-status').textContent})), 'errors',errors);
  await page.locator('#booking').screenshot({path:`/tmp/fikra-${lang}-${width}-calendar.png`});await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
