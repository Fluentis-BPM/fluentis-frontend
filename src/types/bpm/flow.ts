/**
 * Tipos para el módulo de flujos
 */

import { RelacionInput, CamposDinamicos } from './inputs';


// Interfaz para datos de solicitud
export interface DatosSolicitud {
  descripcion?: string;
  titulo?: string;
  justificacion?: string;
  departamento?: string;
  fecha_requerida?: string;
  presupuesto?: number;
  prioridad?: 'alta' | 'media' | 'baja';
  [key: string]: string | number | boolean | undefined;
}

// Configuración de paso flexible
export interface ConfiguracionPaso {
  timeout_minutos?: number;
  notificaciones_activas?: boolean;
  validacion_requerida?: boolean;
  campos_visibles?: string[];
  permisos_especiales?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

// Resultado de ejecución de paso
export interface ResultadoPaso {
  exitoso: boolean;
  mensaje?: string;
  datos_salida?: Record<string, unknown>;
  tiempo_ejecucion?: number;
  errores?: string[];
}


// Plantilla de flujo (opcional)
export interface PlantillaFlujo {
  id_plantilla: number;
  nombre: string;
  descripcion?: string;
  pasos: PasoFlujo[];
  fecha_creacion: Date;
}

// Paso dentro de una plantilla de flujo
export interface PasoFlujo {
  id_paso: number;
  orden: number;
  nombre: string;
  descripcion?: string;
  tipo: 'manual' | 'automatico' | 'aprobacion';
  configuracion?: ConfiguracionPaso;
}

// Ejecución de paso en un flujo activo
export interface EjecucionPaso {
  id_ejecucion: number;
  flujo_activo_id: number;
  paso_id?: number; // Opcional si no viene de plantilla
  nombre: string;
  estado: 'pendiente' | 'enprogreso' | 'completado' | 'fallido';
  fecha_inicio?: Date;
  fecha_finalizacion?: Date;
  resultado?: ResultadoPaso;
  responsable_id?: number;
}



// Camino paralelo para conexiones entre pasos
export interface CaminoParalelo {
  id_camino: number;
  paso_origen_id: number;
  paso_destino_id: number;
  es_excepcion: boolean;
  condicion?: string; // Condición para la bifurcación
  nombre?: string;
}

// Estadísticas de flujos
export interface EstadisticasFlujos {
  total_flujos: number;
  en_curso: number;
  finalizados: number;
  cancelados: number;
  promedio_duracion?: number; // En días
}

// src/types/bpm/flow.ts

// Tipos básicos
export type EstadoFlujo = 'encurso' | 'finalizado' | 'cancelado';
export type TipoPaso = 'inicio' | 'ejecucion' | 'aprobacion' | 'fin';
export type EstadoPaso =
  | 'pendiente'
  | 'enprogreso'
  | 'en_proceso'
  | 'completado'
  | 'aprobado'
  | 'rechazado'
  | 'excepcion'
  | 'entregado'
  | 'fallido'
  | 'cancelado';
export type TipoFlujoPaso = 'normal' | 'bifurcacion' | 'union';
export type ReglaAprobacion = 'unanime' | 'individual' | 'ancla';

// Entidad FlujoActivo
export interface FlujoActivo {
  id_flujo_activo: number;
  solicitud_id: number;
  nombre: string;
  descripcion?: string;
  version_actual?: number;
  flujo_ejecucion_id: number | undefined;
  fecha_inicio: Date;
  fecha_finalizacion?: Date;
  estado: EstadoFlujo;
  datos_solicitud?: Record<string, string> | undefined;
}

// Entidad PasoSolicitud
export interface PasoSolicitud {
  id_paso_solicitud: number;
  flujo_activo_id: number;
  paso_id?: number;
  camino_id?: number;
  responsable_id?: number;
  fecha_inicio: Date;
  fecha_fin?: Date;
  tipo_paso: TipoPaso;
  estado: EstadoPaso;
  nombre?: string;
  descripcion?: string;
  tipo_flujo: TipoFlujoPaso;
  regla_aprobacion?: ReglaAprobacion;
  posicion_x?: number;
  posicion_y?: number;
  // Atributo opcional para diferenciar visualmente inicio/proceso/fin en algunas UIs
  tipo?: 'inicio' | 'proceso' | 'fin';
  // Campos dinámicos asociados (formas alternativas usadas en distintos módulos)
  campos_dinamicos?: CamposDinamicos | RelacionInput[];
  relacionesInput?: RelacionInput[];
  relacionesGrupoAprobacion?: RelacionGrupoAprobacion[];
  comentarios?: Comentario[];
  excepciones?: Excepcion[];
}

// Entidad CaminoParalelo (conexión entre pasos)
export interface CaminoParalelo {
  id_camino: number;
  paso_origen_id: number;
  paso_destino_id: number;
  es_excepcion: boolean;
  nombre?: string;
}


// Entidad RelacionGrupoAprobacion (asignación de grupos de aprobación)
export interface RelacionGrupoAprobacion {
  id_relacion: number;
  grupo_aprobacion_id: number;
  paso_solicitud_id: number;
}

// Entidad Comentario (comentarios asociados a un paso)
export interface Comentario {
  id_comentario: number;
  paso_solicitud_id: number;
  usuario_id: number;
  contenido: string;
  fecha_creacion: Date;
}

// Entidad Excepcion (excepciones asociadas a un paso)
export interface Excepcion {
  id_excepcion: number;
  paso_solicitud_id: number;
  descripcion: string;
  fecha_registro: Date;
  estado: 'activa' | 'resuelta';
}

// Tipo de respuesta del endpoint GET /api/FlujosActivos/Pasos/{id}
export interface FlujoActivoResponse {
  flujoActivoId: number;
  pasos: PasoSolicitud[];
  caminos: CaminoParalelo[];
}