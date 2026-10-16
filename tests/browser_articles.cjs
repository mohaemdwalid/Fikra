const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:5184';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const context=await browser.newContext(); const page=await context.newPage();
  const errors=[],broken=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))broken.push(r.status()+' '+r.url());});
  let checks=0;
  const paths=['/articles/','/ar/articles/',...['shopify-versus-wordpress','qatar-online-business-registration','website-accessibility','website-ai-search-visibility'].flatMap(slug=>['/articles/'+slug+'/','/ar/articles/'+slug+'/'])];
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:950});
   for(const path of paths){
    await page.goto(base+path,{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' @'+width);
    assert.equal(await page.locator('html').getAttribute('lang'),path.startsWith('/ar/')?'ar':'en');
    assert.equal(await page.locator('.fikra-language').count(),1);
    if(path.endsWith('/articles/')){
     assert.equal(await page.locator('.article-card').count(),100);
     assert.equal(await page.locator('.article-topic').count(),10);
     assert.equal(await page.locator('#guide-search').isVisible(),true);
    }else{
     assert.equal(await page.locator('.article-hero img').evaluate(im=>im.complete&&im.naturalWidth===1200),true);
    }
    if(['/articles/','/ar/articles/shopify-versus-wordpress/','/articles/qatar-online-business-registration/'].includes(path))
     await page.screenshot({path:'/tmp/fikra-100-'+(path.startsWith('/ar/')?'ar':'en')+'-'+(path.endsWith('/articles/')?'library':path.split('/').at(-2))+'-'+width+'.png',fullPage:false});
    checks++;
   }
  }
  await page.goto(base+'/articles/');
  await page.locator('#guide-search').fill('WordPress');
  assert.ok(await page.locator('.article-card:visible').count()>0);
  assert.ok(await page.locator('.article-card:visible').count()<100);
  await page.getByRole('link',{name:'Shopify vs WordPress: which fits your business?',exact:true}).click();
  await page.waitForURL('**/articles/shopify-versus-wordpress/');
  await page.locator('.fikra-language').click();
  await page.waitForURL('**/ar/articles/shopify-versus-wordpress/');
  assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
  await page.goto(base+'/ar/articles/');
  await page.locator('#guide-search').fill('ووردبريس');
  assert.ok(await page.locator('.article-card:visible').count()>0);
  await page.locator('#guide-search').fill('WordPress');
  assert.ok(await page.locator('.article-card:visible').count()>0);
  await page.locator('#guide-search').fill('zzzz-no-result-12345');
  assert.equal(await page.locator('.article-card:visible').count(),0);
  assert.equal(await page.locator('.article-topic:visible').count(),0);
  await page.locator('.article-topics a[href="#topic-qatar"]').click();
  assert.equal(await page.locator('#guide-search').inputValue(),'');
  assert.equal(await page.locator('.article-card:visible').count(),100);
  await page.goto(base+'/articles/website-accessibility/');
  assert.equal(await page.locator('.article-related a[href="/#shopify-projects"]').count(),1);
  await page.locator('.seo-consult [data-fikra-booking]').click();
  await page.waitForURL('**/book/**');
  assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);
  console.log(JSON.stringify({renderChecks:checks,search:'English and Arabic queries, bilingual title matching, empty results and category reset passed',navigation:'search → comparison → Arabic equivalent; generic article → Shopify consultation passed',pageErrors:errors,brokenLocalRequests:broken},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
