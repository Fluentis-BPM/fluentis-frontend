import { test, expect } from '@playwright/test';

/**
 * Caso de Prueba: F-83: Forzar Cierre de Sesión (CU-83)
 * Escenario: Expulsar usuario
 * Variables: Usuario=2
 * Resultado Esperado: Sesión cerrada
 */
test.describe('F-83: Forzar Cierre de Sesión (CU-83)', () => {
  test('debería expulsar al usuario 2 y cerrar su sesión', async ({ page }) => {
    console.log('🔧 [F-83] Iniciando expulsión del usuario 2');
    
    // 1. Navegar a la página de gestión de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-83] Página de usuarios cargada');

    // 2. Verificar que estamos en la página correcta
    await expect(page.locator('h1')).toContainText('Usuarios');
    console.log('✅ [F-83] Página correcta verificada');

    // 3. Buscar el usuario con ID 2 en la tabla
    const userRow = page.locator('tr').filter({ hasText: 'María García' });
    await expect(userRow).toBeVisible();
    console.log('✅ [F-83] Usuario María García encontrado');

    // 4. Hacer clic en el botón de acciones del usuario
    const actionsButton = userRow.locator('button[aria-label="Acciones"]').or(userRow.locator('button:has-text("⋮")'));
    await actionsButton.click();
    console.log('✅ [F-83] Botón de acciones clickeado');

    // 5. Seleccionar la opción "Forzar Cierre de Sesión"
    const forceLogoutOption = page.locator('button:has-text("Forzar Cierre de Sesión")').or(page.locator('button:has-text("Expulsar Usuario")'));
    await forceLogoutOption.click();
    console.log('✅ [F-83] Opción de expulsión seleccionada');

    // 6. Confirmar la acción en el modal de confirmación
    const confirmButton = page.locator('button:has-text("Confirmar")').or(page.locator('button:has-text("Sí, expulsar")'));
    await confirmButton.click();
    console.log('✅ [F-83] Acción confirmada');

    // 7. Verificar que se muestra el mensaje de éxito
    const successMessage = page.locator('[data-sonner-toast][data-type="success"]').or(page.locator('.toast-success'));
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Sesión cerrada');
    console.log('✅ [F-83] Mensaje de éxito verificado');

    // 8. Verificar que el estado del usuario cambió a "Desconectado"
    const userStatus = userRow.locator('[data-testid="user-status"]').or(userRow.locator('.status-badge'));
    await expect(userStatus).toContainText('Desconectado');
    console.log('✅ [F-83] Estado de usuario actualizado a Desconectado');
  });

  test('debería mostrar confirmación antes de expulsar usuario', async ({ page }) => {
    console.log('🔧 [F-83] Verificando confirmación antes de expulsar');
    
    // 1. Navegar a la página de usuarios
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');
    console.log('✅ [F-83] Página de usuarios cargada');

    // 2. Buscar usuario y abrir acciones
    const userRow = page.locator('tr').filter({ hasText: 'Juan Pérez' });
    const actionsButton = userRow.locator('button[aria-label="Acciones"]').or(userRow.locator('button:has-text("⋮")'));
    await actionsButton.click();
    console.log('✅ [F-83] Acciones del usuario abiertas');

    // 3. Seleccionar forzar cierre de sesión
    const forceLogoutOption = page.locator('button:has-text("Forzar Cierre de Sesión")');
    await forceLogoutOption.click();
    console.log('✅ [F-83] Opción de expulsión seleccionada');

    // 4. Verificar que aparece el modal de confirmación
    const confirmationModal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(confirmationModal).toBeVisible();
    await expect(confirmationModal).toContainText('¿Estás seguro de que quieres expulsar a este usuario?');
    console.log('✅ [F-83] Modal de confirmación verificado');

    // 5. Cancelar la acción
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await cancelButton.click();
    console.log('✅ [F-83] Acción cancelada');

    // 6. Verificar que el modal se cierra
    await expect(confirmationModal).not.toBeVisible();
    console.log('✅ [F-83] Modal cerrado correctamente');
  });
}); 