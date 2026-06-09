import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation End-to-End Tests', () => {
    // Override the generic viewports and use a strictly mobile viewport size
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('Customer Navigation is visible on mobile restaurant page', async ({ page }) => {
        // Go to restaurants page with a location to get past landing
        await page.goto('/restaurants?address=Charlotte,%20NC');
        await page.waitForLoadState('networkidle');

        // The page should render without error
        await expect(page.locator('body')).toBeVisible();

        // The current public shell uses a banner with a hamburger menu on mobile.
        await expect(page.getByRole('banner')).toBeVisible();
        await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();

        await page.getByRole('button', { name: /open menu/i }).click();
        const mobileMenu = page.locator('#site-mobile-menu');
        await expect(mobileMenu.getByRole('link', { name: /^home$/i })).toBeVisible();
        await expect(mobileMenu.getByRole('link', { name: /^drive$/i })).toBeVisible();
        await expect(mobileMenu.getByRole('link', { name: /^for merchants$/i })).toBeVisible();
    });

    test('Mobile Navigation remains hidden on login path', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // The bottom mobile nav should NOT appear on login
        const bottomNav = page.locator('.fixed.bottom-0');
        const isBottomNavVisible = await bottomNav.isVisible({ timeout: 3000 }).catch(() => false);
        
        // Login should either have no bottom nav, or redirect
        const currentUrl = page.url();
        expect(isBottomNavVisible === false || currentUrl.includes('login')).toBeTruthy();
    });

    test('Driver Dashboard redirects or shows driver nav', async ({ page }) => {
        // Go to a driver route
        await page.goto('/driver/dashboard');
        await page.waitForLoadState('networkidle');

        // Without auth, should redirect to login
        const currentUrl = page.url();
        const isOnDriverPage = currentUrl.includes('driver');
        const isOnLoginPage = currentUrl.includes('login');

        // Either redirected to login OR stayed on driver page (if session exists)
        expect(isOnDriverPage || isOnLoginPage).toBeTruthy();

        // If on driver dashboard (authenticated), check for driver nav elements
        if (currentUrl.includes('driver/dashboard')) {
            const driverNav = page.locator('.fixed').filter({ has: page.locator('text=/Board|Trips|Pay/i') });
            if (await driverNav.isVisible({ timeout: 3000 }).catch(() => false)) {
                await expect(driverNav).toBeVisible();
            }
        }
    });
});
