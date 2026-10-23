// Product count, second-slide service choice, and conditional existing-store URL.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const lang of ['en','ar']) for(const width of [390,1440]) for(const project of ['New Shopify Store','Store Redesign','Improvements','Low store sales']){
  const page=await browser.newPage({viewport:{width,height:1100},reducedMotion:'reduce'});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('/book/?lang='+lang,process.env.PREVIEW_URL || 'http://127.0.0.1:5184/').href,{waitUntil:'domcontentloaded'});
  const next=page.locator('[data-step-next]'),back=page.locator('[data-step-back]');
  const first=page.locator('[data-step="0"]'),service=page.locator('[data-step="1"]'),url=page.locator('[data-step="2"]'),contact=page.locator('[data-step="3"]');
  assert.deepEqual(await first.locator('[name=product_count]').evaluateAll(xs=>xs.map(x=>x.value)),['Under 25','25 to 100','100 to 500','More than 500']);
  assert.equal(await first.locator('[name=project]').count(),0);
  await next.click();assert.equal(await first.isVisible(),true);assert.equal(await page.locator(':focus').getAttribute('name'),'product_count');
  await first.locator('[name=product_count]').nth(1).check();await next.click();
  assert.equal(await service.isVisible(),true);assert.equal(await service.locator('[name=project]').count(),4);
  if(lang==='ar'){
   assert.equal(await service.locator('legend').innerText(),'شنو الخدمة اللي تحتاجها لبراندك؟');
   for(const text of ['تصميم متجر إلكتروني جديد','إعادة تصميم متجري الحالي','تحسين تجربة الشراء وزيادة التحويلات','متجري فيه زيارات، بس ما تجيني مبيعات'])assert.ok((await service.innerText()).includes(text));
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await next.click();assert.equal(await service.isVisible(),true);assert.equal(await page.locator(':focus').getAttribute('name'),'project');
  await service.locator('[name=project][value="'+project+'"]').check();
  assert.equal(await page.locator('[role=progressbar]').getAttribute('aria-valuemax'),project==='New Shopify Store'?'3':'4');
  if(project==='Low store sales')await page.screenshot({path:`/tmp/fikra-service-${lang}-${width}.png`,fullPage:true});
  await back.click();assert.equal(await first.isVisible(),true);await next.click();assert.equal(await service.locator('[name=project]:checked').inputValue(),project);
  await next.click();
  if(project!=='New Shopify Store'){
   assert.equal(await url.isVisible(),true);await page.locator('[name=website]').fill('javascript:alert(1)');await next.click();assert.equal(await url.isVisible(),true);
   await page.locator('[name=website]').fill('');await next.click();
  }else assert.equal(await url.isVisible(),false);
  assert.equal(await contact.isVisible(),true);assert.equal(await page.locator('[name=budget][type=radio]').count(),0);
  assert.equal(await page.locator('[name=budget]').inputValue(),'Not sure');assert.doesNotMatch(await page.locator('#fikra-lead-form').innerText(),/5,000|٥٬٠٠٠/);
  await back.click();assert.equal(await (project==='New Shopify Store'?service:url).isVisible(),true);await next.click();assert.equal(await contact.isVisible(),true);
  assert.equal(await page.locator('[name=product_count]:checked').inputValue(),'25 to 100');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(lang,width,project,'second-slide service, validation, back and branching passed');await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
