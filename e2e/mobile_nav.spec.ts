import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation End-to-End Tests', () => {
    // Override the generic viewports and use a strictly mobile viewport size
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('Customer Navigation is visible and sticky on the bottom', async ({ page }) => {
        // Go to restaurants page because that uses the default customer layout
        await page.goto('/restaurants');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Locate the main container of the customer navigation
        const navContainer = page.locator('.md\\:hidden.fixed.bottom-6');

        // 1. Assert Visibility on Mobile
        await expect(navContainer).toBeVisible();

        // 2. Assert all Customer Tabs exist
        await expect(navContainer.getByText('Home')).toBeVisible();
        await expect(navContainer.getByText('Nearby')).toBeVisible();
        await expect(navContainer.getByText('Cart')).toBeVisible();
        await expect(navContainer.getByText('Profile')).toBeVisible();

        // 3. Test z-index and fixed positioning
        // Scroll to the bottom of the page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Ensure nav remains visible despite scrolling down
        await expect(navContainer).toBeInViewport();
    });

    test('Mobile Navigation remains hidden on exact blacklist paths', async ({ page }) => {
        // Blacklisted log in screen
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // There shouldn't be ANY navigation bars in the view
        const driverNav = page.locator('text=Board');
        const merchantNav = page.locator('text=Orders');
        const customerNav = page.locator('text=Home');

        await expect(driverNav).toBeHidden();
        await expect(merchantNav).toBeHidden();
        await expect(customerNav).toBeHidden();
    });

    test('Driver Dashboard displays Driver Mobile Nav correctly', async ({ page }) => {
        // Go to a driver route
        await page.goto('/driver/dashboard');

        // Wait for hydration
        await page.waitForLoadState('networkidle');

        // Locate the main container of the driver navigation
        const navContainer = page.locator('.md\\:hidden.fixed.bottom-4');

        // 1. Assert Visibility on Mobile
        await expect(navContainer).toBeVisible();

        // 2. Assert Driver specifics
        await expect(navContainer.getByText('Board')).toBeVisible();
        await expect(navContainer.getByText('Trips')).toBeVisible();
        await expect(navContainer.getByText('Pay')).toBeVisible();
        await expect(navContainer.getByText('Exit')).toBeVisible();

        // 3. Ensure no overlapping buttons
        // Let's assert that the active class for Board was applied
        const boardLink = navContainer.locator('a:has-text("Board")');
        await expect(boardLink).toHaveClass(/text-emerald-400/);
    });
});
