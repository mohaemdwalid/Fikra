exports.chooseProject = async function(page, project) {
  await page.locator('[name=product_count]').nth(1).check();
  await page.locator('[data-step-next]').click();
  await page.locator('[data-step="1"] label').filter({has: page.locator(`input[value="${project}"]`)}).click();
  await page.locator('[data-step-next]').click();
  if (project !== 'New Shopify Store') await page.locator('[data-step-next]').click(); // Existing-store URL only.
};
exports.bookingPageUrl = function(query = '') {
  const url = new URL('/book/' + query, process.env.PREVIEW_URL || 'http://127.0.0.1:5184/');
  if (!url.searchParams.has('lang')) url.searchParams.set('lang', 'en');
  return url.href;
};
