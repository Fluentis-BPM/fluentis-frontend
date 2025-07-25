/**
 * Tipos para el módulo de flujos
 */

import { RelacionInput, CamposDinamicos } from './inputs';

// Estados posibles de un flujo
export type EstadoFlujo = 'encurso' | 'finalizado' | 'cancelado';

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

// Flujo activo - representa un flujo en ejecución
export interface FlujoActivo {
  id_flujo_activo: number;
  solicitud_id: number;
  flujo_ejecucion_id?: number; // Opcional - referencia a plantilla
  estado: EstadoFlujo;
  fecha_inicio: Date;
  fecha_finalizacion?: Date;
  datos_solicitud?: DatosSolicitud; // Datos de la solicitud original
  campos_dinamicos?: RelacionInput[] | CamposDinamicos; // Campos dinámicos - puede ser array o objeto
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

// Paso de solicitud en un flujo activo (nuevo para diagrama)
export interface PasoSolicitud {
  id_paso_solicitud: number;
  flujo_activo_id: number;
  paso_id?: number; // Opcional si viene de plantilla
  camino_id?: number; // Referencia al camino
  responsable_id?: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'excepcion' | 'completado';
  fecha_inicio: Date;
  fecha_finalizacion?: Date;
  nombre: string;
  descripcion?: string;
  posicion_x: number; // Para el diagrama
  posicion_y: number; // Para el diagrama
  tipo: 'inicio' | 'proceso' | 'decision' | 'fin';
  tipo_paso: 'ejecucion' | 'aprobacion'; // Nuevo campo para diferenciar tipos
  tipo_flujo: 'normal' | 'bifurcacion' | 'union'; // Tipo de flujo del paso
  regla_aprobacion: 'unanime' | 'individual' | 'ancla'; // Regla de aprobación para pasos de aprobación
  campos_dinamicos?: RelacionInput[] | CamposDinamicos; // Campos dinámicos del paso
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