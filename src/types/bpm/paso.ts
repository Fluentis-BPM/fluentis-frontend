/**
 * Tipos para el sistema de pasos de solicitudes (PasoSolicitud)
 * Representa los pasos activos asignados a usuarios en el flujo BPM
 */

import { EstadoPaso, TipoPaso } from "./flow";

export interface PasoSolicitud {
  id: number;
  pasoId: number;
  solicitudId: number;
  usuarioAsignadoId: number;
  tipoPaso: TipoPaso;
  estado: EstadoPaso;
  nombre: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaVencimiento?: string;
  fechaCompletado?: string;
  prioridad: 'baja' | 'media' | 'alta';
  
  // Información relacionada de la solicitud
  solicitudNombre?: string;
  solicitanteNombre?: string;
  flujoId?: number;
  flujoNombre?: string;
  
  // Información del usuario asignado
  usuarioAsignado?: {
    id: number;
    nombre: string;
    email: string;
  };
  
  // Metadatos adicionales
  metadatos?: Record<string, unknown>;
  comentarios?: string;
  
  // Información de grupo de aprobación (solo para pasos de tipo aprobacion)
  relacionesGrupoAprobacion?: Array<{
    id_relacion: number;
    grupo_aprobacion_id: number;
    paso_solicitud_id: number;
    usuarios_grupo?: Array<{
      id_usuario: number;
      nombre: string;
    }>;
    decisiones?: Array<{
      id_usuario: number;
      nombre_usuario: string;
      decision: boolean;
      fecha_decision?: string;
    }>;
  }>;
}

// Filtros para la consulta de pasos
export interface FiltrosPasoSolicitud {
  tipoPaso?: TipoPaso;
  estado?: EstadoPaso;
  fechaDesde?: string;
  fechaHasta?: string;
  solicitudId?: number;
  flujoId?: number;
}

// Request body para acciones sobre pasos
export interface AccionPasoRequest {
  usuarioId: number;
  accion: 'aprobar' | 'rechazar' | 'ejecutar' | 'delegar';
  comentarios?: string;
  usuarioDelegadoId?: number; // para acción 'delegar'
}

// Response de acciones sobre pasos
export interface AccionPasoResponse {
  exito: boolean;
  mensaje: string;
  pasoActualizado?: PasoSolicitud;
  siguientePaso?: PasoSolicitud;
}

// DTO para crear/actualizar pasos
export interface PasoSolicitudDto {
  solicitudId: number;
  usuarioAsignadoId: number;
  tipoPaso: TipoPaso;
  nombre: string;
  descripcion?: string;
  fechaVencimiento?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  metadatos?: Record<string, unknown>;
}

// Estadísticas de pasos para dashboard
export interface EstadisticasPasos {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  rechazados: number;
  porTipo: Record<TipoPaso, number>;
  porPrioridad: Record<string, number>;
  vencidos: number;
  proximosAVencer: number;
}