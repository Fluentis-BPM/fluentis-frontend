# Configuración de Variables de Entorno

Este proyecto utiliza diferentes archivos de variables de entorno según el ambiente de ejecución.

## Archivos de Entorno

- **`.env`**: Variables por defecto (desarrollo)
- **`.env.development`**: Variables específicas para desarrollo (localhost:8080)
- **`.env.production`**: Variables específicas para producción (Azure)
- **`.env.example`**: Plantilla de ejemplo

## Comandos NPM

### Desarrollo (usa localhost:8080)
```bash
npm run dev
```
Inicia el servidor de desarrollo usando `.env.development`

### Producción (usa URL de Azure)
```bash
npm run prod
```
Inicia el servidor en modo producción usando `.env.production`

### Build

**Build para producción:**
```bash
npm run build
```
Compila el proyecto para producción usando `.env.production`

**Build para desarrollo:**
```bash
npm run build:dev
```
Compila el proyecto para desarrollo usando `.env.development`

**Build para Docker:**
```bash
npm run build:docker
```
Compila el proyecto para Docker en modo producción

### Preview

**Preview normal:**
```bash
npm run preview
```

**Preview en modo producción:**
```bash
npm run preview:prod
```

## Variables de Entorno Disponibles

### API
- `VITE_API_BASE_URL`: URL base de la API del backend
  - **Desarrollo**: `http://localhost:8080`
  - **Producción**: `https://fluentis-prod-hzchhwdnavgtejdm.canadacentral-01.azurewebsites.net`

### GoFile
- `VITE_GOFILE_TOKEN`: Token de autenticación de GoFile
- `VITE_GOFILE_DEFAULT_FOLDER_ID`: ID de la carpeta por defecto de GoFile

### Azure (si aplica)
- `NEXT_PUBLIC_AZURE_CLIENT_ID`: Client ID de Azure
- `NEXT_PUBLIC_AZURE_TENANT_ID`: Tenant ID de Azure
- `NEXT_PUBLIC_AZURE_REDIRECT_URI`: URI de redirección de Azure

## Cómo Funciona

Vite automáticamente carga el archivo `.env` correspondiente según el modo:
- `--mode development` → carga `.env.development`
- `--mode production` → carga `.env.production`

Todas las variables que comienzan con `VITE_` están disponibles en el código a través de `import.meta.env.VITE_*`

## Notas Importantes

⚠️ **Nunca subas los archivos `.env*` con información sensible a Git**
⚠️ Los archivos `.env.development` y `.env.production` deben estar en `.gitignore`
✅ Solo `.env.example` debe estar en el repositorio
