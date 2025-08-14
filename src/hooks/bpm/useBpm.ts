// src/hooks/bpm/useBpm.ts
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchPasosYConexiones, fetchFlujosActivos, setFlujoSeleccionado } from '@/store/bpm/bpmSlice';
import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';

export const useBpm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { flujosActivos, pasosPorFlujo, caminosPorFlujo, loading, error, flujoSeleccionado } = useSelector(
    (state: RootState) => state.bpm
  );

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
    flujoSeleccionado,
    loadFlujosActivos,
    loadPasosYConexiones,
    selectFlujo,
  };
};