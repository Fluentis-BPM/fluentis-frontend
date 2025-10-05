// src/store/bpm/bpmSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { FlujoActivo, PasoSolicitud, CaminoParalelo, FlujoActivoResponse } from '@/types/bpm/flow';
import api from '@/services/api';
import type { RootState } from '@/store';

// Draft staging types
type MetadataPatch = Record<string, unknown>;
export interface PasoRelacionInputValorDto { RawValue: string | number | boolean | null }
export interface PasoRelacionInputCreateDto {
  InputId: number;
  Nombre?: string;
  PlaceHolder?: string;
  Valor?: PasoRelacionInputValorDto | null;
  Requerido?: boolean;
}
interface DraftInputUpdate {
  id: number; // relation id
  patch: Partial<PasoRelacionInputCreateDto>;
}
interface PasoDraft {
  metadata?: MetadataPatch;
  position?: { x: number; y: number };
  groupApprovalId?: number | null; // null => delete
  inputs: {
    created: Array<PasoRelacionInputCreateDto & { _tmpId: string }>;
    updated: DraftInputUpdate[];
    deleted: number[];
  };
}

interface BpmState {
  flujosActivos: FlujoActivo[];
  pasosPorFlujo: { [key: number]: PasoSolicitud[] };
  caminosPorFlujo: { [key: number]: CaminoParalelo[] };
  loading: boolean;
  error: string | null;
  flujoSeleccionado: number | null;
  deleting: boolean;
  lastActionError: string | null;
  draftsByPasoId: Record<number, PasoDraft>;
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
  draftsByPasoId: {},
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
// (types moved above for reuse)

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

// ensure a draft exists for pasoId
function ensureDraft(state: BpmState, pasoId: number): PasoDraft {
  if (!state.draftsByPasoId[pasoId]) {
    state.draftsByPasoId[pasoId] = { inputs: { created: [], updated: [], deleted: [] } };
  }
  return state.draftsByPasoId[pasoId];
}

const bpmSlice = createSlice({
  name: 'bpm',
  initialState,
  reducers: {
    setFlujoSeleccionado: (state, action: PayloadAction<number | null>) => {
      state.flujoSeleccionado = action.payload;
    },
    stagePasoMetadata: (state, action: PayloadAction<{ pasoId: number; patch: MetadataPatch }>) => {
      const { pasoId, patch } = action.payload;
      const draft = ensureDraft(state, pasoId);
      draft.metadata = { ...(draft.metadata || {}), ...patch };
    },
    stagePosition: (state, action: PayloadAction<{ pasoId: number; x: number; y: number }>) => {
      const { pasoId, x, y } = action.payload;
      const draft = ensureDraft(state, pasoId);
      draft.position = { x, y };
    },
    stageGroupApproval: (state, action: PayloadAction<{ pasoId: number; groupId: number | null }>) => {
      const { pasoId, groupId } = action.payload;
      const draft = ensureDraft(state, pasoId);
      draft.groupApprovalId = groupId;
    },
    stageInputAdd: (state, action: PayloadAction<{ pasoId: number; input: PasoRelacionInputCreateDto; tmpId?: string }>) => {
      const { pasoId, input, tmpId: providedTmp } = action.payload;
      const draft = ensureDraft(state, pasoId);
      const tmpId = providedTmp || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      draft.inputs.created.push({ ...input, _tmpId: tmpId });
    },
    stageInputCreateUpdate: (state, action: PayloadAction<{ pasoId: number; tmpId: string; patch: Partial<PasoRelacionInputCreateDto> }>) => {
      const { pasoId, tmpId, patch } = action.payload;
      const draft = ensureDraft(state, pasoId);
      const idx = draft.inputs.created.findIndex(c => c._tmpId === tmpId);
      if (idx >= 0) {
        draft.inputs.created[idx] = { ...draft.inputs.created[idx], ...patch };
      }
    },
    stageInputUpdate: (state, action: PayloadAction<{ pasoId: number; relationId: number; patch: Partial<PasoRelacionInputCreateDto> }>) => {
      const { pasoId, relationId, patch } = action.payload;
      const draft = ensureDraft(state, pasoId);
      const existing = draft.inputs.updated.find(u => u.id === relationId);
      if (existing) existing.patch = { ...existing.patch, ...patch };
      else draft.inputs.updated.push({ id: relationId, patch });
    },
    stageInputDelete: (state, action: PayloadAction<{ pasoId: number; relationId?: number; tmpId?: string }>) => {
      const { pasoId, relationId, tmpId } = action.payload;
      const draft = ensureDraft(state, pasoId);
      if (typeof relationId === 'number') {
        if (!draft.inputs.deleted.includes(relationId)) draft.inputs.deleted.push(relationId);
        draft.inputs.updated = draft.inputs.updated.filter(u => u.id !== relationId);
      } else if (tmpId) {
        draft.inputs.created = draft.inputs.created.filter(c => c._tmpId !== tmpId);
      }
    },
    clearPasoDraft: (state, action: PayloadAction<{ pasoId: number }>) => {
      delete state.draftsByPasoId[action.payload.pasoId];
    },
    clearAllDrafts: (state) => {
      state.draftsByPasoId = {};
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

// Selectors for drafts
export const selectPasoDraft = (state: RootState, pasoId: number) => state.bpm.draftsByPasoId?.[pasoId];
// Memoized selectors to prevent unnecessary rerenders
export const selectBpmState = (state: RootState) => state.bpm;

export const selectDirtyPasoIds = createSelector(
  [selectBpmState],
  (bpmState) => Object.keys(bpmState.draftsByPasoId || {}).map(Number)
);

export const selectIsAnyDirty = createSelector(
  [selectBpmState],
  (bpmState) => Object.keys(bpmState.draftsByPasoId || {}).length > 0
);

export const selectDraftByPasoId = createSelector(
  [selectBpmState, (_: RootState, pasoId: number) => pasoId],
  (bpmState, pasoId) => bpmState.draftsByPasoId?.[pasoId] || null
);

export const selectHasDraftForPaso = createSelector(
  [selectBpmState, (_: RootState, pasoId: number) => pasoId],
  (bpmState, pasoId) => Boolean(bpmState.draftsByPasoId?.[pasoId])
);

// Save All: commit all staged paso drafts
export const commitAllPasoDrafts = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
  'bpm/commitAllPasoDrafts',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const pasoIds = Object.keys(state.bpm.draftsByPasoId).map(Number);
    if (pasoIds.length === 0) return;
    try {
      for (const pasoId of pasoIds) {
        const draft = state.bpm.draftsByPasoId[pasoId];
        // Paso metadata/position
        const body: Record<string, unknown> = {};
        if (draft?.metadata) Object.assign(body, draft.metadata);
        if (draft?.position) {
          body['PosX'] = Math.round(draft.position.x);
          body['PosY'] = Math.round(draft.position.y);
        }
        if (Object.keys(body).length > 0) {
          await api.put(`/api/PasoSolicitud/${pasoId}`, body);
        }
        // Group approval
        if (Object.prototype.hasOwnProperty.call(draft || {}, 'groupApprovalId')) {
          const groupId = draft?.groupApprovalId ?? null;
          if (groupId === null) {
            await api.delete(`/api/PasoSolicitud/${pasoId}/grupoaprobacion`);
          } else if (typeof groupId === 'number') {
            await api.post(`/api/PasoSolicitud/${pasoId}/grupoaprobacion`, { GrupoAprobacionId: groupId });
          }
        }
        // Inputs create -> update -> delete
        if (draft?.inputs?.created?.length) {
          for (const c of draft.inputs.created) {
            try {
              const { _tmpId, ...payload } = c as typeof c & { _tmpId?: string };
              await api.post(`/api/PasoSolicitud/${pasoId}/inputs`, payload);
            } catch (err: unknown) {
              const e = err as { response?: { status?: number; data?: unknown } };
              const serverMsg = String(e?.response?.data as string ?? '');
              if (!(e?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected')))) {
                throw err;
              }
            }
          }
        }
        if (draft?.inputs?.updated?.length) {
          for (const u of draft.inputs.updated) {
            try {
              await api.put(`/api/PasoSolicitud/${pasoId}/inputs/${u.id}`, u.patch);
            } catch (err: unknown) {
              const e = err as { response?: { status?: number; data?: unknown } };
              const serverMsg = String(e?.response?.data as string ?? '');
              if (!(e?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected')))) {
                throw err;
              }
            }
          }
        }
        if (draft?.inputs?.deleted?.length) {
          for (const d of draft.inputs.deleted) {
            try {
              await api.delete(`/api/PasoSolicitud/${pasoId}/inputs/${d}`);
            } catch (err: unknown) {
              const e = err as { response?: { status?: number; data?: unknown } };
              const serverMsg = String(e?.response?.data as string ?? '');
              if (!(e?.response?.status === 500 && (serverMsg.includes('possible object cycle') || serverMsg.includes('SerializerCycleDetected')))) {
                throw err;
              }
            }
          }
        }
      }
      const flujoId = getState().bpm.flujoSeleccionado;
      dispatch(clearAllDrafts());
      if (flujoId) await dispatch(fetchPasosYConexiones(flujoId));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error guardando cambios';
      return rejectWithValue(msg);
    }
  }
);

export const { setFlujoSeleccionado, stagePasoMetadata, stagePosition, stageGroupApproval, stageInputAdd, stageInputCreateUpdate, stageInputUpdate, stageInputDelete, clearPasoDraft, clearAllDrafts } = bpmSlice.actions;
export default bpmSlice.reducer;