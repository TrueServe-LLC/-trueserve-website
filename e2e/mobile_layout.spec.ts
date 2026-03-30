import { test, expect } from '@playwright/test';

test.describe('Mobile Landing Page Layout', () => {
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('should show Hero CTAs on mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 1. Verify the Hero section heading is visible
        const heroHeading = page.locator('h1').first();
        await expect(heroHeading).toBeVisible({ timeout: 10000 });

        // 2. Verify CTA links exist (Browse Restaurants, For Businesses)
        const browseRestaurantsBtn = page.getByRole('link', { name: /Browse Restaurants/i });
        const forBusinessesBtn = page.getByRole('link', { name: /For Businesses|Merchant/i });

        // At least one primary CTA should be visible
        const hasBrowse = await browseRestaurantsBtn.isVisible().catch(() => false);
        const hasBusiness = await forBusinessesBtn.isVisible().catch(() => false);
        expect(hasBrowse || hasBusiness).toBeTruthy();
    });

    test('should have a functional mobile header', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Logo/branding should be visible (uses Logo component, not necessarily h1)
        const branding = page.locator('nav').first();
        await expect(branding).toBeVisible();

        // Get Started button should be visible in navigation
        const getStartedNav = page.locator('nav').getByRole('link', { name: /Get Started/i });
        await expect(getStartedNav).toBeVisible({ timeout: 5000 });
    });
});
