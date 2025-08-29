// src/store/bpm/bpmSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FlujoActivo, PasoSolicitud, CaminoParalelo, FlujoActivoResponse } from '@/types/bpm/flow';
import api from '@/services/api';
import type { RootState } from '@/store';

interface BpmState {
  flujosActivos: FlujoActivo[];
  pasosPorFlujo: { [key: number]: PasoSolicitud[] };
  caminosPorFlujo: { [key: number]: CaminoParalelo[] };
  loading: boolean;
  error: string | null;
  flujoSeleccionado: number | null;
  deleting: boolean;
  lastActionError: string | null;
}

const initialState: BpmState = {
  flujosActivos: [],
  pasosPorFlujo: {},
  caminosPorFlujo: {},
  loading: false,
  error: null,
  flujoSeleccionado: null,
  deleting: false,
  lastActionError: null,
};

export const fetchFlujosActivos = createAsyncThunk(
  'bpm/fetchFlujosActivos',
  async (_, { rejectWithValue }) => {
    try {
  const response = await api.get<FlujoActivo[]>('/api/FlujosActivos');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue('Error al cargar los flujos activos: ' + (error as Error).message);
    }
  }
);

export const fetchPasosYConexiones = createAsyncThunk(
  'bpm/fetchPasosYConexiones',
  async (flujoActivoId: number, { rejectWithValue }) => {
    try {
  const response = await api.get<FlujoActivoResponse>(`/api/FlujosActivos/Pasos/${flujoActivoId}`);
      return {
        flujoId: response.data.flujoActivoId,
        pasos: response.data.pasos,
        caminos: response.data.caminos,
      };
    } catch (error: unknown) {
      return rejectWithValue('Error al conectar con el servidor: ' + (error as Error).message);
    }
  }
);

export const deletePasoSolicitud = createAsyncThunk<void, { id: number }, { state: RootState; rejectValue: string }>('bpm/deletePasoSolicitud', async ({ id }, { dispatch, getState, rejectWithValue }) => {
  try {
    await api.delete(`/api/PasoSolicitud/${id}`);
    // after delete, refresh pasos for the currently selected flujo (if any)
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) {
      await dispatch(fetchPasosYConexiones(flujoId));
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error eliminando paso';
    return rejectWithValue(msg);
  }
});

export const createPasoSolicitud = createAsyncThunk<PasoSolicitud, { data: unknown }, { state: RootState; rejectValue: string }>('bpm/createPasoSolicitud', async ({ data }, { dispatch, getState, rejectWithValue }) => {
  try {
    const resp = await api.post('/api/PasoSolicitud', data);
    // refresh current flujo pasos
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
    return resp.data;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error creando paso';
    return rejectWithValue(msg);
  }
});

export const updatePasoSolicitud = createAsyncThunk<void, { id: number; data: unknown }, { state: RootState; rejectValue: string }>('bpm/updatePasoSolicitud', async ({ id, data }, { dispatch, getState, rejectWithValue }) => {
  try {
    await api.put(`/api/PasoSolicitud/${id}`, data);
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error actualizando paso';
    return rejectWithValue(msg);
  }
});

export const putConexionesPaso = createAsyncThunk<void, { id: number; destinos: number[] }, { state: RootState; rejectValue: string }>('bpm/putConexionesPaso', async ({ id, destinos }, { dispatch, getState, rejectWithValue }) => {
  try {
    await api.put(`/api/PasoSolicitud/${id}/conexiones`, destinos);
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error seteando conexiones';
    return rejectWithValue(msg);
  }
});

export const deleteConexionPaso = createAsyncThunk<void, { id: number; destinoId: number }, { state: RootState; rejectValue: string }>('bpm/deleteConexionPaso', async ({ id, destinoId }, { dispatch, getState, rejectWithValue }) => {
  try {
    await api.delete(`/api/PasoSolicitud/${id}/conexiones/${destinoId}`);
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error eliminando conexion';
    return rejectWithValue(msg);
  }
});

