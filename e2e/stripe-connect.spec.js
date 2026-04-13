const { test, expect } = require('@playwright/test');

test('merchant connect stripe', async ({ page }) => {
  const logs = [];
  const errors = [];
  const failedResponses = [];
  const baseURL = process.env.BASE_URL || 'https://trueserve.delivery';

  page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('response', async (response) => {
    if (response.status() >= 400) {
      let preview = "";
      let headers = {};
      if (response.url().includes("/merchant/dashboard")) {
        try {
          preview = (await response.text()).slice(0, 2000);
          headers = response.headers();
        } catch (error) {
          preview = `<<failed to read body: ${error.message}>>`;
        }
      }
      failedResponses.push({
        url: response.url(),
        status: response.status(),
        headers,
        preview,
      });
    }
  });

  await page.goto(`${baseURL}/merchant/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="email"]').fill('info@krave489.com');
  await page.locator('input[name="password"]').fill('Krave489!2026');
  await page.getByRole('button', { name: /establish session/i }).click();
  await page.waitForURL('**/merchant/dashboard', { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  const bannerButton = page.getByRole('button', { name: /connect stripe account/i });
  await expect(bannerButton).toBeVisible({ timeout: 15000 });
  await bannerButton.click();

  await page.waitForTimeout(8000);
  console.log('URL:', page.url());
  console.log('PAGE_ERRORS:', JSON.stringify(errors, null, 2));
  console.log('FAILED_RESPONSES:', JSON.stringify(failedResponses, null, 2));
  console.log('CONSOLE_LOGS:', JSON.stringify(logs.slice(-30), null, 2));
  await page.screenshot({ path: '/tmp/stripe-connect-after-click.png', fullPage: true });
});
