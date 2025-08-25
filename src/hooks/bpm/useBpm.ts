// src/hooks/bpm/useBpm.ts
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchPasosYConexiones, fetchFlujosActivos, setFlujoSeleccionado, deletePasoSolicitud, createPasoSolicitud, updatePasoSolicitud, putConexionesPaso, deleteConexionPaso, createConexionPaso } from '@/store/bpm/bpmSlice';

export const useBpm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { flujosActivos, pasosPorFlujo, caminosPorFlujo, loading, error, flujoSeleccionado } = useSelector(
    (state: RootState) => state.bpm
  );

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
    loadFlujosActivos,
    loadPasosYConexiones,
    selectFlujo,
  deletePasoSolicitud: (id: number) => dispatch(deletePasoSolicitud({ id })),
  createPasoSolicitud: (data: unknown) => dispatch(createPasoSolicitud({ data })),
  updatePasoSolicitud: (id: number, data: unknown) => dispatch(updatePasoSolicitud({ id, data })),
  createConexionPaso: (id: number, destinoId: number, esExcepcion?: boolean) => dispatch(createConexionPaso({ id, destinoId, esExcepcion })),
  putConexionesPaso: (id: number, destinos: number[]) => dispatch(putConexionesPaso({ id, destinos })),
  deleteConexionPaso: (id: number, destinoId: number) => dispatch(deleteConexionPaso({ id, destinoId })),
  };
};