const { chromium, devices } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const pages = [
    ['login-prod-polish', 'https://trueserve.delivery/login'],
    ['merchant-login-prod-polish', 'https://trueserve.delivery/merchant/login'],
    ['driver-login-prod-polish', 'https://trueserve.delivery/driver/login'],
  ];

  for (const [name, url] of pages) {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.screenshot({ path: `qa-screenshots/${name}.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
