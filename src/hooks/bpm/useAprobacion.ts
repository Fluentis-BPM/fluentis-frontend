import { useState, useCallback } from 'react';
import { 
  GrupoAprobacion, 
  RelacionGrupoAprobacion, 
  RelacionDecisionUsuario, 
  TipoDecision,
  GrupoAprobacionCompleto 
} from '@/types/bpm/approval';

/**
 * Hook para manejar el proceso de aprobación
 * Gestiona grupos, relaciones y decisiones de usuarios
 */
export const useAprobacion = () => {
  const [gruposAprobacion, setGruposAprobacion] = useState<GrupoAprobacion[]>([]);
  const [relacionesGrupo, setRelacionesGrupo] = useState<RelacionGrupoAprobacion[]>([]);
  const [decisiones, setDecisiones] = useState<RelacionDecisionUsuario[]>([]);
  const [miembrosGrupos, setMiembrosGrupos] = useState<{ [grupoId: number]: number[] }>({});

  // Generar IDs únicos
  const generarIdUnico = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  // Crear grupo de aprobación
  const crearGrupoAprobacion = useCallback((nombre: string, miembros: number[] = []): GrupoAprobacion => {
    console.log('🔥 CREANDO GRUPO:', { nombre, miembros });
    
    const nuevoGrupo: GrupoAprobacion = {
      id_grupo: generarIdUnico(),
      nombre
    };
    
    console.log('🔥 GRUPO CREADO:', nuevoGrupo);
    console.log('🔥 MIEMBROS A GUARDAR:', miembros);
    
    setGruposAprobacion(prev => [...prev, nuevoGrupo]);
    // Guardar miembros del grupo
    setMiembrosGrupos(prev => {
      const nuevosMinembros = {
        ...prev,
        [nuevoGrupo.id_grupo]: miembros
      };
      console.log('🔥 ESTADO MIEMBROS ACTUALIZADO:', nuevosMinembros);
      return nuevosMinembros;
    });
    return nuevoGrupo;
  }, [generarIdUnico]);

  // Asociar grupo a solicitud
  const asociarGrupoASolicitud = useCallback((grupo_aprobacion_id: number, solicitud_id: number): RelacionGrupoAprobacion => {
    console.log('🚨 ASOCIANDO GRUPO A SOLICITUD:', { grupo_aprobacion_id, solicitud_id });
    
    const nuevaRelacion: RelacionGrupoAprobacion = {
      id_relacion: generarIdUnico(),
      grupo_aprobacion_id,
      solicitud_id
    };
    
    console.log('🚨 RELACIÓN CREADA:', nuevaRelacion);
    
    setRelacionesGrupo(prev => {
      const nuevasRelaciones = [...prev, nuevaRelacion];
      console.log('🚨 ESTADO RELACIONES ACTUALIZADO:', nuevasRelaciones);
      return nuevasRelaciones;
    });
    
    return nuevaRelacion;
  }, [generarIdUnico]);

  // Registrar decisión de usuario
  const registrarDecision = useCallback((
    id_usuario: number, 
    relacion_grupo_aprobacion_id: number, 
    decision: TipoDecision,
    onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void
  ) => {
    setDecisiones(prev => {
      // Verificar si ya existe una decisión para este usuario y relación
      const decisionExistente = prev.find(
        d => d.id_usuario === id_usuario && d.relacion_grupo_aprobacion_id === relacion_grupo_aprobacion_id
      );

      let nuevasDecisiones;
      if (decisionExistente) {
        // Actualizar decisión existente
        nuevasDecisiones = prev.map(d => 
          d.id_relacion === decisionExistente.id_relacion 
            ? { ...d, decision }
            : d
        );
      } else {
        // Crear nueva decisión
        const nuevaDecision: RelacionDecisionUsuario = {
          id_relacion: generarIdUnico(),
          id_usuario,
          relacion_grupo_aprobacion_id,
          decision
        };
        nuevasDecisiones = [...prev, nuevaDecision];
      }

      // Verificar cambio de estado después de actualizar
      if (onEstadoCambiado) {
        setTimeout(() => {
          // Buscar la solicitud relacionada
          const relacion = relacionesGrupo.find(r => r.id_relacion === relacion_grupo_aprobacion_id);
          if (relacion) {
            const grupo = gruposAprobacion.find(g => g.id_grupo === relacion.grupo_aprobacion_id);
            const miembrosDelGrupo = miembrosGrupos[grupo?.id_grupo || 0] || [];
            
            // Verificar con las nuevas decisiones
            const decisionesMiembros = nuevasDecisiones.filter(d => 
              d.relacion_grupo_aprobacion_id === relacion_grupo_aprobacion_id && 
              miembrosDelGrupo.includes(d.id_usuario)
            );
            
            const todosDecidieron = decisionesMiembros.length === miembrosDelGrupo.length;
            const todosAprobaron = decisionesMiembros.every(d => d.decision === 'si');
            const algunoRechazo = decisionesMiembros.some(d => d.decision === 'no');
            
            if (todosDecidieron && todosAprobaron) {
              console.log('✅ SOLICITUD APROBADA - Notificando cambio');
              onEstadoCambiado('aprobado');
            } else if (algunoRechazo) {
              console.log('❌ SOLICITUD RECHAZADA - Notificando cambio');
              onEstadoCambiado('rechazado');
            }
          }
        }, 50);
      }

      return nuevasDecisiones;
    });
  }, [generarIdUnico, relacionesGrupo, gruposAprobacion, miembrosGrupos]);

  // Obtener grupo de aprobación de una solicitud
  const obtenerGrupoPorSolicitud = useCallback((solicitud_id: number): GrupoAprobacionCompleto | undefined => {
    console.log('Buscando grupo para solicitud:', solicitud_id);
    console.log('Relaciones disponibles:', relacionesGrupo);
    
    const relacion = relacionesGrupo.find(r => r.solicitud_id === solicitud_id);
    if (!relacion) {
      console.log('No se encontró relación para la solicitud');
      return undefined;
    }

    console.log('Relación encontrada:', relacion);
    
    const grupo = gruposAprobacion.find(g => g.id_grupo === relacion.grupo_aprobacion_id);
    if (!grupo) {
      console.log('No se encontró grupo de aprobación');
      return undefined;
    }

    console.log('Grupo encontrado:', grupo);
    
    const decisionesGrupo = decisiones.filter(d => d.relacion_grupo_aprobacion_id === relacion.id_relacion);
    console.log('Decisiones del grupo:', decisionesGrupo);
    
    const miembrosDelGrupo = miembrosGrupos[grupo.id_grupo] || [];
    console.log('Miembros del grupo:', miembrosDelGrupo);

    return {
      ...grupo,
      miembros: miembrosDelGrupo,
      decisiones: decisionesGrupo
    };
  }, [relacionesGrupo, gruposAprobacion, decisiones, miembrosGrupos]);

  // Verificar si una solicitud está completamente aprobada
  const verificarAprobacionCompleta = useCallback((solicitud_id: number, miembrosGrupo: number[]): boolean => {
    const grupo = obtenerGrupoPorSolicitud(solicitud_id);
    if (!grupo || !grupo.decisiones) return false;

    // Verificar que todos los miembros hayan decidido
    const decisionesMiembros = grupo.decisiones.filter(d => miembrosGrupo.includes(d.id_usuario));
    if (decisionesMiembros.length !== miembrosGrupo.length) return false;

    // Verificar que todas las decisiones sean 'si'
    return decisionesMiembros.every(d => d.decision === 'si');
  }, [obtenerGrupoPorSolicitud]);

  // Verificar si una solicitud está rechazada
  const verificarRechazo = useCallback((solicitud_id: number): boolean => {
    const grupo = obtenerGrupoPorSolicitud(solicitud_id);
    if (!grupo || !grupo.decisiones) return false;

    // Si al menos una decisión es 'no', la solicitud está rechazada
    return grupo.decisiones.some(d => d.decision === 'no');
  }, [obtenerGrupoPorSolicitud]);

  // Obtener estadísticas del proceso de aprobación
  const obtenerEstadisticasAprobacion = useCallback((solicitud_id: number, miembrosGrupo: number[]) => {
    const grupo = obtenerGrupoPorSolicitud(solicitud_id);
    if (!grupo || !grupo.decisiones) {
      return {
        total_miembros: miembrosGrupo.length,
        decisiones_tomadas: 0,
        aprobaciones: 0,
        rechazos: 0,
        pendientes: miembrosGrupo.length
      };
    }

    const decisionesMiembros = grupo.decisiones.filter(d => miembrosGrupo.includes(d.id_usuario));
    const aprobaciones = decisionesMiembros.filter(d => d.decision === 'si').length;
    const rechazos = decisionesMiembros.filter(d => d.decision === 'no').length;

    return {
      total_miembros: miembrosGrupo.length,
      decisiones_tomadas: decisionesMiembros.length,
      aprobaciones,
      rechazos,
      pendientes: miembrosGrupo.length - decisionesMiembros.length
    };
  }, [obtenerGrupoPorSolicitud]);

  // Obtener miembros de un grupo
  const obtenerMiembrosGrupo = useCallback((grupoId: number): number[] => {
    return miembrosGrupos[grupoId] || [];
  }, [miembrosGrupos]);

  return {
    gruposAprobacion,
    relacionesGrupo,
    decisiones,
    miembrosGrupos,
    crearGrupoAprobacion,
    asociarGrupoASolicitud,
    registrarDecision,
    obtenerGrupoPorSolicitud,
    obtenerMiembrosGrupo,
    verificarAprobacionCompleta,
    verificarRechazo,
    obtenerEstadisticasAprobacion
  };
};