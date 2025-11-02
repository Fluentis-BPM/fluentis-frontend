// Simple in-memory store to keep transient, optimistic rejections for PasoSolicitud
// Behavior: when user rejects a step, we mark it here so UI shows "rechazado"
// until the user explicitly refreshes the views, at which point we clear the overrides.

const optimisticRejected: Set<number> = new Set();

export const markRejected = (pasoId: number) => {
  if (typeof pasoId === 'number' && pasoId > 0) optimisticRejected.add(pasoId);
};

export const isRejected = (pasoId: number): boolean => optimisticRejected.has(pasoId);

export const clearAllOptimistic = () => {
  optimisticRejected.clear();
};

export const clearOptimisticFor = (ids: number[]) => {
  ids.forEach(id => optimisticRejected.delete(id));
};

export const getAllOptimistic = (): number[] => Array.from(optimisticRejected);
