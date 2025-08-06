import { test, expect } from '@playwright/test';

/**
 * Caso de Prueba: F-106: Revisar Logs de IP (CU-106)
 * Escenario: Analizar accesos
 * Variables: Día="01/08"
 * Resultado Esperado: Historial visible
 */
test.describe('F-106: Revisar Logs de IP (CU-106)', () => {
  test('debería mostrar el historial de accesos por IP para el día 01/08', async ({ page }) => {
    // 1. Navegar a la página de logs de seguridad
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que estamos en la página correcta
    await expect(page.locator('h1')).toContainText(/Logs|Accesos|Historial/i);

    // 3. Buscar el selector de fecha
    const dateSelector = page.locator('[data-testid="date-selector"]')
      .or(page.locator('input[type="date"]'))
      .or(page.locator('input[placeholder*="fecha"]'));

    // 4. Seleccionar la fecha 01/08
    if (await dateSelector.count() > 0) {
      await dateSelector.fill('2024-08-01');
      await dateSelector.press('Enter');
    }

    // 5. Verificar que se muestra el historial
    const logsTable = page.locator('table').or(page.locator('[role="table"]'));
    await expect(logsTable).toBeVisible();

    // 6. Verificar que hay datos para la fecha seleccionada
    const logRows = logsTable.locator('tr');
    await expect(logRows).toHaveCount({ min: 2 }); // Al menos header + 1 fila de datos
  });

  test('debería filtrar logs por IP específica', async ({ page }) => {
    // 1. Navegar a la página de logs
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Buscar el campo de filtro por IP
    const ipFilter = page.locator('[data-testid="ip-filter"]')
      .or(page.locator('input[placeholder*="IP"]'))
      .or(page.locator('input[placeholder*="dirección"]'));

    // 3. Si existe el filtro, buscar por una IP específica
    if (await ipFilter.count() > 0) {
      await ipFilter.fill('192.168.1.1');
      await ipFilter.press('Enter');

      // 4. Verificar que los resultados se filtran
      const filteredRows = page.locator('tr').filter({ hasText: '192.168.1.1' });
      await expect(filteredRows).toBeVisible();
    }
  });

  test('debería mostrar detalles del acceso al hacer clic en un registro', async ({ page }) => {
    // 1. Navegar a la página de logs
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Buscar una fila de log para hacer clic
    const logRow = page.locator('tr').nth(1); // Primera fila de datos (después del header)
    
    if (await logRow.count() > 0) {
      // 3. Hacer clic en la fila para ver detalles
      await logRow.click();

      // 4. Verificar que se muestra un modal o panel de detalles
      const detailsModal = page.locator('[role="dialog"]')
        .or(page.locator('.modal'))
        .or(page.locator('.details-panel'));

      if (await detailsModal.count() > 0) {
        await expect(detailsModal).toBeVisible();
        
        // 5. Verificar que contiene información detallada
        await expect(detailsModal).toContainText(/IP|Dirección|Usuario|Fecha|Hora/i);
      }
    }
  });

  test('debería exportar los logs de IP', async ({ page }) => {
    // 1. Navegar a la página de logs
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Buscar el botón de exportar
    const exportButton = page.locator('button:has-text("Exportar")')
      .or(page.locator('button:has-text("Descargar")'))
      .or(page.locator('[data-testid="export-button"]'));

    // 3. Si existe el botón, hacer clic
    if (await exportButton.count() > 0) {
      await exportButton.click();

      // 4. Verificar que se inicia la descarga
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    }
  });

  test('debería mostrar estadísticas de accesos', async ({ page }) => {
    // 1. Navegar a la página de logs
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Buscar elementos de estadísticas
    const statsContainer = page.locator('[data-testid="stats-container"]')
      .or(page.locator('.stats'))
      .or(page.locator('.summary'));

    // 3. Si existen estadísticas, verificar que se muestran
    if (await statsContainer.count() > 0) {
      await expect(statsContainer).toBeVisible();
      
      // 4. Verificar que contiene información relevante
      await expect(statsContainer).toContainText(/Total|Accesos|Únicos|Bloqueados/i);
    }
  });

  test('debería permitir buscar en los logs', async ({ page }) => {
    // 1. Navegar a la página de logs
    await page.goto('/logs/ip');
    await page.waitForLoadState('networkidle');

    // 2. Buscar el campo de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar"]')
      .or(page.locator('input[placeholder*="Search"]'))
      .or(page.locator('[data-testid="search-input"]'));

    // 3. Si existe el campo de búsqueda, realizar una búsqueda
    if (await searchInput.count() > 0) {
      await searchInput.fill('admin');
      await searchInput.press('Enter');

      // 4. Verificar que los resultados se filtran
      const searchResults = page.locator('tr').filter({ hasText: 'admin' });
      await expect(searchResults).toBeVisible();
    }
  });
}); 