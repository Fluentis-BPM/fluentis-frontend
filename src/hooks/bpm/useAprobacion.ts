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
 * Gestiona relaciones y decisiones de usuarios.
 * NOTA: La gestión de grupos ahora proviene del backend (useAprobations).
 */
export const useAprobacion = () => {
  const [relacionesGrupo, setRelacionesGrupo] = useState<RelacionGrupoAprobacion[]>([]);
  const [decisiones, setDecisiones] = useState<RelacionDecisionUsuario[]>([]);
  const [miembrosGrupos] = useState<{ [grupoId: number]: number[] }>({}); // deprecado, miembros ahora vienen en grupo.usuarios

  // Generar IDs únicos (solo para relaciones y decisiones locales por ahora)
  const generarIdUnico = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  // DEPRECADO: crearGrupoAprobacion -> backend
  const crearGrupoAprobacion = useCallback((nombre: string, _miembros: number[] = []): GrupoAprobacion => {
    console.warn('[useAprobacion] crearGrupoAprobacion está deprecado. Usar backend useAprobations.createGrupo');
    // Retorna stub para no romper formularios antiguos
    return { id_grupo: generarIdUnico(), nombre };
  }, [generarIdUnico]);

  // Asociar grupo a solicitud (relación local hasta implementar backend)
  const asociarGrupoASolicitud = useCallback((grupo_aprobacion_id: number, solicitud_id: number): RelacionGrupoAprobacion => {
    const nuevaRelacion: RelacionGrupoAprobacion = {
      id_relacion: generarIdUnico(),
      grupo_aprobacion_id,
      solicitud_id
    };
    setRelacionesGrupo(prev => [...prev, nuevaRelacion]);
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
      const decisionExistente = prev.find(
        d => d.id_usuario === id_usuario && d.relacion_grupo_aprobacion_id === relacion_grupo_aprobacion_id
      );

      let nuevasDecisiones: RelacionDecisionUsuario[];
      if (decisionExistente) {
        nuevasDecisiones = prev.map(d => 
          d.id_relacion === decisionExistente.id_relacion 
            ? { ...d, decision }
            : d
        );
      } else {
        const nuevaDecision: RelacionDecisionUsuario = {
          id_relacion: generarIdUnico(),
          id_usuario,
            relacion_grupo_aprobacion_id,
          decision
        };
        nuevasDecisiones = [...prev, nuevaDecision];
      }

      if (onEstadoCambiado) {
        setTimeout(() => {
          const relacion = relacionesGrupo.find(r => r.id_relacion === relacion_grupo_aprobacion_id);
          if (relacion) {
            // Intentar obtener miembros desde stub legacy (vacío) -> no se emite estado hasta integrar backend de decisiones
            const miembrosDelGrupo: number[] = miembrosGrupos[relacion.grupo_aprobacion_id] || [];
            const decisionesMiembros = nuevasDecisiones.filter(d => 
              d.relacion_grupo_aprobacion_id === relacion.grupo_aprobacion_id && 
              miembrosDelGrupo.includes(d.id_usuario)
            );
            const todosDecidieron = miembrosDelGrupo.length > 0 && decisionesMiembros.length === miembrosDelGrupo.length;
            const todosAprobaron = todosDecidieron && decisionesMiembros.every(d => d.decision === 'si');
            const algunoRechazo = decisionesMiembros.some(d => d.decision === 'no');
            if (todosAprobaron) onEstadoCambiado('aprobado');
            else if (algunoRechazo) onEstadoCambiado('rechazado');
          }
        }, 50);
      }

      return nuevasDecisiones;
    });
  }, [generarIdUnico, relacionesGrupo, miembrosGrupos]);

  // Obtener grupo de aprobación de una solicitud (sin datos reales de grupo aquí)
  const obtenerGrupoPorSolicitud = useCallback((solicitud_id: number): GrupoAprobacionCompleto | undefined => {
    const relacion = relacionesGrupo.find(r => r.solicitud_id === solicitud_id);
    if (!relacion) return undefined;
    // TODO: Integrar lookup al hook backend (context o prop) para enriquecer con usuarios reales
    return { id_grupo: relacion.grupo_aprobacion_id, nombre: 'Grupo', miembros: [], decisiones: decisiones.filter(d => d.relacion_grupo_aprobacion_id === relacion.id_relacion), usuarios: [] } as GrupoAprobacionCompleto;
  }, [relacionesGrupo, decisiones]);

  const verificarAprobacionCompleta = useCallback((solicitud_id: number, miembrosGrupo: number[]): boolean => {
    const grupo = obtenerGrupoPorSolicitud(solicitud_id);
    if (!grupo || !grupo.decisiones) return false;
    const decisionesMiembros = grupo.decisiones.filter(d => miembrosGrupo.includes(d.id_usuario));
    if (decisionesMiembros.length !== miembrosGrupo.length) return false;
    return decisionesMiembros.every(d => d.decision === 'si');
  }, [obtenerGrupoPorSolicitud]);

  const verificarRechazo = useCallback((solicitud_id: number): boolean => {
    const grupo = obtenerGrupoPorSolicitud(solicitud_id);
    if (!grupo || !grupo.decisiones) return false;
    return grupo.decisiones.some(d => d.decision === 'no');
  }, [obtenerGrupoPorSolicitud]);

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

  const obtenerMiembrosGrupo = useCallback((grupoId: number): number[] => {
    return miembrosGrupos[grupoId] || [];
  }, [miembrosGrupos]);

  return {
    relacionesGrupo,
    decisiones,
    miembrosGrupos: {},
    crearGrupoAprobacion, // deprecado
    asociarGrupoASolicitud,
    registrarDecision,
    obtenerGrupoPorSolicitud,
    obtenerMiembrosGrupo,
    verificarAprobacionCompleta,
    verificarRechazo,
    obtenerEstadisticasAprobacion
  };
};