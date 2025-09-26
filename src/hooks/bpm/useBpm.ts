// src/hooks/bpm/useBpm.ts
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchPasosYConexiones, fetchFlujosActivos, setFlujoSeleccionado, deletePasoSolicitud, createPasoSolicitud, updatePasoSolicitud, putConexionesPaso, deleteConexionPaso, createConexionPaso, createRelacionGrupoAprobacionPaso, addPasoInput, updatePasoInput, deletePasoInput, stagePasoMetadata, stagePosition, stageGroupApproval, stageInputAdd, stageInputCreateUpdate, stageInputUpdate, stageInputDelete, clearPasoDraft, clearAllDrafts, commitAllPasoDrafts, selectDirtyPasoIds, selectIsAnyDirty } from '@/store/bpm/bpmSlice';

export const useBpm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { flujosActivos, pasosPorFlujo, caminosPorFlujo, loading, error, flujoSeleccionado } = useSelector(
    (state: RootState) => state.bpm
  );
  const isAnyDirty = useSelector(selectIsAnyDirty);
  const dirtyPasoIds = useSelector(selectDirtyPasoIds);

  const { deleting, lastActionError } = useSelector((state: RootState) => state.bpm);

  const loadFlujosActivos = useCallback(() => {
    dispatch(fetchFlujosActivos());
  }, [dispatch]);

  const loadPasosYConexiones = useCallback(
    (flujoActivoId: number) => {
      dispatch(fetchPasosYConexiones(flujoActivoId));
    },
    [dispatch]
  );

  const selectFlujo = useCallback(
    (flujoId: number | null) => {
      dispatch(setFlujoSeleccionado(flujoId));
      if (flujoId) {
        loadPasosYConexiones(flujoId);
      }
    },
    [dispatch, loadPasosYConexiones]
  );

  return {
    flujosActivos,
    pasosPorFlujo,
    caminosPorFlujo,
    loading,
    error,
  deleting,
  lastActionError,
    flujoSeleccionado,
    isAnyDirty,
    dirtyPasoIds,
    loadFlujosActivos,
    loadPasosYConexiones,
    selectFlujo,
    // staging API
    stagePasoMetadata: (pasoId: number, patch: Record<string, unknown>) => dispatch(stagePasoMetadata({ pasoId, patch })),
    stagePosition: (pasoId: number, x: number, y: number) => dispatch(stagePosition({ pasoId, x, y })),
    stageGroupApproval: (pasoId: number, groupId: number | null) => dispatch(stageGroupApproval({ pasoId, groupId })),
  stageInputAdd: (pasoId: number, input: Parameters<typeof stageInputAdd>[0]['input'], tmpId?: string) => dispatch(stageInputAdd({ pasoId, input, tmpId })),
  stageInputCreateUpdate: (pasoId: number, tmpId: string, patch: Parameters<typeof stageInputCreateUpdate>[0]['patch']) => dispatch(stageInputCreateUpdate({ pasoId, tmpId, patch })),
    stageInputUpdate: (pasoId: number, relationId: number, patch: Parameters<typeof stageInputUpdate>[0]['patch']) => dispatch(stageInputUpdate({ pasoId, relationId, patch })),
    stageInputDelete: (pasoId: number, relationId?: number, tmpId?: string) => dispatch(stageInputDelete({ pasoId, relationId, tmpId })),
    clearPasoDraft: (pasoId: number) => dispatch(clearPasoDraft({ pasoId })),
    clearAllDrafts: () => dispatch(clearAllDrafts()),
    commitAllPasoDrafts: () => dispatch(commitAllPasoDrafts()),
  deletePasoSolicitud: (id: number) => dispatch(deletePasoSolicitud({ id })),
  createPasoSolicitud: (data: unknown) => dispatch(createPasoSolicitud({ data })),
  updatePasoSolicitud: (id: number, data: unknown) => dispatch(updatePasoSolicitud({ id, data })),
  createConexionPaso: (id: number, destinoId: number, esExcepcion?: boolean) => dispatch(createConexionPaso({ id, destinoId, esExcepcion })),
  putConexionesPaso: (id: number, destinos: number[]) => dispatch(putConexionesPaso({ id, destinos })),
  deleteConexionPaso: (id: number, destinoId: number) => dispatch(deleteConexionPaso({ id, destinoId })),
  createRelacionGrupoAprobacionPaso: (id: number, grupoAprobacionId: number) => dispatch(createRelacionGrupoAprobacionPaso({ id, grupoAprobacionId })),
  addPasoInput: (id: number, input: Parameters<typeof addPasoInput>[0]['input']) => dispatch(addPasoInput({ id, input })),
  updatePasoInput: (id: number, inputId: number, input: Parameters<typeof updatePasoInput>[0]['input']) => dispatch(updatePasoInput({ id, inputId, input })),
  deletePasoInput: (id: number, inputId: number) => dispatch(deletePasoInput({ id, inputId })),
  };
};