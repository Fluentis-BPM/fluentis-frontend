import { Page, expect } from '@playwright/test';

/**
 * Utilidades para las pruebas automatizadas
 */
export class TestUtils {
  /**
   * Navegar a la página de usuarios y esperar a que cargue
   */
  static async navigateToUsersPage(page: Page) {
    await page.goto('/test/usuarios');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navegar a la página de crear usuario
   */
  static async navigateToCreateUserPage(page: Page) {
    await page.goto('/test/usuarios/crear');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Llenar el formulario de crear usuario con datos básicos
   */
  static async fillCreateUserForm(page: Page, data: {
    nombre: string;
    rol: string;
    email?: string;
    departamento?: string;
    cargo?: string;
  }) {
    // Llenar nombre
    if (data.nombre) {
      await page.locator('#nombre').fill(data.nombre);
    }

    // Llenar rol
    if (data.rol) {
      await page.locator('[role="combobox"]').first().click();
      await page.locator(`[role="option"]:has-text("${data.rol}")`).click();
    }

    // Llenar email (opcional)
    if (data.email) {
      await page.locator('#email').fill(data.email);
    }

    // Llenar departamento (opcional)
    if (data.departamento) {
      await page.locator('[role="combobox"]').nth(1).click();
      await page.locator(`[role="option"]:has-text("${data.departamento}")`).click();
    }

    // Llenar cargo (opcional)
    if (data.cargo) {
      await page.locator('#cargo').fill(data.cargo);
    }
  }

  /**
   * Enviar el formulario de crear usuario
   */
  static async submitCreateUserForm(page: Page) {
    await page.locator('button:has-text("Crear Usuario")').click();
  }

  /**
   * Verificar que se muestra un toast de éxito
   */
  static async expectSuccessToast(page: Page, message?: string) {
    const successToast = page.locator('[data-sonner-toast][data-type="success"]');
    await expect(successToast).toBeVisible();
    
    if (message) {
      await expect(successToast).toContainText(message);
    }
  }

  /**
   * Verificar que se muestra un toast de error
   */
  static async expectErrorToast(page: Page, message?: string) {
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible();
    
    if (message) {
      await expect(errorToast).toContainText(message);
    }
  }

  /**
   * Esperar a que se complete la simulación de creación de usuario
   */
  static async waitForUserCreation(page: Page) {
    // Esperar a que aparezca el estado de carga
    await expect(page.locator('button:has-text("Creando...")')).toBeVisible();
    
    // Esperar a que se complete (1 segundo de simulación)
    await page.waitForTimeout(1000);
  }

  /**
   * Verificar que estamos en la página de usuarios
   */
  static async expectToBeOnUsersPage(page: Page) {
    await expect(page).toHaveURL(/.*\/test\/usuarios/);
  }

  /**
   * Verificar que estamos en la página de crear usuario
   */
  static async expectToBeOnCreateUserPage(page: Page) {
    await expect(page).toHaveURL(/.*\/test\/usuarios\/crear/);
    await expect(page.locator('h1')).toContainText('Crear Nuevo Usuario');
  }
} 