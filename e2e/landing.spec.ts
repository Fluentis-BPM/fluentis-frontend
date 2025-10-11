import { test, expect } from '@playwright/test';

// Simple test: render landing and check title and subtitle
test('landing page shows hero title and CTA', async ({ page }) => {
  await page.goto('/');
  // Check the main hero heading is visible
  await expect(page.getByRole('heading', { name: 'Optimiza nuestros procesos farmacéuticos' })).toBeVisible();
  // There are multiple "Acceder al Sistema" elements; assert the primary button (first) is visible
  await expect(page.getByRole('button', { name: 'Acceder al Sistema' }).first()).toBeVisible();
});
