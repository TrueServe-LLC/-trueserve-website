import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/TrueServe/);
});

test('can navigate to login', async ({ page }) => {
    await page.goto('/');

    // "Sign In" is hidden on mobile (md:block), so navigate directly
    await page.goto('/login');

    await expect(page).toHaveURL(/.*login/);

    // Check for TrueServe branding — the login page uses Logo component
    const brandingElement = page.locator('text=/True/i').first();
    await expect(brandingElement).toBeVisible({ timeout: 10000 });
});

test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero should have main heading content
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // Nav should be present
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
});
