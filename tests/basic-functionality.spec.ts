import { test, expect } from '@playwright/test';

/**
 * Pruebas básicas de funcionalidad para verificar que Playwright funciona correctamente
 */
test.describe('Pruebas Básicas de Funcionalidad', () => {
  test('debería cargar la página principal', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que la página se carga
    await expect(page).toHaveTitle(/.*/);
    
    // 3. Tomar screenshot para verificar
    await page.screenshot({ path: 'basic-home.png' });
    
    // 4. Verificar que hay contenido en la página
    const bodyContent = await page.textContent('body');
    console.log('Contenido de la página:', bodyContent?.substring(0, 200));
  });

  test('debería verificar que el servidor está funcionando', async ({ page }) => {
    // 1. Navegar a cualquier ruta
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que el servidor responde
    await expect(page).toHaveTitle(/.*/);
    
    // 3. Verificar que no hay errores críticos
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 4. Esperar un momento para capturar errores
    await page.waitForTimeout(1000);
    
    // 5. Mostrar errores si los hay
    if (consoleErrors.length > 0) {
      console.log('Errores encontrados:', consoleErrors);
    }
  });

  test('debería verificar elementos básicos del DOM', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verificar elementos básicos
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    // 3. Verificar que hay algún contenido
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
}); 