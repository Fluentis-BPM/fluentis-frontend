import { useState, useCallback, useEffect } from 'react';
import { PasoSolicitud, FiltrosPasoSolicitud, AccionPasoRequest, AccionPasoResponse } from '@/types/bpm/paso';
import type { TipoPaso, EstadoPaso } from '@/types/bpm/flow';
import api from '@/services/api';
import { AxiosError } from 'axios';

// Import mock data for development
import { MOCK_PASOS_SOLICITUD } from '@/mocks/pasosSolicitud';

interface UsePasosSolicitudReturn {
  pasos: PasoSolicitud[];
  loading: boolean;
  error: string | null;
  fetchPasos: (usuarioId: number, filtros?: FiltrosPasoSolicitud) => Promise<void>;
  ejecutarAccion: (pasoId: number, accion: AccionPasoRequest) => Promise<AccionPasoResponse>;
  refetch: () => void;
  clearError: () => void;
}

interface PasoSolicitudApiResponse {
  // Campos estándar esperados
  id?: number;
  pasoId?: number;
  solicitudId?: number;
  usuarioAsignadoId?: number;
  tipoPaso?: string;
  estado?: string;
  nombre?: string;
  descripcion?: string;
  fechaCreacion?: string;
  fechaVencimiento?: string;
  fechaCompletado?: string;
  prioridad?: string;
  solicitudNombre?: string;
  solicitanteNombre?: string;
  flujoId?: number;
  flujoNombre?: string;
  usuarioAsignado?: {
    id: number;
    nombre: string;
    email: string;
  };
  metadatos?: Record<string, unknown>;
  comentarios?: string;
  // Posibles alias provenientes del backend (nomenclatura snake_case/camel mezcla)
  id_paso_solicitud?: number;
  paso_id?: number;
  usuario_asignado_id?: number;
  tipo_paso?: string;
  fecha_creacion?: string;
  fecha_vencimiento?: string;
  fecha_completado?: string;
  solicitud_nombre?: string;
  solicitante_nombre?: string;
  flujo_id?: number;
  flujo_nombre?: string;
  prioridad_paso?: string;
  solicitud_id?: number;
}

/**
 * Hook para manejar pasos de solicitudes asignados a usuarios
 */
