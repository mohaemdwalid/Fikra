// Combined first step and branching qualification; no appointment created.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const lang of ['en', 'ar']) for (const width of [390, 1440]) {
    for (const project of ['New Shopify Store', 'Store Redesign', 'Improvements']) {
      const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(new URL('/book/?lang=' + lang, process.env.PREVIEW_URL || 'http://127.0.0.1:5184/').href, { waitUntil: 'domcontentloaded' });
      const next = page.locator('[data-step-next]'), back = page.locator('[data-step-back]');
      const first = page.locator('[data-step="0"]');
      assert.equal(await first.locator('fieldset').count(), 2);
      assert.equal(await first.locator('[name=project]').first().isVisible(), true);
      assert.equal(await first.locator('[name=product_count]').first().isVisible(), true);
      await next.click();
      assert.equal(await first.isVisible(), true);
      assert.equal(await page.locator(':focus').getAttribute('name'), 'project');
      await page.locator('[name=project][value="' + project + '"]').check();
      await next.click();
      assert.equal(await first.isVisible(), true);
      assert.equal(await page.locator(':focus').getAttribute('name'), 'product_count');
      assert.notEqual(await page.locator('[data-step-error]').textContent(), '');
      await page.locator('[name=product_count]').nth(1).check();
      assert.equal(await page.locator('[role=progressbar]').getAttribute('aria-valuemax'), project === 'New Shopify Store' ? '3' : '4');
      if (project === 'New Shopify Store') {
        await page.screenshot({ path: `/tmp/fikra-combined-${lang}-${width}.png`, fullPage: true });
      }
      await next.click();
      if (project !== 'New Shopify Store') {
        assert.equal(await page.locator('[data-step="1"]').isVisible(), true);
        await back.click();
        assert.equal(await first.isVisible(), true);
        assert.equal(await page.locator('[name=project]:checked').inputValue(), project);
        assert.equal(await page.locator('[name=product_count]:checked').inputValue(), '11–50');
        await next.click();
        await page.locator('[name=website]').fill('javascript:alert(1)');
        await next.click();
        assert.equal(await page.locator('[data-step="1"]').isVisible(), true);
        await page.locator('[name=website]').fill('');
        await next.click();
      } else {
        assert.equal(await page.locator('[data-step="1"]').isVisible(), false);
      }
      assert.equal(await page.locator('[data-step="2"]').isVisible(), true);
      assert.equal(await page.locator('[name=budget]').count(), 3);
      assert.match(await page.locator('[data-step="2"] legend').innerText(), lang === 'ar' ? /٥٬٠٠٠/ : /5,000/);
      await back.click();
      assert.equal(await page.locator(`[data-step="${project === 'New Shopify Store' ? 0 : 1}"]`).isVisible(), true);
      await next.click();
      await page.locator('[name=budget]').first().check();
      await next.click();
      assert.equal(await page.locator('[data-step="3"]').isVisible(), true);
      assert.equal(await page.locator('[name=product_count]:checked').inputValue(), '11–50');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(errors, []);
      console.log(lang, width, project, 'combined first step, validation, back and branching passed');
      await page.close();
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
