import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';

export type ReadinessResult = {
  ready: boolean;
  completedParents: number;
  totalParents: number;
  pendingParentIds: number[];
};

// Estados que consideramos como "completados" temporalmente (opción C)
const COMPLETED_STATES = new Set(['aprobado', 'entregado', 'rechazado']);

export function calcularReadinessPaso(
  pasoId: number,
  pasos: PasoSolicitud[] = [],
  caminos: CaminoParalelo[] = []
): ReadinessResult {
  if (!pasoId) return { ready: true, completedParents: 0, totalParents: 0, pendingParentIds: [] };

  const parents = caminos
    .filter(c => c.paso_destino_id === pasoId)
    .map(c => c.paso_origen_id);

  const totalParents = parents.length;
  if (totalParents === 0) return { ready: true, completedParents: 0, totalParents: 0, pendingParentIds: [] };

  let completedParents = 0;
  const pendingParentIds: number[] = [];

  for (const pid of parents) {
    const parentPaso = pasos.find(p => p.id_paso_solicitud === pid);
    const estado = parentPaso?.estado?.toLowerCase() || '';
    if (COMPLETED_STATES.has(estado)) completedParents++;
    else pendingParentIds.push(pid);
  }

  const ready = completedParents === totalParents;
  return { ready, completedParents, totalParents, pendingParentIds };
}

export { COMPLETED_STATES };
