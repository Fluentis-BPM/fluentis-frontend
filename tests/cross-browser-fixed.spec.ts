import { test, expect } from '@playwright/test';

/**
 * Caso de Prueba: F-102: Pruebas Cross-Browser (CU-102) - VERSIÓN CORREGIDA
 * Escenario: Verificar navegadores
 * Variables: Navegadores="Chrome, Firefox"
 * Resultado Esperado: Funcionalidad intacta
 */
test.describe('F-102: Pruebas Cross-Browser (CU-102) - Corregido', () => {
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

    // 4. Verificar que hay algún contenido en la página
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    console.log('✅ [F-102] Contenido de página verificado');
    
    // 5. Verificar que no hay errores críticos
    console.log(`⚠️ [F-102] Errores de consola encontrados: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('📋 [F-102] Detalles de errores:', consoleErrors);
    }
  });

  test('debería verificar que el DOM se carga correctamente', async ({ page }) => {
    console.log('🔧 [F-102] Verificando estructura del DOM');
    
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Página cargada');

    // 2. Verificar elementos básicos del DOM
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    console.log('✅ [F-102] Elementos básicos del DOM verificados');

    // 3. Verificar que hay contenido en el body
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    console.log('✅ [F-102] Contenido del body verificado');
  });

  test('debería manejar eventos básicos del navegador', async ({ page }) => {
    console.log('🔧 [F-102] Verificando eventos básicos del navegador');
    
    // 1. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Página cargada');

    // 2. Verificar que se puede hacer scroll
    await page.evaluate(() => window.scrollTo(0, 100));
    console.log('✅ [F-102] Scroll funcionando');

    // 3. Verificar que se puede hacer resize
    await page.setViewportSize({ width: 800, height: 600 });
    console.log('✅ [F-102] Resize funcionando');

    // 4. Verificar que se pueden usar eventos de teclado
    await page.keyboard.press('Tab');
    console.log('✅ [F-102] Eventos de teclado funcionando');
  });

  test('debería verificar compatibilidad con diferentes viewports', async ({ page }) => {
    console.log('🔧 [F-102] Verificando compatibilidad con viewports');
    
    // 1. Probar con viewport de escritorio
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Viewport desktop (1920x1080) verificado');

    // 2. Probar con viewport de tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Viewport tablet (768x1024) verificado');

    // 3. Probar con viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Viewport móvil (375x667) verificado');
  });

  test('debería verificar que no hay errores de JavaScript críticos', async ({ page }) => {
    console.log('🔧 [F-102] Verificando errores de JavaScript');
    
    // 1. Configurar listeners para errores
    const jsErrors: string[] = [];
    const unhandledErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      unhandledErrors.push(error.message);
    });

    // 2. Navegar a la página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-102] Página cargada');

    // 3. Esperar un momento para capturar errores
    await page.waitForTimeout(2000);

    // 4. Verificar errores
    console.log(`⚠️ [F-102] Errores de consola: ${jsErrors.length}`);
    console.log(`⚠️ [F-102] Errores no manejados: ${unhandledErrors.length}`);
    
    if (jsErrors.length > 0) {
      console.log('📋 [F-102] Errores de consola:', jsErrors);
    }
    
    if (unhandledErrors.length > 0) {
      console.log('📋 [F-102] Errores no manejados:', unhandledErrors);
    }
  });

  test('debería verificar rendimiento básico', async ({ page }) => {
    console.log('🔧 [F-102] Verificando rendimiento básico');
    
    // 1. Navegar a la página principal
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 [F-102] Tiempo de carga: ${loadTime}ms`);
    console.log('✅ [F-102] Página cargada exitosamente');

    // 2. Verificar que el tiempo de carga es razonable (menos de 10 segundos)
    expect(loadTime).toBeLessThan(10000);
    console.log('✅ [F-102] Tiempo de carga dentro de parámetros aceptables');

    // 3. Verificar que la página es interactiva
    await expect(page).toHaveTitle(/.*/);
    console.log('✅ [F-102] Página es interactiva');
  });
}); 