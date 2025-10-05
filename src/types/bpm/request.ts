/**
 * Tipos para el sistema de solicitudes
 * Estructura base flexible para manejar solicitudes con extensibilidad
 */

import { RelacionInput, CamposDinamicos } from './inputs';

export type EstadoSolicitud = 'aprobado' | 'rechazado' | 'pendiente';

export interface SolicitudBase {
  id_solicitud: number;
  solicitante_id: number;
  fecha_creacion: string | Date;
  flujo_base_id?: number; // Opcional - ID de plantilla predefinida
  estado: EstadoSolicitud;
}

// Interfaz extensible para datos adicionales
export interface DatosAdicionales {
  [key: string]: string | number | boolean | Date | string[] | undefined;
}

// Interfaz completa que combina los campos base con datos adicionales
export interface Solicitud extends SolicitudBase {
  // Nuevos campos alineados al backend
  nombre?: string;
  descripcion?: string | null;
  solicitante?: { idUsuario: number; nombre: string; email: string };
  grupos_aprobacion?: Array<{
    id_relacion: number;
    grupo_aprobacion_id: number;
    paso_solicitud_id?: number | null;
    solicitud_id?: number | null;
    decisiones?: Array<{ id_relacion: number; id_usuario: number; decision: 'si' | 'no' | null; fecha_decision?: string }>
  }>;
  datos_adicionales?: DatosAdicionales;
  campos_dinamicos?: RelacionInput[];
  // Grupo de aprobación asociado (si existe en backend)
  grupo_aprobacion_id?: number;
  // Campos computados para la UI
  estado_texto?: string;
  dias_transcurridos?: number;
}

// Interfaz para crear nuevas solicitudes
export interface CrearSolicitudInput {
  solicitante_id: number;
  nombre?: string;
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