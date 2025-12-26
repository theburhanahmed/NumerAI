# E2E Test for Profile Edit Flow

## Status
⚠️ **E2E test framework not yet configured in this project.**

This document outlines the E2E test specification for the profile edit/save functionality. Once a test framework (Playwright or Cypress) is set up, implement these tests.

## Test Framework Setup

To set up E2E testing, choose one of the following:

### Option 1: Playwright (Recommended)
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Option 2: Cypress
```bash
cd frontend
npm install -D cypress
```

## Test Specification

### Test: Complete Profile Edit Flow
**File**: `e2e/profile-edit.spec.ts` (Playwright) or `cypress/e2e/profile-edit.cy.ts` (Cypress)

#### Test Cases

1. **Successful Profile Update**
   - Login as test user
   - Navigate to `/profile`
   - Click "Edit Profile"
   - Update fields: full_name, date_of_birth, gender, timezone, location, bio
   - Click "Save"
   - Verify success toast appears
   - Verify form exits edit mode
   - Verify updated values are displayed
   - Verify API call was made with correct payload
   - Verify database persistence via API call

2. **Profile Data Loading**
   - Login as test user with existing profile data
   - Navigate to `/profile`
   - Verify all profile fields are populated correctly
   - Verify date_of_birth is formatted correctly
   - Verify non-empty fields are displayed (not "Not provided")

3. **Validation Error Display**
   - Login as test user
   - Navigate to `/profile`
   - Click "Edit Profile"
   - Submit form with invalid data (e.g., invalid date format, empty required field)
   - Verify field-level errors are displayed
   - Verify error messages are clear and actionable

4. **Cancel Edit**
   - Login as test user
   - Navigate to `/profile`
   - Click "Edit Profile"
   - Change some fields
   - Click "Cancel"
   - Verify form resets to original values
   - Verify no API call was made

5. **Concurrent Edits Simulation**
   - Login as test user in two browser tabs/windows
   - In tab 1: Edit and save profile
   - In tab 2: Edit and save profile (last write wins)
   - Verify both tabs reflect the final saved state

6. **Error Handling**
   - Login as test user
   - Navigate to `/profile`
   - Simulate network error (offline mode or mock failure)
   - Attempt to save profile
   - Verify error message is displayed
   - Verify form state is preserved

## Example Playwright Implementation

```typescript
import { test, expect } from '@playwright/test';

test.describe('Profile Edit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to profile
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/**'); // Wait for redirect after login
    await page.goto('/profile');
  });

  test('should update profile successfully', async ({ page }) => {
    // Click edit button
    await page.click('text=Edit Profile');
    
    // Update fields
    await page.fill('input[name="full_name"]', 'Updated Name');
    await page.fill('input[type="date"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'female');
    
    // Save
    await page.click('text=Save');
    
    // Verify success
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });

  test('should display validation errors', async ({ page }) => {
    await page.click('text=Edit Profile');
    await page.fill('input[name="full_name"]', '');
    await page.click('text=Save');
    
    await expect(page.locator('.text-red-600')).toBeVisible();
  });
});
```

## Example Cypress Implementation

```typescript
describe('Profile Edit Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'testpass123');
    cy.visit('/profile');
  });

  it('should update profile successfully', () => {
    cy.contains('Edit Profile').click();
    cy.get('input[name="full_name"]').clear().type('Updated Name');
    cy.get('input[type="date"]').type('1990-01-01');
    cy.contains('Save').click();
    
    cy.contains('Profile updated successfully').should('be.visible');
    cy.contains('Updated Name').should('be.visible');
  });

  it('should display validation errors', () => {
    cy.contains('Edit Profile').click();
    cy.get('input[name="full_name"]').clear();
    cy.contains('Save').click();
    
    cy.get('.text-red-600').should('be.visible');
  });
});
```

## Running Tests

### Playwright
```bash
cd frontend
npx playwright test e2e/profile-edit.spec.ts
```

### Cypress
```bash
cd frontend
npx cypress open  # Interactive mode
npx cypress run   # Headless mode
```

## Notes

- Tests should use test database/user accounts
- Clean up test data after each test run
- Mock external services (email, payment, etc.)
- Use environment variables for test credentials
- Run tests in CI/CD pipeline

















