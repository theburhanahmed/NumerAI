import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should navigate to subscription page', async ({ page }) => {
    await page.goto('/subscription');
    await expect(page.locator('text=/pricing|subscribe/i')).toBeVisible();
  });

  test('should show subscription management for active subscribers', async ({ page }) => {
    // This test assumes user has active subscription
    await page.goto('/settings');
    await expect(page.locator('text=/subscription|manage/i')).toBeVisible();
  });
});

