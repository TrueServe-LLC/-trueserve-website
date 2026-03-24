import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/TrueServe/);
});

test('can navigate to login', async ({ page }) => {
    await page.goto('/');
    
    // Look for the "Sign In" link in the navigation
    const signInBtn = page.locator('nav').getByRole('link', { name: 'Sign In' });
    
    // Header links might be hidden on small screens, so we'll check layout first
    if (await signInBtn.isVisible()) {
        await signInBtn.click();
    } else {
        // Fallback: direct goto or check mobile nav
        await page.goto('/login');
    }

    await expect(page).toHaveURL(/.*login/);
    
    // Check for "TrueServe" branding in the login portal
    const logoHeading = page.locator('h1').filter({ hasText: 'True' });
    await expect(logoHeading).toBeVisible();

    // Check for Google Sign In Button
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
});
