/**
 * Tipos para el sistema de solicitudes
 * Estructura base flexible para manejar solicitudes con extensibilidad
 */

import { RelacionInput, CamposDinamicos } from './inputs';

export type EstadoSolicitud = 'aprobado' | 'rechazado' | 'pendiente';

export interface SolicitudBase {
  id_solicitud: number;
  solicitante_id: number;
  fecha_creacion: Date;
  flujo_base_id?: number; // Opcional - ID de plantilla predefinida
  estado: EstadoSolicitud;
}

// Interfaz extensible para datos adicionales
export interface DatosAdicionales {
  [key: string]: string | number | boolean | Date | string[] | undefined;
}

// Interfaz completa que combina los campos base con datos adicionales
export interface Solicitud extends SolicitudBase {
  datos_adicionales?: DatosAdicionales;
  campos_dinamicos?: RelacionInput[];
  // Campos computados para la UI
  estado_texto?: string;
  dias_transcurridos?: number;
}

// Interfaz para crear nuevas solicitudes
export interface CrearSolicitudInput {
  solicitante_id: number;
  flujo_base_id?: number;
  estado?: EstadoSolicitud;
  datos_adicionales?: DatosAdicionales;
  campos_dinamicos?: CamposDinamicos;
}

// Plantillas predefinidas para flujos de trabajo
export interface PlantillaSolicitud {
  id: number;
  nombre: string;
  descripcion: string;
  campos_requeridos: string[];
  estado_inicial: EstadoSolicitud;
}