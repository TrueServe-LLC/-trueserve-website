import { test, expect } from '@playwright/test';

test.describe('Mobile Landing Page Layout', () => {
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X size

    test('should hide CTA boxes on mobile', async ({ page }) => {
        await page.goto('/');

        // 1. Verify the hero section paths are visible (these are the mobile-only buttons)
        const orderFoodPath = page.getByRole('link', { name: 'Order Food' }).first();
        const joinFleetPath = page.getByRole('link', { name: 'Join Fleet' });

        await expect(orderFoodPath).toBeVisible();
        await expect(joinFleetPath).toBeVisible();

        // 2. Verify the Mission Statement is visible
        await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();

        // 3. Verify the "Ready to taste..." and "Drive with..." sections are HIDDEN
        // These sections contain specific text that should only be on the desktop/tablet CTA cards
        const ctaSection = page.locator('section:has-text("Ready to taste the difference?")');
        await expect(ctaSection).toBeHidden();

        const driverCtaSection = page.locator('section:has-text("Drive with specific purpose.")');
        await expect(driverCtaSection).toBeHidden();
    });

    test('should have a nicely displayed search bar without overlaps', async ({ page }) => {
        await page.goto('/');

        const searchForm = page.locator('form:has(input[placeholder="Enter delivery address..."])');
        await expect(searchForm).toBeVisible();

        const findFoodBtn = searchForm.getByRole('button', { name: 'Find Food' });
        const inputField = searchForm.getByPlaceholder('Enter delivery address...');

        // Check visibility
        await expect(findFoodBtn).toBeVisible();
        await expect(inputField).toBeVisible();

        // Check for overlaps by checking bounding boxes
        const btnBox = await findFoodBtn.boundingBox();
        const inputBox = await inputField.boundingBox();

        if (btnBox && inputBox) {
            // Button should be below input if stacked, or beside if row.
            // But they shouldn't occupy the same space.
            const hasOverlap = (
                btnBox.x < inputBox.x + inputBox.width &&
                btnBox.x + btnBox.width > inputBox.x &&
                btnBox.y < inputBox.y + inputBox.height &&
                btnBox.y + btnBox.height > inputBox.y
            );
            expect(hasOverlap).toBe(false);
        }
    });
});
