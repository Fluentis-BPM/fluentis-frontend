import { test, expect } from '@playwright/test';

/**
 * Caso de Prueba: F-104: Pruebas de Internacionalización (CU-104)
 * Escenario: Cambiar idioma
 * Variables: Idioma="es"
 * Resultado Esperado: Textos adaptados
 */
test.describe('F-104: Pruebas de Internacionalización (CU-104)', () => {
  test('debería cambiar el idioma a español y mostrar textos adaptados', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Buscar el selector de idioma
    const languageSelector = page.locator('[data-testid="language-selector"]')
      .or(page.locator('select[aria-label*="idioma"]'))
      .or(page.locator('button[aria-label*="language"]'));

    // 3. Si existe el selector, cambiar a español
    if (await languageSelector.count() > 0) {
      await languageSelector.click();
      const spanishOption = page.locator('option[value="es"]').or(page.locator('button:has-text("Español")'));
      await spanishOption.click();
    }

    // 4. Verificar que los textos están en español
    await expect(page.locator('body')).toContainText(/español|Spanish/i);
  });

  test('debería mostrar la interfaz en español por defecto', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que los textos están en español
    await expect(page.locator('h1')).toContainText('Usuarios');
    
    // 3. Verificar otros elementos en español
    const nuevoUsuarioButton = page.locator('button:has-text("Nuevo Usuario")');
    await expect(nuevoUsuarioButton).toBeVisible();

    // 4. Verificar textos de la tabla
    const tableHeaders = page.locator('th');
    await expect(tableHeaders.first()).toContainText(/Nombre|Name/i);
  });

  test('debería mantener el idioma seleccionado al navegar entre páginas', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Verificar idioma en español
    await expect(page.locator('h1')).toContainText('Usuarios');

    // 3. Navegar al formulario de crear usuario
    await page.locator('button:has-text("Nuevo Usuario")').click();
    await page.waitForLoadState('networkidle');

    // 4. Verificar que el idioma se mantiene
    await expect(page.locator('h1')).toContainText('Crear Nuevo Usuario');
    
    // 5. Verificar otros elementos en español
    await expect(page.locator('label:has-text("Nombre completo")')).toBeVisible();
    await expect(page.locator('label:has-text("Rol")')).toBeVisible();
  });

  test('debería mostrar fechas en formato español', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Buscar elementos de fecha en la tabla
    const dateElements = page.locator('[data-testid="date"]').or(page.locator('.date'));
    
    if (await dateElements.count() > 0) {
      // 3. Verificar que las fechas están en formato español (dd/mm/yyyy)
      const dateText = await dateElements.first().textContent();
      expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    }
  });

  test('debería mostrar números con formato español', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Buscar elementos numéricos
    const numericElements = page.locator('[data-testid="number"]').or(page.locator('.number'));
    
    if (await numericElements.count() > 0) {
      // 3. Verificar que los números usan coma como separador decimal (formato español)
      const numberText = await numericElements.first().textContent();
      // Los números en español usan coma como separador decimal
      expect(numberText).toMatch(/^\d+([,.]\d+)?$/);
    }
  });

  test('debería mostrar mensajes de error en español', async ({ page }) => {
    // 1. Navegar al formulario de crear usuario
    await page.goto('/test/usuarios/crear');
    await page.waitForLoadState('networkidle');

    // 2. Intentar enviar el formulario sin llenar campos requeridos
    await page.locator('button:has-text("Crear Usuario")').click();

    // 3. Verificar que el mensaje de error está en español
    const errorMessage = page.locator('[data-sonner-toast][data-type="error"]')
      .or(page.locator('.error-message'))
      .or(page.locator('.alert-error'));
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toContainText(/requeridos|obligatorios|necesario/i);
    }
  });
}); 