import { test, expect } from '@playwright/test';

test('krave flow', async ({ page }) => {
  await page.goto('https://trueserve.delivery', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa-screenshots/trueserve-home-krave.png', fullPage: true });

  await page.goto('https://trueserve.delivery/merchant/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'info@krave489.com');
  await page.fill('input[type="password"]', 'Krave489!2026');
  await page.getByRole('button', { name: /establish session/i }).click();
  await page.waitForTimeout(15000);
  console.log(`Merchant login URL: ${page.url()}`);
  await page.screenshot({ path: 'qa-screenshots/krave-merchant-login-after-submit.png', fullPage: true });

  if (page.url().includes('/merchant/dashboard')) {
    await page.screenshot({ path: 'qa-screenshots/krave-merchant-dashboard.png', fullPage: true });
  }

  await page.goto('https://trueserve.delivery/restaurants/cba58722-67c6-4457-bc5f-791ffd6ab41b', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa-screenshots/krave-restaurant-page.png' });
});
