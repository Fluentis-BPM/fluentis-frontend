import { useState, useCallback } from 'react';
import { Solicitud, CrearSolicitudInput, EstadoSolicitud } from '@/types/bpm/request';
import { RelacionInput } from '@/types/bpm/inputs';
import { useAprobacion } from './useAprobacion';
import { useFlujos } from './useFlujos';

/**
 * Hook personalizado para manejar el estado de las solicitudes
 * Proporciona funcionalidades CRUD y lógica de negocio
 */
export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [relacionesInput, setRelacionesInput] = useState<RelacionInput[]>([]);
  const aprobacion = useAprobacion();
  const flujos = useFlujos();

  // Generar ID único para nuevas solicitudes y relaciones
  const generarIdUnico = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  const generarIdRelacion = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 10000);
  }, []);

  // Crear nueva solicitud
  const crearSolicitud = useCallback((input: CrearSolicitudInput): Solicitud => {
    const idSolicitud = generarIdUnico();
    
    // Crear relaciones de input dinámicos
    const nuevasRelaciones: RelacionInput[] = [];
    if (input.campos_dinamicos) {
      Object.entries(input.campos_dinamicos).forEach(([input_id, campo]) => {
        const relacion: RelacionInput = {
          id_relacion: generarIdRelacion(),
          input_id: parseInt(input_id),
          solicitud_id: idSolicitud,
          valor: campo.valor,
          requerido: campo.requerido
        };
        nuevasRelaciones.push(relacion);
      });
    }

    const nuevaSolicitud: Solicitud = {
      id_solicitud: idSolicitud,
      solicitante_id: input.solicitante_id,
      fecha_creacion: new Date(),
      flujo_base_id: input.flujo_base_id,
      estado: input.estado || 'pendiente',
      datos_adicionales: input.datos_adicionales,
      campos_dinamicos: nuevasRelaciones,
      // Campos computados
      estado_texto: input.estado || 'pendiente',
      dias_transcurridos: 0
    };

    setSolicitudes(prev => [nuevaSolicitud, ...prev]);
    setRelacionesInput(prev => [...prev, ...nuevasRelaciones]);
    return nuevaSolicitud;
  }, [generarIdUnico, generarIdRelacion]);

  // Actualizar estado de solicitud
  const actualizarEstado = useCallback((id_solicitud: number, nuevoEstado: EstadoSolicitud) => {
    setSolicitudes(prev => prev.map(solicitud => {
      if (solicitud.id_solicitud === id_solicitud) {
        const solicitudActualizada = { ...solicitud, estado: nuevoEstado, estado_texto: nuevoEstado };
        
        // Si la solicitud fue aprobada, crear flujo automáticamente
        if (nuevoEstado === 'aprobado') {
          const relacionesSolicitud = relacionesInput.filter(r => r.solicitud_id === id_solicitud);
          console.log('🚀 SOLICITUD APROBADA, CREANDO FLUJO:', { 
            solicitud_id: id_solicitud, 
            relaciones: relacionesSolicitud.length 
          });
          
          flujos.crearFlujoDesde(
            id_solicitud,
            solicitudActualizada.datos_adicionales,
            relacionesSolicitud,
            solicitudActualizada.flujo_base_id
          );
        }
        
        return solicitudActualizada;
      }
      return solicitud;
    }));
  }, [relacionesInput, flujos]);

  // Asignar grupo de aprobación a solicitud
  const asignarGrupoAprobacion = useCallback((solicitud_id: number, grupo_id: number) => {
    return aprobacion.asociarGrupoASolicitud(grupo_id, solicitud_id);
  }, [aprobacion]);

  // Obtener solicitud por ID
  const obtenerSolicitud = useCallback((id_solicitud: number): Solicitud | undefined => {
    return solicitudes.find(s => s.id_solicitud === id_solicitud);
  }, [solicitudes]);

  // Filtrar solicitudes por estado
  const filtrarPorEstado = useCallback((estado: EstadoSolicitud): Solicitud[] => {
    return solicitudes.filter(s => s.estado === estado);
  }, [solicitudes]);

  // Eliminar solicitud y sus relaciones
  const eliminarSolicitud = useCallback((id_solicitud: number) => {
    setSolicitudes(prev => prev.filter(s => s.id_solicitud !== id_solicitud));
    setRelacionesInput(prev => prev.filter(r => r.solicitud_id !== id_solicitud));
  }, []);

  // Obtener relaciones de input por solicitud
  const obtenerRelacionesPorSolicitud = useCallback((solicitud_id: number): RelacionInput[] => {
    return relacionesInput.filter(r => r.solicitud_id === solicitud_id);
  }, [relacionesInput]);

  // Calcular estadísticas
  const estadisticas = {
    total: solicitudes.length,
    aprobadas: filtrarPorEstado('aprobado').length,
    rechazadas: filtrarPorEstado('rechazado').length,
    pendientes: filtrarPorEstado('pendiente').length
  };

  return {
    solicitudes,
    relacionesInput,
    isLoading,
    crearSolicitud,
    actualizarEstado,
    obtenerSolicitud,
    filtrarPorEstado,
    eliminarSolicitud,
    obtenerRelacionesPorSolicitud,
    asignarGrupoAprobacion,
    estadisticas,
    setIsLoading,
    // Exponer funcionalidades de aprobación
    ...aprobacion,
    // Exponer funcionalidades de flujos
    ...flujos
  };
};