import { useState, useCallback } from 'react';
import { PasoSolicitud, CaminoParalelo } from '@/types/flow';
import { RelacionDecisionUsuario, TipoDecision } from '@/types/approval';

/**
 * Hook para manejar las transiciones y reglas de aprobación en flujos
 */
export const useTransicionFlujo = () => {
  // Evaluar si un paso de aprobación puede avanzar según sus reglas
  const evaluarAprobacion = useCallback((
    paso: PasoSolicitud,
    decisiones: RelacionDecisionUsuario[]
  ): 'aprobado' | 'rechazado' | 'pendiente' => {
    if (paso.tipo_paso !== 'aprobacion') {
      console.warn('⚠️ Evaluando aprobación en paso que no es de aprobación');
      return 'pendiente';
    }

    if (decisiones.length === 0) return 'pendiente';

    const aprobaciones = decisiones.filter(d => d.decision === 'si').length;
    const rechazos = decisiones.filter(d => d.decision === 'no').length;
    const totalDecisiones = decisiones.length;

    switch (paso.regla_aprobacion) {
      case 'unanime':
        // Todos deben aprobar
        if (rechazos > 0) return 'rechazado';
        // Verificar que todos los miembros del grupo hayan decidido
        // (En una implementación real, se compararía con el número total de miembros)
        return totalDecisiones >= 3 && aprobaciones === totalDecisiones ? 'aprobado' : 'pendiente';

      case 'individual':
        // Cualquier aprobación es suficiente
        if (aprobaciones > 0) return 'aprobado';
        // Si todos han rechazado, entonces rechazar
        return totalDecisiones >= 3 && rechazos === totalDecisiones ? 'rechazado' : 'pendiente';

      case 'ancla':
        // Necesita al menos 2 aprobaciones (usuario ancla + 1)
        if (aprobaciones >= 2) return 'aprobado';
        if (rechazos > totalDecisiones - 2) return 'rechazado';
        return 'pendiente';

      default:
        console.warn('⚠️ Regla de aprobación no reconocida:', paso.regla_aprobacion);
        return 'pendiente';
    }
  }, []);

  // Obtener próximos pasos según el tipo de flujo
  const obtenerProximosPasos = useCallback((
    pasoActual: PasoSolicitud,
    todosLosPasos: PasoSolicitud[],
    caminos: CaminoParalelo[],
    resultado?: 'aprobado' | 'rechazado' | 'completado'
  ): PasoSolicitud[] => {
    // Buscar caminos que salen del paso actual
    const caminosSalida = caminos.filter(c => c.paso_origen_id === pasoActual.id_paso_solicitud);
    
    if (caminosSalida.length === 0) {
      console.log('🏁 No hay más pasos después de:', pasoActual.nombre);
      return [];
    }

    let caminosValidos: CaminoParalelo[] = [];

    // Determinar caminos válidos según el resultado y tipo de flujo
    if (pasoActual.tipo_paso === 'aprobacion' && resultado) {
      if (resultado === 'rechazado') {
        // Buscar caminos de excepción para rechazos
        caminosValidos = caminosSalida.filter(c => c.es_excepcion && c.condicion === 'rechazado');
        
        // Si no hay caminos de excepción, usar caminos normales al final
        if (caminosValidos.length === 0) {
          const pasosFinales = todosLosPasos.filter(p => p.tipo === 'fin');
          if (pasosFinales.length > 0) {
            // Crear un camino virtual al paso final
            console.log('🔄 Redirigiendo rechazo al paso final');
            return pasosFinales;
          }
        }
      } else if (resultado === 'aprobado') {
        // Usar caminos normales para aprobaciones
        caminosValidos = caminosSalida.filter(c => !c.es_excepcion);
      }
    } else {
      // Para pasos de ejecución, usar todos los caminos normales
      caminosValidos = caminosSalida.filter(c => !c.es_excepcion);
    }

    // Si no se encontraron caminos válidos, usar todos los caminos de salida
    if (caminosValidos.length === 0) {
      caminosValidos = caminosSalida;
    }

    // Obtener los pasos destino
    const proximosPasos = caminosValidos
      .map(camino => todosLosPasos.find(p => p.id_paso_solicitud === camino.paso_destino_id))
      .filter((paso): paso is PasoSolicitud => paso !== undefined);

    console.log('🔄 PRÓXIMOS PASOS:', {
      paso_actual: pasoActual.nombre,
      resultado,
      caminos_salida: caminosSalida.length,
      caminos_validos: caminosValidos.length,
      proximos_pasos: proximosPasos.map(p => p.nombre)
    });

    return proximosPasos;
  }, []);

  // Activar próximos pasos cuando uno se completa
  const activarProximosPasos = useCallback((
    pasoCompletado: PasoSolicitud,
    todosLosPasos: PasoSolicitud[],
    caminos: CaminoParalelo[],
    onActivarPaso: (pasoId: number) => void,
    resultado?: 'aprobado' | 'rechazado' | 'completado'
  ) => {
    const proximosPasos = obtenerProximosPasos(pasoCompletado, todosLosPasos, caminos, resultado);
    
    proximosPasos.forEach(paso => {
      // Verificar si el paso puede activarse (todos sus pasos anteriores están completos)
      if (puedeActivarsePaso(paso, todosLosPasos, caminos)) {
        console.log('✅ Activando paso:', paso.nombre);
        onActivarPaso(paso.id_paso_solicitud);
      } else {
        console.log('⏳ Paso en espera (dependencias pendientes):', paso.nombre);
      }
    });
  }, [obtenerProximosPasos]);

  // Verificar si un paso puede activarse (todos sus predecesores están completos)
  const puedeActivarsePaso = useCallback((
    paso: PasoSolicitud,
    todosLosPasos: PasoSolicitud[],
    caminos: CaminoParalelo[]
  ): boolean => {
    // Paso inicial siempre puede activarse
    if (paso.tipo === 'inicio') return true;
    
    // Buscar caminos que llegan a este paso
    const caminosEntrada = caminos.filter(c => c.paso_destino_id === paso.id_paso_solicitud);
    
    if (caminosEntrada.length === 0) {
      // Si no hay caminos de entrada y no es paso inicial, puede ser un error en la configuración
      console.warn('⚠️ Paso sin caminos de entrada:', paso.nombre);
      return false;
    }

    // Verificar según el tipo de flujo del paso
    switch (paso.tipo_flujo) {
      case 'normal':
        // Flujo normal: al menos un paso anterior debe estar completo
        return caminosEntrada.some(camino => {
          const pasoAnterior = todosLosPasos.find(p => p.id_paso_solicitud === camino.paso_origen_id);
          return pasoAnterior && estaCompleto(pasoAnterior);
        });

      case 'bifurcacion':
        // Bifurcación: puede activarse si cualquier rama anterior está completa
        return caminosEntrada.some(camino => {
          const pasoAnterior = todosLosPasos.find(p => p.id_paso_solicitud === camino.paso_origen_id);
          return pasoAnterior && estaCompleto(pasoAnterior);
        });

      case 'union':
        // Unión: todos los pasos anteriores deben estar completos
        return caminosEntrada.every(camino => {
          const pasoAnterior = todosLosPasos.find(p => p.id_paso_solicitud === camino.paso_origen_id);
          return pasoAnterior && estaCompleto(pasoAnterior);
        });

      default:
        console.warn('⚠️ Tipo de flujo no reconocido:', paso.tipo_flujo);
        return false;
    }
  }, []);

  // Verificar si un paso está completo
  const estaCompleto = useCallback((paso: PasoSolicitud): boolean => {
    return ['completado', 'aprobado'].includes(paso.estado);
  }, []);

  // Procesar decisión y actualizar estado del paso
  const procesarDecision = useCallback((
    paso: PasoSolicitud,
    decision: TipoDecision,
    decisiones: RelacionDecisionUsuario[],
    onActualizarPaso: (pasoId: number, nuevoEstado: PasoSolicitud['estado']) => void
  ) => {
    if (paso.tipo_paso !== 'aprobacion') {
      console.warn('⚠️ Procesando decisión en paso que no es de aprobación');
      return;
    }

    // Agregar la nueva decisión a la lista
    const decisionesActualizadas = [...decisiones, {
      id_relacion: Date.now(),
      id_usuario: 1, // Usuario actual simulado
      relacion_grupo_aprobacion_id: 1, // Relación simulada
      decision
    }];

    // Evaluar el estado resultante
    const nuevoEstado = evaluarAprobacion(paso, decisionesActualizadas);
    
    if (nuevoEstado !== 'pendiente') {
      console.log('🎯 DECISIÓN PROCESADA:', {
        paso: paso.nombre,
        regla: paso.regla_aprobacion,
        decision,
        nuevo_estado: nuevoEstado,
        total_decisiones: decisionesActualizadas.length
      });
      
      onActualizarPaso(paso.id_paso_solicitud, nuevoEstado);
    } else {
      console.log('⏳ Decisión registrada, esperando más decisiones para:', paso.nombre);
    }
  }, [evaluarAprobacion]);

  // Verificar si el flujo puede finalizar
  const puedeFinalizarFlujo = useCallback((
    todosLosPasos: PasoSolicitud[]
  ): boolean => {
    const pasosFinales = todosLosPasos.filter(p => p.tipo === 'fin');
    
    if (pasosFinales.length === 0) {
      // Si no hay pasos finales explícitos, verificar que todos los pasos estén completos
      return todosLosPasos.every(estaCompleto);
    }
    
    // Si hay pasos finales, al menos uno debe estar completo
    return pasosFinales.some(estaCompleto);
  }, [estaCompleto]);

  return {
    evaluarAprobacion,
    obtenerProximosPasos,
    activarProximosPasos,
    puedeActivarsePaso,
    estaCompleto,
    procesarDecision,
    puedeFinalizarFlujo
  };
};