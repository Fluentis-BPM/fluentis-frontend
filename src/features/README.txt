# Directorio de Features

Este directorio organiza las funcionalidades principales de la aplicación siguiendo una arquitectura modular.

## Estructura
- authentication/: Gestión de autenticación y autorización
  - components/: Componentes específicos de autenticación
  - hooks/: Hooks personalizados para manejo de estado de autenticación
  - services/: Servicios de comunicación con API de autenticación
  - utils/: Utilidades y helpers de autenticación

- dashboard/: Funcionalidad del panel de control
  - components/: Componentes de visualización de datos
  - hooks/: Hooks para gestión de datos del dashboard
  - services/: Servicios de datos para el dashboard
  - utils/: Utilidades de procesamiento de datos

- processManagement/: Gestión de procesos de negocio
  - components/: Componentes de visualización y edición de procesos
  - hooks/: Hooks para manejo de estado de procesos
  - services/: Servicios de comunicación con API de procesos
  - utils/: Utilidades de procesamiento de procesos

## Propósito
El directorio features implementa una arquitectura modular que:
- Separa claramente las funcionalidades del negocio
- Facilita el mantenimiento y escalabilidad
- Mejora la organización del código
- Permite el desarrollo paralelo de funcionalidades