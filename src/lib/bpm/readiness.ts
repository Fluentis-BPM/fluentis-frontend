import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';

export type ReadinessResult = {
  ready: boolean;
  completedParents: number;
  totalParents: number;
  pendingParentIds: number[];
};

// Estados que consideramos como "completados" para habilitar destinos en conexiones normales
const COMPLETED_STATES = new Set(['aprobado', 'entregado']);

export function calcularReadinessPaso(
  pasoId: number,
  pasos: PasoSolicitud[] = [],
  caminos: CaminoParalelo[] = []
): ReadinessResult {
  if (!pasoId) return { ready: true, completedParents: 0, totalParents: 0, pendingParentIds: [] };

  // Obtener el paso actual para saber su tipo_flujo
  const pasoActual = pasos.find(p => p.id_paso_solicitud === pasoId);
  const tipoFlujo = pasoActual?.tipo_flujo || 'normal';

  // Obtener todas las conexiones que apuntan a este paso
  const parentConnections = caminos.filter(c => c.paso_destino_id === pasoId);

  console.log(`🔍 [Readiness] Paso ${pasoId} (${pasoActual?.nombre}, tipo_flujo: ${tipoFlujo}):`, {
    totalConnections: parentConnections.length,
    connections: parentConnections.map(c => ({
      origen: c.paso_origen_id,
      destino: c.paso_destino_id,
      esExcepcion: c.es_excepcion
    }))
  });

  const totalParents = parentConnections.length;
  if (totalParents === 0) return { ready: true, completedParents: 0, totalParents: 0, pendingParentIds: [] };

  let completedParents = 0;
  const pendingParentIds: number[] = [];

  for (const connection of parentConnections) {
    const parentPaso = pasos.find(p => p.id_paso_solicitud === connection.paso_origen_id);
    const estado = parentPaso?.estado?.toLowerCase() || '';
    
    console.log(`  📌 Conexión desde paso ${connection.paso_origen_id} (${parentPaso?.nombre}):`, {
      esExcepcion: connection.es_excepcion,
      estadoPadre: estado,
      tipoPasoPadre: parentPaso?.tipo_paso
    });
    
    // Si es una conexión de excepción, solo se habilita cuando el padre está rechazado
    // Si es una conexión normal, se habilita cuando el padre está aprobado o entregado
    let isParentCompleted = false;
    
    if (connection.es_excepcion) {
      // Conexión de excepción: solo se activa si el padre está rechazado
      isParentCompleted = estado === 'rechazado';
      console.log(`    ⚠️  Conexión EXCEPCIÓN: rechazado=${estado === 'rechazado'}`);
    } else {
      // Conexión normal: se activa si el padre está aprobado o entregado
      isParentCompleted = COMPLETED_STATES.has(estado);
      console.log(`    ✅ Conexión NORMAL: completado=${isParentCompleted}`);
    }
    
    if (isParentCompleted) {
      completedParents++;
    } else {
      pendingParentIds.push(connection.paso_origen_id);
    }
  }

  // Determinar si el paso está listo según su tipo_flujo:
  // - 'union': requiere que TODAS las conexiones entrantes estén completadas
  // - 'normal' o 'bifurcacion': con que AL MENOS UNA conexión esté completada es suficiente
  let ready = false;
  if (tipoFlujo === 'union') {
    ready = completedParents === totalParents;
  } else {
    ready = completedParents > 0;
  }
  
  console.log(`  🎯 Resultado (tipo_flujo=${tipoFlujo}): ready=${ready}, completados=${completedParents}/${totalParents}`);
  
  return { ready, completedParents, totalParents, pendingParentIds };
}

export { COMPLETED_STATES };
