# Pruebas Automatizadas con Playwright

Este directorio contiene las pruebas automatizadas para el frontend de Fluentis usando Playwright.

## Casos de Prueba Implementados

### F-83: Forzar Cierre de Sesión (CU-83)
**Escenario:** Expulsar usuario  
**Variables:** Usuario=2  
**Resultado Esperado:** Sesión cerrada

**Archivo de Prueba:** `force-logout.spec.ts`

### F-102: Pruebas Cross-Browser (CU-102)
**Escenario:** Verificar navegadores  
**Variables:** Navegadores="Chrome, Firefox"  
**Resultado Esperado:** Funcionalidad intacta

**Archivo de Prueba:** `cross-browser.spec.ts`

### F-104: Pruebas de Internacionalización (CU-104)
**Escenario:** Cambiar idioma  
**Variables:** Idioma="es"  
**Resultado Esperado:** Textos adaptados

**Archivo de Prueba:** `internationalization.spec.ts`

### F-105: Pruebas de Corrección de Errores (CU-105)
**Escenario:** Verificar bug  
**Variables:** Bug=1  
**Resultado Esperado:** Corrección sin regresión

**Archivo de Prueba:** `bug-fixes.spec.ts`

### F-106: Revisar Logs de IP (CU-106)
**Escenario:** Analizar accesos  
**Variables:** Día="01/08"  
**Resultado Esperado:** Historial visible

**Archivo de Prueba:** `ip-logs.spec.ts`

## Comandos Disponibles

### Ejecutar Pruebas
```bash
# Ejecutar todas las pruebas
npm run test:e2e

# Ejecutar pruebas con interfaz gráfica
npm run test:e2e:ui

# Ejecutar pruebas en modo headed (ver navegador)
npm run test:e2e:headed

# Ejecutar pruebas en modo debug
npm run test:e2e:debug

# Ver reporte de pruebas
npm run test:e2e:report
```

### Ejecutar Pruebas Específicas
```bash
# Ejecutar solo las pruebas de crear usuario
npx playwright test create-user.spec.ts

# Ejecutar pruebas con filtro
npx playwright test --grep "debería crear un usuario"
```

## Estructura de Pruebas

### Página de Usuarios
- **URL:** `/equipos/usuarios`
- **Funcionalidad:** Lista de usuarios con botón para crear nuevo usuario

### Página de Crear Usuario
- **URL:** `/equipos/usuarios/crear`
- **Funcionalidad:** Formulario para crear nuevos usuarios

### Campos del Formulario
- **Nombre** (requerido): Campo de texto para el nombre completo
- **Email** (opcional): Campo de email con validación
- **Rol** (requerido): Selector con opciones (Gerente, Supervisor, Empleado, Administrador)
- **Departamento** (opcional): Selector con opciones de departamentos
- **Cargo** (opcional): Campo de texto para el cargo

## Casos de Prueba Cubiertos

1. **Creación Exitosa**
   - Navegar a la página de usuarios
   - Hacer clic en "Nuevo Usuario"
   - Llenar formulario con nombre "Juan" y rol "Gerente"
   - Enviar formulario
   - Verificar mensaje de éxito
   - Verificar redirección a lista de usuarios

2. **Validación de Campos Requeridos**
   - Intentar enviar formulario sin campos requeridos
   - Verificar mensaje de error
   - Verificar que no se redirige

3. **Cancelación**
   - Llenar formulario parcialmente
   - Hacer clic en "Cancelar"
   - Verificar redirección a lista de usuarios

4. **Navegación**
   - Usar botón "Volver a Usuarios"
   - Verificar redirección correcta

5. **Validación de Email**
   - Probar formato de email válido e inválido
   - Verificar validación del navegador

## Utilidades de Prueba

La clase `TestUtils` proporciona métodos reutilizables:

- `navigateToUsersPage()` - Navegar a la página de usuarios
- `navigateToCreateUserPage()` - Navegar al formulario de crear usuario
- `fillCreateUserForm()` - Llenar formulario con datos
- `submitCreateUserForm()` - Enviar formulario
- `expectSuccessToast()` - Verificar toast de éxito
- `expectErrorToast()` - Verificar toast de error
- `waitForUserCreation()` - Esperar proceso de creación
- `expectToBeOnUsersPage()` - Verificar estar en página de usuarios
- `expectToBeOnCreateUserPage()` - Verificar estar en formulario

## Configuración

### Playwright Config (`playwright.config.ts`)
- **Base URL:** `http://localhost:5173`
- **Navegadores:** Chromium, Firefox, WebKit
- **Servidor de desarrollo:** Se inicia automáticamente con `npm run dev`
- **Reportes:** HTML con screenshots y videos en fallos

### Variables de Entorno
- `CI` - Modo CI/CD con reintentos y workers limitados
- `DEBUG` - Modo debug para desarrollo

## Reportes

Los reportes se generan automáticamente en:
- `playwright-report/` - Reporte HTML interactivo
- `test-results/` - Screenshots y videos de fallos

## Troubleshooting

### Problemas Comunes

1. **Servidor no inicia**
   ```bash
   # Verificar que el puerto 5173 esté libre
   lsof -i :5173
   ```

2. **Pruebas fallan por timeout**
   ```bash
   # Aumentar timeout en playwright.config.ts
   use: {
     actionTimeout: 10000,
     navigationTimeout: 10000,
   }
   ```

3. **Elementos no encontrados**
   ```bash
   # Usar modo debug para inspeccionar
   npm run test:e2e:debug
   ```

### Logs y Debug
```bash
# Ver logs detallados
DEBUG=pw:api npx playwright test

# Generar trace para análisis
npx playwright test --trace on
``` 