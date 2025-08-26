import { test, expect } from '@playwright/test';

// Simple test: FAQ section exists and contains a question
test('faq section is present and shows questions', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Preguntas Frecuentes');
  await expect(page.locator('text=¿Cómo accedo al sistema BPM?')).toBeVisible();
});
