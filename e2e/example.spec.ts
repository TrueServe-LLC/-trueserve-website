import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/TrueServe/);
});

test('can navigate to login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    // Check for Google Sign In Button
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
});
