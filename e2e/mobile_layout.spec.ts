import { test, expect } from '@playwright/test';

test.describe('Mobile Landing Page Layout', () => {
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('should show Hero CTAs on mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 1. Verify the Hero section heading is visible
        const heroHeading = page.locator('h1').first();
        await expect(heroHeading).toBeVisible({ timeout: 10000 });

        // 2. Verify the current conversion path is visible.
        await expect(page.getByRole('textbox', { name: /enter delivery address/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /find food/i })).toBeVisible();
    });

    test('should have a functional mobile header', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Logo/branding should be visible.
        await expect(page.getByRole('banner')).toBeVisible();

        // Mobile public pages use the hamburger menu in the top-right.
        await page.getByRole('button', { name: /open menu/i }).click();
        const mobileMenu = page.locator('#site-mobile-menu');
        await expect(mobileMenu.getByRole('link', { name: /^home$/i })).toBeVisible();
        await expect(mobileMenu.getByRole('link', { name: /^rewards$/i })).toBeVisible();
        await expect(mobileMenu.getByRole('link', { name: /^help$/i })).toBeVisible();
    });
});
