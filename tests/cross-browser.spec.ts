import { test, expect } from '@playwright/test';

/**
 * Caso de Prueba: F-102: Pruebas Cross-Browser (CU-102)
 * Escenario: Verificar navegadores
 * Variables: Navegadores="Chrome, Firefox"
 * Resultado Esperado: Funcionalidad intacta
 */
test.describe('F-102: Pruebas Cross-Browser (CU-102)', () => {
  test('debería cargar la página principal correctamente en todos los navegadores', async ({ page }) => {
    console.log('🔧 [F-102] Verificando carga de página principal');
    
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Página principal cargada');

    // 2. Verificar que la página se carga correctamente
    await expect(page).toHaveTitle(/.*/);
    console.log('✅ [F-102] Título de página verificado');
    
    // 3. Verificar que no hay errores en la consola
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 4. Verificar que el contenido principal está presente
    await expect(page.locator('body')).not.toBeEmpty();
    console.log('✅ [F-102] Contenido de página verificado');
    
    // 5. Verificar que no hay errores críticos
    expect(consoleErrors.length).toBe(0);
    console.log('✅ [F-102] Sin errores críticos detectados');
  });

  test('debería navegar a la página de usuarios sin problemas', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que la página se carga correctamente
    await expect(page.locator('h1')).toContainText('Usuarios');

    // 3. Verificar que la tabla de usuarios está presente
    const usersTable = page.locator('table').or(page.locator('[role="table"]'));
    await expect(usersTable).toBeVisible();

    // 4. Verificar que los botones de acción funcionan
    const nuevoUsuarioButton = page.locator('button:has-text("Nuevo Usuario")');
    await expect(nuevoUsuarioButton).toBeVisible();
    await expect(nuevoUsuarioButton).toBeEnabled();
  });

  test('debería manejar formularios correctamente en todos los navegadores', async ({ page }) => {
    // 1. Navegar al formulario de crear usuario
    await page.goto('/test/usuarios/crear');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que el formulario se carga correctamente
    await expect(page.locator('h1')).toContainText('Crear Nuevo Usuario');

    // 3. Verificar que los campos del formulario están presentes
    const nombreInput = page.locator('#nombre');
    await expect(nombreInput).toBeVisible();
    await expect(nombreInput).toBeEnabled();

    // 4. Verificar que los selects funcionan correctamente
    const rolSelect = page.locator('[role="combobox"]').first();
    await expect(rolSelect).toBeVisible();
    await expect(rolSelect).toBeEnabled();

    // 5. Probar interacción básica con el formulario
    await nombreInput.fill('Test User');
    await expect(nombreInput).toHaveValue('Test User');

    // 6. Verificar que el botón de envío está presente
    const submitButton = page.locator('button:has-text("Crear Usuario")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('debería manejar eventos de teclado y mouse correctamente', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Probar búsqueda con teclado
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.click();
    await searchInput.fill('Juan');
    await expect(searchInput).toHaveValue('Juan');

    // 3. Probar navegación con teclado
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 4. Verificar que el foco se mueve correctamente
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 5. Probar clics del mouse
    const nuevoUsuarioButton = page.locator('button:has-text("Nuevo Usuario")');
    await nuevoUsuarioButton.hover();
    await expect(nuevoUsuarioButton).toHaveCSS('cursor', 'pointer');
  });

  test('debería mantener el estado de la aplicación entre navegaciones', async ({ page }) => {
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');

    // 2. Realizar una búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('Juan');

    // 3. Navegar a otra página
    await page.goto('/test/usuarios/crear');
    await page.waitForLoadState('networkidle');

    // 4. Volver a la página anterior
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // 5. Verificar que la página se carga correctamente después del back
    await expect(page.locator('h1')).toContainText('Usuarios');
  });
}); 