export const usePasosSolicitud = (): UsePasosSolicitudReturn => {
  const [pasos, setPasos] = useState<PasoSolicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{
    usuarioId: number;
    filtros?: FiltrosPasoSolicitud;
  } | null>(null);

  // Mapear respuesta de API a tipos internos
  const normalizeTipoPaso = (v: unknown): TipoPaso => {
    const s = String(v ?? '').trim().toLowerCase();
    if (s.includes('aprob')) return 'aprobacion';
    if (s.includes('ini')) return 'inicio';
    if (s.includes('fin')) return 'fin';
    return 'ejecucion';
  };

  const normalizeEstadoPaso = (v: unknown): EstadoPaso => {
    // Unificar variantes comunes: en_proceso -> enprogreso, completado -> entregado (para el UI actual)
    let s = String(v ?? 'pendiente').trim().toLowerCase();
    s = s.replace(/\s+/g, ''); // quitar espacios
    if (s === 'en_proceso' || s === 'en-proceso' || s === 'enproceso') return 'enprogreso';
    if (s === 'completado' || s === 'completo') return 'entregado';
    // valores esperados permanecen
    const allowed: EstadoPaso[] = ['pendiente','enprogreso','completado','aprobado','rechazado','excepcion','entregado','fallido','cancelado','en_proceso'];
    return (allowed.includes(s as EstadoPaso) ? (s as EstadoPaso) : 'pendiente');
  };

  const mapApiResponseToPaso = (apiPaso: PasoSolicitudApiResponse): PasoSolicitud => {
    const id = apiPaso.id ?? apiPaso.id_paso_solicitud ?? 0;
    const pasoId = apiPaso.pasoId ?? apiPaso.paso_id ?? id;
    const solicitudId = apiPaso.solicitudId ?? apiPaso.solicitud_id ?? 0;
    const usuarioAsignadoId = apiPaso.usuarioAsignadoId ?? apiPaso.usuario_asignado_id ?? 0;
  const tipoPasoRaw = apiPaso.tipoPaso ?? apiPaso.tipo_paso ?? 'ejecucion';
  const estadoRaw = apiPaso.estado ?? 'pendiente';
    const nombre = apiPaso.nombre ?? `Paso ${pasoId || id}`;
    const fechaCreacion = apiPaso.fechaCreacion ?? apiPaso.fecha_creacion ?? new Date().toISOString();
    const prioridadRaw = apiPaso.prioridad ?? apiPaso.prioridad_paso ?? 'media';
    return {
      id,
      pasoId,
      solicitudId,
      usuarioAsignadoId,
  tipoPaso: normalizeTipoPaso(tipoPasoRaw),
  estado: normalizeEstadoPaso(estadoRaw),
      nombre,
      descripcion: apiPaso.descripcion,
      fechaCreacion,
      fechaVencimiento: apiPaso.fechaVencimiento ?? apiPaso.fecha_vencimiento,
      fechaCompletado: apiPaso.fechaCompletado ?? apiPaso.fecha_completado,
      prioridad: prioridadRaw as PasoSolicitud['prioridad'],
      solicitudNombre: apiPaso.solicitudNombre ?? apiPaso.solicitud_nombre,
      solicitanteNombre: apiPaso.solicitanteNombre ?? apiPaso.solicitante_nombre,
      flujoId: apiPaso.flujoId ?? apiPaso.flujo_id,
      flujoNombre: apiPaso.flujoNombre ?? apiPaso.flujo_nombre,
      usuarioAsignado: apiPaso.usuarioAsignado,
      metadatos: apiPaso.metadatos,
      comentarios: apiPaso.comentarios,
    };
  };

  // Construir query params para filtros
  const buildQueryParams = (filtros?: FiltrosPasoSolicitud): string => {
    if (!filtros) return '';
    
    const params = new URLSearchParams();
    
    if (filtros.tipoPaso) params.append('tipoPaso', filtros.tipoPaso);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
  // prioridad no está definida actualmente en FiltrosPasoSolicitud (comentado para evitar error TS)
  // if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros.solicitudId) params.append('solicitudId', filtros.solicitudId.toString());
    if (filtros.flujoId) params.append('flujoId', filtros.flujoId.toString());
    
    return params.toString() ? `?${params.toString()}` : '';
  };

  // Obtener pasos de un usuario
  const fetchPasos = useCallback(async (usuarioId: number, filtros?: FiltrosPasoSolicitud) => {
    if (!usuarioId || usuarioId <= 0) {
      setError('ID de usuario inválido');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const queryParams = buildQueryParams(filtros);
      const url = `/api/pasosolicitud/usuario/${usuarioId}${queryParams}`;
      
      console.log('Fetching pasos from:', url);
      
      const response = await api.get<PasoSolicitudApiResponse[]>(url);
      
      const pasosMapeados = response.data.map(mapApiResponseToPaso);
      setPasos(pasosMapeados);
      setLastFetchParams({ usuarioId, filtros });
      
      console.log('Pasos fetched successfully:', pasosMapeados);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.response?.data?.error || 
                          axiosError.message || 
                          'Error al cargar los pasos';
      
      setError(errorMessage);
      console.error('Error fetching pasos:', err);
      
      // Si es error 404 o de red en desarrollo, usar datos mock
      if (axiosError.response?.status === 404 || axiosError.code === 'ERR_NETWORK') {
        console.warn('Using mock data due to API error:', errorMessage);
        
        // Crear datos mock dinámicos para el usuario actual
        let mockPasos = [...MOCK_PASOS_SOLICITUD];
        
        // Asignar algunos pasos al usuario actual si usuarioAsignadoId es 0
        mockPasos = mockPasos.map(paso => ({
          ...paso,
          usuarioAsignadoId: paso.usuarioAsignadoId === 0 ? usuarioId : paso.usuarioAsignadoId,
          usuarioAsignado: paso.usuarioAsignadoId === 0 ? {
            id: usuarioId,
            nombre: 'Usuario Actual',
            email: 'usuario@empresa.com'
          } : paso.usuarioAsignado
        }));
        
        // Filtrar por usuario
        mockPasos = mockPasos.filter(paso => paso.usuarioAsignadoId === usuarioId);
        
        // Si no hay pasos para este usuario, crear al menos uno
        if (mockPasos.length === 0) {
          mockPasos = [{
            id: 999,
            pasoId: 9999,
            solicitudId: 9999,
            usuarioAsignadoId: usuarioId,
            tipoPaso: 'aprobacion' as const,
            estado: 'pendiente' as const,
            nombre: 'Paso de Prueba',
            descripcion: 'Este es un paso de prueba generado automáticamente',
            fechaCreacion: new Date().toISOString(),
            prioridad: 'media' as const,
            solicitudNombre: 'Solicitud de Prueba',
            solicitanteNombre: 'Usuario Demo',
            usuarioAsignado: {
              id: usuarioId,
              nombre: 'Usuario Actual',
              email: 'usuario@empresa.com'
            }
          }];
        }
        
        // Aplicar filtros si existen
        if (filtros) {
          if (filtros.tipoPaso) {
            mockPasos = mockPasos.filter(paso => paso.tipoPaso === filtros.tipoPaso);
          }
          if (filtros.estado) {
            mockPasos = mockPasos.filter(paso => paso.estado === filtros.estado);
          }
          // if (filtros.prioridad) {
          //   mockPasos = mockPasos.filter(paso => paso.prioridad === filtros.prioridad);
          // }
          if (filtros.fechaDesde) {
            mockPasos = mockPasos.filter(paso => paso.fechaCreacion >= filtros.fechaDesde!);
          }
          if (filtros.fechaHasta) {
            mockPasos = mockPasos.filter(paso => paso.fechaCreacion <= filtros.fechaHasta!);
          }
        }
        
        setPasos(mockPasos);
        setLastFetchParams({ usuarioId, filtros });
        setError(null); // Clear error when using mock data
        console.log('Using mock pasos for user', usuarioId, ':', mockPasos);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Ejecutar acción sobre un paso (aprobar, rechazar, ejecutar)
  const ejecutarAccion = useCallback(async (
    pasoId: number, 
    accion: AccionPasoRequest
  ): Promise<AccionPasoResponse> => {
    if (!pasoId || pasoId <= 0) {
      throw new Error('ID de paso inválido');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AccionPasoResponse>(
        `/api/pasosolicitud/${pasoId}/accion`,
        accion
      );

      // Actualizar el paso local si la acción fue exitosa
      if (response.data.exito && response.data.pasoActualizado) {
        setPasos(prevPasos => 
          prevPasos.map(paso => {
            const same = paso.pasoId === pasoId || paso.id === pasoId;
            return same
              ? mapApiResponseToPaso(response.data.pasoActualizado as PasoSolicitudApiResponse)
              : paso;
          })
        );
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.response?.data?.error || 
                          axiosError.message || 
                          'Error al ejecutar la acción';
      
      // En caso de error de red, simular respuesta exitosa para demo
      if (axiosError.code === 'ERR_NETWORK') {
        console.warn('Simulating action success due to network error');
        
        // Simular actualización local del paso
        setPasos(prevPasos => prevPasos.map(paso => {
          if (paso.pasoId === pasoId || paso.id === pasoId) {
            // Usamos 'entregado' como estado final genérico en ausencia de 'completado'
            const nuevoEstado = accion.accion === 'rechazar' ? 'rechazado' : 'entregado';
            return {
              ...paso,
              estado: nuevoEstado,
              fechaCompletado: new Date().toISOString(),
              comentarios: accion.comentarios || `${accion.accion} ejecutado (simulado)`
            } as PasoSolicitud;
          }
          return paso;
        }));
        
        return {
          exito: true,
          mensaje: `Paso ${accion.accion === 'aprobar' ? 'aprobado' : accion.accion === 'rechazar' ? 'rechazado' : 'ejecutado'} correctamente (simulado)`,
          pasoActualizado: undefined
        };
      }
      
      setError(errorMessage);
      console.error('Error executing action:', err);
      
      // Re-lanzar el error para que el componente pueda manejarlo
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch con los últimos parámetros
  const refetch = useCallback(() => {
    if (lastFetchParams) {
      fetchPasos(lastFetchParams.usuarioId, lastFetchParams.filtros);
    }
  }, [fetchPasos, lastFetchParams]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-limpiar error después de 10 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    pasos,
    loading,
    error,
    fetchPasos,
    ejecutarAccion,
    refetch,
    clearError,
  };
};