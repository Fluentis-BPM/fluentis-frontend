# Directorio de Routes

Este directorio contiene los componentes y configuración de enrutamiento de la aplicación.

## Contenido
- PrivateRoute.tsx: Componente para proteger rutas que requieren autenticación
- PublicRoute.tsx: Componente para rutas públicas

## Propósito
Los componentes de ruta en este directorio:
- Gestionan la navegación de la aplicación
- Implementan protección de rutas
- Manejan redirecciones y autenticación
- Controlan el acceso a diferentes vistas

## Uso
Cada componente de ruta debe:
- Implementar lógica de autorización cuando sea necesario
- Manejar estados de carga y error
- Proporcionar feedback al usuario
- Mantener la seguridad de la aplicación