export const createConexionPaso = createAsyncThunk<PasoSolicitud | void, { id: number; destinoId: number; esExcepcion?: boolean }, { state: RootState; rejectValue: string }>('bpm/createConexionPaso', async ({ id, destinoId, esExcepcion }, { dispatch, getState, rejectWithValue }) => {
  try {
    const body = { DestinoId: destinoId, EsExcepcion: esExcepcion ?? false };
    const resp = await api.post(`/api/PasoSolicitud/${id}/conexiones`, body);
    const flujoId = getState().bpm.flujoSeleccionado;
    if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
    return resp.data;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error creando conexion';
    return rejectWithValue(msg);
  }
});

// Crear relación de grupo de aprobación para un paso de tipo aprobación
export const createRelacionGrupoAprobacionPaso = createAsyncThunk<void, { id: number; grupoAprobacionId: number }, { state: RootState; rejectValue: string }>(
  'bpm/createRelacionGrupoAprobacionPaso',
  async ({ id, grupoAprobacionId }, { dispatch, getState, rejectWithValue }) => {
    try {
      await api.post(`/api/PasoSolicitud/${id}/grupoaprobacion`, { GrupoAprobacionId: grupoAprobacionId });
      const flujoId = getState().bpm.flujoSeleccionado;
      if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error asociando grupo de aprobación al paso';
      return rejectWithValue(msg);
    }
  }
);

// DTOs for PasoSolicitud Inputs
export interface PasoRelacionInputValorDto { RawValue: string | number | boolean | null }
export interface PasoRelacionInputCreateDto {
  InputId: number;
  Nombre?: string;
  PlaceHolder?: string;
  Valor?: PasoRelacionInputValorDto | null;
  Requerido?: boolean;
}

// Add an input to a PasoSolicitud (only for tipo Ejecucion)
export const addPasoInput = createAsyncThunk<unknown, { id: number; input: PasoRelacionInputCreateDto }, { state: RootState; rejectValue: string }>(
  'bpm/addPasoInput',
  async ({ id, input }, { dispatch, getState, rejectWithValue }) => {
    try {
  const { data } = await api.post(`/api/PasoSolicitud/${id}/inputs`, input);
      const flujoId = getState().bpm.flujoSeleccionado;
      if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown; statusText?: string }; message?: string };
      const msg = String(err?.message || '');
      const serverMsg = String(err?.response?.data as string ?? '');
      // backend sometimes throws Json cycle on response; treat as soft-success and refresh
      if (err?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected'))) {
        const flujoId = getState().bpm.flujoSeleccionado;
        if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
        return null;
      }
  return rejectWithValue('Error agregando input al paso: ' + (err?.response?.statusText || msg));
    }
  }
);

// Update a PasoSolicitud input value/metadata
export const updatePasoInput = createAsyncThunk<unknown, { id: number; inputId: number; input: Partial<PasoRelacionInputCreateDto> & { Valor?: PasoRelacionInputValorDto | null } }, { state: RootState; rejectValue: string }>(
  'bpm/updatePasoInput',
  async ({ id, inputId, input }, { dispatch, getState, rejectWithValue }) => {
    try {
  const { data } = await api.put(`/api/PasoSolicitud/${id}/inputs/${inputId}`, input);
      const flujoId = getState().bpm.flujoSeleccionado;
      if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown; statusText?: string }; message?: string };
      const msg = String(err?.message || '');
      const serverMsg = String(err?.response?.data as string ?? '');
      if (err?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected'))) {
        const flujoId = getState().bpm.flujoSeleccionado;
        if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
        return null;
      }
  return rejectWithValue('Error actualizando input del paso: ' + (err?.response?.statusText || msg));
    }
  }
);

// Remove a PasoSolicitud input
export const deletePasoInput = createAsyncThunk<void, { id: number; inputId: number }, { state: RootState; rejectValue: string }>(
  'bpm/deletePasoInput',
  async ({ id, inputId }, { dispatch, getState, rejectWithValue }) => {
    try {
  await api.delete(`/api/PasoSolicitud/${id}/inputs/${inputId}`);
      const flujoId = getState().bpm.flujoSeleccionado;
      if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown; statusText?: string }; message?: string };
      const msg = String(err?.message || '');
      const serverMsg = String(err?.response?.data as string ?? '');
      if (err?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected'))) {
        const flujoId = getState().bpm.flujoSeleccionado;
        if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
        return;
      }
  return rejectWithValue('Error eliminando input del paso: ' + (err?.response?.statusText || msg));
    }
  }
);


