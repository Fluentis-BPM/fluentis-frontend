/**
 * Tipos para el sistema de aprobación
 * Estructura para manejar grupos de aprobación y decisiones de usuarios
 */
import type { User } from '@/types/auth';

export interface GrupoAprobacion {
  id_grupo: number;
  nombre: string;
  // Campos añadidos desde backend (equipos) para unificación
  fecha?: string; // opcional en BPM
  es_global?: boolean; // indicador global
  usuarios?: User[] | null; // miembros con información completa
}

export interface RelacionGrupoAprobacion {
  id_relacion: number;
  grupo_aprobacion_id: number;
  solicitud_id?: number; // Opcional para mantener compatibilidad
  paso_solicitud_id?: number; // Nuevo - para pasos de aprobación
}

export type TipoDecision = 'si' | 'no';

export interface RelacionDecisionUsuario {
  id_relacion: number;
  id_usuario: number;
  relacion_grupo_aprobacion_id: number;
  decision: TipoDecision;
}

// Interfaz para visualización con datos combinados
export interface DecisionConUsuario extends RelacionDecisionUsuario {
  nombre_usuario?: string;
}

export interface GrupoAprobacionCompleto extends GrupoAprobacion {
  miembros?: number[]; // IDs de usuarios del grupo (redundante, derivable de usuarios)
  decisiones?: DecisionConUsuario[];
}