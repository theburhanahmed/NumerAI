import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register, verify OTP, and login', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirm_password"]', 'TestPass123!');
    await page.fill('input[name="full_name"]', 'Test User');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Wait for OTP verification page
    await expect(page).toHaveURL(/.*verify-otp/);
    
    // Note: In real E2E tests, you'd need to intercept email or use test OTP
    // For now, this is a placeholder structure
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/error|invalid/i')).toBeVisible();
  });
});

