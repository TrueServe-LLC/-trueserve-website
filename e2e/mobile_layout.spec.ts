import { test, expect } from '@playwright/test';

test.describe('Mobile Landing Page Layout', () => {
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('should show Hero CTAs on mobile', async ({ page }) => {
        await page.goto('/');

        // 1. Verify the Hero section links are visible
        const browseRestaurantsBtn = page.getByRole('link', { name: 'Browse Restaurants' });
        const forBusinessesBtn = page.getByRole('link', { name: 'For Businesses' });

        await expect(browseRestaurantsBtn).toBeVisible();
        await expect(forBusinessesBtn).toBeVisible();

        // 2. Verify Platform Features section is visible
        await expect(page.getByText('Platform Features')).toBeVisible();
        
        // 3. Verify the Search bar is visible
        const searchInput = page.getByPlaceholder('Enter delivery address...');
        await expect(searchInput).toBeVisible();
    });

    test('should have a functional mobile header', async ({ page }) => {
        await page.goto('/');

        // Logo should be visible
        const logo = page.locator('h1').filter({ hasText: 'True' });
        await expect(logo).toBeVisible();

        // Get Started button should be visible in navigation
        const getStartedNav = page.locator('nav').getByRole('link', { name: 'Get Started' });
        await expect(getStartedNav).toBeVisible();
    });
});
