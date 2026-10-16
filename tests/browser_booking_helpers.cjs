exports.chooseProjectAndBudget = async function(page, project, budget) {
  await page.locator('[data-step="0"] label').filter({has: page.locator(`input[value="${project}"]`)}).click();
  await page.locator('[name=product_count]').nth(1).check();
  await page.locator('[data-step-next]').click();
  if (project !== 'New Shopify Store') await page.locator('[data-step-next]').click(); // Existing-store URL only.
  await page.locator('[data-step="2"] label').filter({has: page.locator(`input[value="${budget}"]`)}).click();
  await page.locator('[data-step-next]').click();
};
exports.bookingPageUrl = function(query = '') {
  return new URL('/book/' + query, process.env.PREVIEW_URL || 'http://127.0.0.1:5184/').href;
};
