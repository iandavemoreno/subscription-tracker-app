const { test, expect } = require('@playwright/test');

test('subscription tracker page loads with the right heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Subscription & Bill Tracker');
});