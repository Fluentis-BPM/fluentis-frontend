import { test, expect } from '@playwright/test';

// Simple test: click CTA and verify navigation to /login
test('click Acceder al Sistema navigates to login', async ({ page }) => {
  await page.goto('/');
  // Click the primary CTA button (first) to navigate to login
  await page.getByRole('button', { name: 'Acceder al Sistema' }).first().click();
  await page.waitForURL('**/login');
  // Assert the login page heading is present (use heading role to avoid matching buttons)
  await expect(page.getByRole('heading', { name: 'INICIAR SESIÓN' })).toBeVisible();
});