const bpmSlice = createSlice({
  name: 'bpm',
  initialState,
  reducers: {
    setFlujoSeleccionado: (state, action: PayloadAction<number | null>) => {
      state.flujoSeleccionado = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlujosActivos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlujosActivos.fulfilled, (state, action: PayloadAction<FlujoActivo[]>) => {
        state.loading = false;
        state.flujosActivos = action.payload;
      })
      .addCase(fetchFlujosActivos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPasosYConexiones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPasosYConexiones.fulfilled, (state, action) => {
        state.loading = false;
        const { flujoId, pasos, caminos } = action.payload;
        state.pasosPorFlujo[flujoId] = pasos;
        state.caminosPorFlujo[flujoId] = caminos;
      })
      .addCase(fetchPasosYConexiones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePasoSolicitud.pending, (state) => { state.deleting = true; state.lastActionError = null; })
      .addCase(deletePasoSolicitud.fulfilled, (state) => { state.deleting = false; })
      .addCase(deletePasoSolicitud.rejected, (state, action) => { state.deleting = false; state.lastActionError = action.payload as string || 'Error eliminando paso'; })
      .addCase(createPasoSolicitud.pending, (state) => { state.loading = true; state.lastActionError = null; })
      .addCase(createPasoSolicitud.fulfilled, (state) => { state.loading = false; })
      .addCase(createPasoSolicitud.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error creando paso'; })
      .addCase(updatePasoSolicitud.pending, (state) => { state.loading = true; state.lastActionError = null; })
      .addCase(updatePasoSolicitud.fulfilled, (state) => { state.loading = false; })
      .addCase(updatePasoSolicitud.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error actualizando paso'; })
      .addCase(putConexionesPaso.pending, (state) => { state.loading = true; state.lastActionError = null; })
      .addCase(putConexionesPaso.fulfilled, (state) => { state.loading = false; })
      .addCase(putConexionesPaso.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error seteando conexiones'; })
      .addCase(deleteConexionPaso.pending, (state) => { state.loading = true; state.lastActionError = null; })
      .addCase(deleteConexionPaso.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteConexionPaso.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error eliminando conexion'; })
      .addCase(createConexionPaso.pending, (state) => { state.loading = true; state.lastActionError = null; })
      .addCase(createConexionPaso.fulfilled, (state) => { state.loading = false; })
  .addCase(createConexionPaso.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error creando conexion'; })
  .addCase(createRelacionGrupoAprobacionPaso.pending, (state) => { state.loading = true; state.lastActionError = null; })
  .addCase(createRelacionGrupoAprobacionPaso.fulfilled, (state) => { state.loading = false; })
  .addCase(createRelacionGrupoAprobacionPaso.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error asociando grupo'; })
  .addCase(addPasoInput.pending, (state) => { state.loading = true; state.lastActionError = null; })
  .addCase(addPasoInput.fulfilled, (state) => { state.loading = false; })
  .addCase(addPasoInput.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error agregando input'; })
  .addCase(updatePasoInput.pending, (state) => { state.loading = true; state.lastActionError = null; })
  .addCase(updatePasoInput.fulfilled, (state) => { state.loading = false; })
  .addCase(updatePasoInput.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error actualizando input'; })
  .addCase(deletePasoInput.pending, (state) => { state.loading = true; state.lastActionError = null; })
  .addCase(deletePasoInput.fulfilled, (state) => { state.loading = false; })
  .addCase(deletePasoInput.rejected, (state, action) => { state.loading = false; state.lastActionError = action.payload as string || 'Error eliminando input'; });
  },
});

export const { setFlujoSeleccionado } = bpmSlice.actions;
export default bpmSlice.reducer;