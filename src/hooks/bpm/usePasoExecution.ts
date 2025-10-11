import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchPasoExecutionRelations, upsertDraft, enqueueForFlush, flushPasoDrafts, selectExecutionPaso, selectCanExecutePaso } from '@/store/bpm/executionInputsSlice';
import type { ExecutionInputsState } from '@/store/bpm/executionInputsSlice';

/**
 * Hook de alto nivel para manejar ejecución de un Paso (inputs dinámicos runtime)
 * MVP: solo carga y edición de valores + flush manual/forzado antes de ejecutar.
 */
export const usePasoExecution = (pasoId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  type R = RootState & { executionInputs: ExecutionInputsState };
  const pasoState = useSelector((s: R) => selectExecutionPaso(s, pasoId));
  const canExecute = useSelector((s: R) => selectCanExecutePaso(s, pasoId));

  const load = useCallback(() => {
    if (!pasoId) return;
    return dispatch(fetchPasoExecutionRelations({ pasoId }));
  }, [dispatch, pasoId]);

  const updateDraft = useCallback((relationId: number, rawValue: string, tipoInput?: string) => {
    dispatch(upsertDraft({ pasoId, relationId, rawValue, tipoInput }));
  }, [dispatch, pasoId]);

  const queueFlush = useCallback((relationId: number) => {
    dispatch(enqueueForFlush({ pasoId, relationId }));
  }, [dispatch, pasoId]);

  const flush = useCallback(() => dispatch(flushPasoDrafts({ pasoId })), [dispatch, pasoId]);

  return {
    state: pasoState,
    canExecute,
    load,
    updateDraft,
    queueFlush,
    flush,
  };
};
