# Directorio de Store

Este directorio contiene la configuración y lógica del estado global de la aplicación usando Redux Toolkit.

## Estructura
- slices/: Reducers y acciones por dominio
  - authSlice.ts: Estado de autenticación
  - processSlice.ts: Estado de procesos
- index.ts: Configuración del store

## Propósito
El store en este directorio:
- Centraliza el estado global de la aplicación
- Implementa la lógica de reducers y acciones
- Facilita el manejo de estado asíncrono
- Proporciona herramientas de debugging

## Uso
Cada slice debe:
- Definir un dominio específico del estado
- Implementar acciones y reducers relacionados
- Incluir tipos TypeScript
- Seguir las mejores prácticas de Redux Toolkit