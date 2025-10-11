import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { normalizeTipoInput, TipoInput } from '@/types/bpm/inputs';
import api from '@/services/api';

// Basic relation shape (runtime normalized)
export interface PasoExecutionRelation {
  id: number;
  inputId: number;
  nombre: string;
  requerido: boolean;
  placeHolder?: string | null;
  valor: string; // normalized rawValue string (empty string if none)
  tipo_input?: string; // agregado: tipo real (textoCorto, date, number, archivo...)
  opciones?: string[]; // agregado para combobox/multiplecheckbox
}

export interface PasoExecutionDraft {
  rawValue: string;
  dirty: boolean;
  saving: boolean;
  error?: string;
  lastSavedValue?: string; // for change detection / revert
}

interface CreatingRelationTemp {
  inputId: number;
  nombre?: string;
  requerido?: boolean;
  placeHolder?: string | null;
  rawValue: string;
  status: 'idle' | 'saving' | 'error' | 'created';
  relationId?: number;
  error?: string;
}

interface PasoExecutionState {
  loading: boolean;
  error: string | null;
  relations: Record<number, PasoExecutionRelation>; // relationId -> relation
  drafts: Record<number, PasoExecutionDraft>; // relationId -> draft
  creating: Record<string, CreatingRelationTemp>; // tempId -> creating entry
  pendingFlush: number[]; // relationIds queued for flush
  lastFetchedAt?: string;
  flushInProgress: boolean;
  executing: boolean;
}

export interface ExecutionInputsState {
  byPasoId: Record<number, PasoExecutionState>;
}

const initialPasoState: PasoExecutionState = {
  loading: false,
  error: null,
  relations: {},
  drafts: {},
  creating: {},
  pendingFlush: [],
  flushInProgress: false,
  executing: false,
};

const initialState: ExecutionInputsState = {
  byPasoId: {},
};

// Utility ensure container
const ensurePaso = (state: ExecutionInputsState, pasoId: number): PasoExecutionState => {
  if (!state.byPasoId[pasoId]) {
    state.byPasoId[pasoId] = { ...initialPasoState };
  }
  return state.byPasoId[pasoId];
};

// --- Validation helpers ---
export interface ValidacionCampoContext {
  tipo?: TipoInput; // may be inferred from catalog later
  requerido: boolean;
  rawValue: string;
}

export const validateRawValue = ({ tipo, requerido, rawValue }: ValidacionCampoContext): string | undefined => {
  const trimmed = (rawValue ?? '').toString();
  if (requerido && !trimmed.trim()) return 'Campo requerido';
  if (!trimmed) return undefined; // non-required empty already handled above
  const t = tipo ? normalizeTipoInput(tipo) : 'textocorto';
  switch (t) {
    case 'number':
      if (Number.isNaN(Number(trimmed))) return 'Número inválido';
      break;
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return 'Fecha inválida (YYYY-MM-DD)';
      break;
    case 'multiplecheckbox':
      try {
        const arr = JSON.parse(trimmed);
        if (!Array.isArray(arr)) return 'Formato inválido';
        if (requerido && arr.length === 0) return 'Seleccione al menos una opción';
      } catch { return 'JSON inválido'; }
      break;
    default:
      break;
  }
  return undefined;
};

// Thunks
export const fetchPasoExecutionRelations = createAsyncThunk< { pasoId: number; relations: PasoExecutionRelation[] }, { pasoId: number; force?: boolean }, { state: RootState; rejectValue: string }>(
  'executionInputs/fetchPasoExecutionRelations',
  async ({ pasoId }, { rejectWithValue }) => {
    try {
      // We expect an endpoint that returns paso detail including relacionesInput.
      // Reuse existing endpoint from bpm flow if available; fallback to generic /api/PasoSolicitud/{id}
      const { data } = await api.get(`/api/PasoSolicitud/${pasoId}`);
      let rawRelations: unknown[] = Array.isArray(data?.relacionesInput) ? data.relacionesInput : (Array.isArray(data?.RelacionesInput) ? data.RelacionesInput : []);
      // Fallback: usar nuevo endpoint dedicado si no hubo relaciones en el detalle
      if (!rawRelations || rawRelations.length === 0) {
        try {
          const alt = await api.get(`/api/pasosolicitudes/${pasoId}/inputs`); // nuevo endpoint proporcionado
          if (Array.isArray(alt.data)) {
            rawRelations = alt.data;
            console.log('[executionInputs] Usando endpoint alterno /api/pasosolicitudes/{id}/inputs para paso', pasoId, rawRelations);
          }
        } catch (e) {
          // Ignorar; se manejará vacío abajo
          console.warn('[executionInputs] Fallback inputs endpoint falló', e);
        }
      }
      const mapped: PasoExecutionRelation[] = rawRelations.map((raw) => {
        const r = raw as Record<string, unknown>;
        const idCandidate = (r['idRelacion'] ?? r['IdRelacion'] ?? r['id_relacion'] ?? r['id_relacion'] ?? r['id'] ?? r['IdRelacionInput']);
        const id = typeof idCandidate === 'number' ? idCandidate : 0;
        const valorObj = r['valor'] ?? r['Valor'];
        const valor = (() => {
          if (valorObj && typeof valorObj === 'object' && 'RawValue' in (valorObj as Record<string, unknown>)) {
            return String((valorObj as Record<string, unknown>)['RawValue'] ?? '');
          }
          return String(valorObj ?? '');
        })();
        const tipoInput = (r['tipo_input'] ?? r['tipoInput'] ?? r['tipo'] ?? '') as string;
        let opciones: string[] | undefined;
        const rawOpciones = r['opciones'] ?? r['Opciones'] ?? r['options'];
        if (Array.isArray(rawOpciones)) {
          opciones = rawOpciones.filter(o => typeof o === 'string') as string[];
        }
        return {
          id,
          inputId: (r['inputId'] ?? r['InputId'] ?? r['input_id'] ?? 0) as number,
          nombre: String(r['nombre'] ?? r['Nombre'] ?? r['etiqueta'] ?? ''),
          requerido: Boolean(r['requerido'] ?? r['Requerido'] ?? r['es_requerido'] ?? false),
          placeHolder: (r['placeHolder'] ?? r['PlaceHolder'] ?? r['placeholder'] ?? null) as string | null,
          valor,
          tipo_input: typeof tipoInput === 'string' ? tipoInput : undefined,
          opciones,
        } as PasoExecutionRelation;
      }).filter(r => r.id !== 0);
      
      return { pasoId, relations: mapped };
    } catch (e: unknown) {
      return rejectWithValue('Error cargando campos de ejecución del paso');
    }
  }
);

interface RootStateWithExec extends RootState { executionInputs: ExecutionInputsState }

export const flushPasoDrafts = createAsyncThunk< { pasoId: number; updated: number[] }, { pasoId: number }, { state: RootStateWithExec; rejectValue: string }>(
  'executionInputs/flushPasoDrafts',
  async ({ pasoId }, { getState, rejectWithValue }) => {
  const root = getState();
  const st = root.executionInputs?.byPasoId[pasoId];
    if (!st) return { pasoId, updated: [] };
    const relationIds = st.pendingFlush.slice();
    const updated: number[] = [];
    for (const rid of relationIds) {
      const rel = st.relations[rid];
      const draft = st.drafts[rid];
      if (!rel || !draft || !draft.dirty) continue;
      try {
        await api.put(`/api/PasoSolicitud/${pasoId}/inputs/${rid}`, { Valor: { RawValue: draft.rawValue } });
        updated.push(rid);
      } catch (e: unknown) {
        // Attach error onto draft (handled in reducer via rejected case)
        return rejectWithValue('Error guardando cambios de campos');
      }
    }
    return { pasoId, updated };
  }
);

// Slice
const executionInputsSlice = createSlice({
  name: 'executionInputs',
  initialState,
  reducers: {
    upsertDraft: (state, action: PayloadAction<{ pasoId: number; relationId: number; rawValue: string; tipoInput?: string }>) => {
      const { pasoId, relationId, rawValue, tipoInput } = action.payload;
      const paso = ensurePaso(state, pasoId);
      const rel = paso.relations[relationId];
      const existing = paso.drafts[relationId];
      if (!existing) {
        paso.drafts[relationId] = {
          rawValue,
          dirty: rel ? rel.valor !== rawValue : true,
          saving: false,
          lastSavedValue: rel?.valor ?? '',
          error: validateRawValue({ tipo: (tipoInput as TipoInput) || undefined, requerido: rel?.requerido || false, rawValue })
        };
      } else {
        existing.rawValue = rawValue;
        existing.dirty = existing.lastSavedValue !== rawValue;
        existing.error = validateRawValue({ tipo: (tipoInput as TipoInput) || undefined, requerido: rel?.requerido || false, rawValue });
      }
      if (!paso.pendingFlush.includes(relationId)) paso.pendingFlush.push(relationId);
    },
    validateDraft: (state, action: PayloadAction<{ pasoId: number; relationId: number; tipoInput?: string }>) => {
      const { pasoId, relationId, tipoInput } = action.payload;
      const paso = ensurePaso(state, pasoId);
      const rel = paso.relations[relationId];
      const draft = paso.drafts[relationId];
      if (!rel || !draft) return;
      draft.error = validateRawValue({ tipo: (tipoInput as TipoInput) || undefined, requerido: rel.requerido, rawValue: draft.rawValue });
    },
    enqueueForFlush: (state, action: PayloadAction<{ pasoId: number; relationId: number }>) => {
      const { pasoId, relationId } = action.payload;
      const paso = ensurePaso(state, pasoId);
      if (!paso.pendingFlush.includes(relationId)) paso.pendingFlush.push(relationId);
    },
    clearPasoExecutionState: (state, action: PayloadAction<{ pasoId: number }>) => {
      delete state.byPasoId[action.payload.pasoId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPasoExecutionRelations.pending, (state, action) => {
        const paso = ensurePaso(state, action.meta.arg.pasoId);
        paso.loading = true; paso.error = null;
      })
      .addCase(fetchPasoExecutionRelations.fulfilled, (state, action) => {
        const { pasoId, relations } = action.payload;
        const paso = ensurePaso(state, pasoId);
        paso.loading = false; paso.error = null; paso.relations = {};
        relations.forEach(r => { paso.relations[r.id] = r; });
        // Clean drafts referencing removed relations
        Object.keys(paso.drafts).forEach(idStr => { const id = Number(idStr); if (!paso.relations[id]) delete paso.drafts[id]; });
        paso.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchPasoExecutionRelations.rejected, (state, action) => {
        const pasoId = action.meta.arg.pasoId;
        const paso = ensurePaso(state, pasoId);
        paso.loading = false; paso.error = action.payload as string || 'Error';
      })
      .addCase(flushPasoDrafts.pending, (state, action) => {
        const pasoId = action.meta.arg.pasoId;
        const paso = ensurePaso(state, pasoId);
        paso.flushInProgress = true;
        // Mark saving
        paso.pendingFlush.forEach(rid => { const d = paso.drafts[rid]; if (d && d.dirty) d.saving = true; });
      })
      .addCase(flushPasoDrafts.fulfilled, (state, action) => {
        const { pasoId, updated } = action.payload;
        const paso = ensurePaso(state, pasoId);
        updated.forEach(rid => {
          const draft = paso.drafts[rid];
          const rel = paso.relations[rid];
          if (draft && rel) {
            rel.valor = draft.rawValue;
            draft.lastSavedValue = draft.rawValue;
            draft.dirty = false;
            draft.saving = false;
            draft.error = undefined;
          }
        });
        // Remove flushed from queue
        paso.pendingFlush = paso.pendingFlush.filter(rid => !updated.includes(rid));
        paso.flushInProgress = false;
      })
      .addCase(flushPasoDrafts.rejected, (state, action) => {
        const pasoId = action.meta.arg.pasoId;
        const paso = ensurePaso(state, pasoId);
        paso.flushInProgress = false;
        // Mark all pending as error (simplistic first pass)
        paso.pendingFlush.forEach(rid => { const d = paso.drafts[rid]; if (d) { d.saving = false; d.error = action.payload as string || 'Error guardando'; } });
      });
  }
});

export const { upsertDraft, enqueueForFlush, clearPasoExecutionState } = executionInputsSlice.actions;
export default executionInputsSlice.reducer;

// Selectors
export const selectExecutionPaso = (state: RootState & { executionInputs?: ExecutionInputsState }, pasoId: number) => state.executionInputs?.byPasoId[pasoId];
export const selectCanExecutePaso = (state: RootState & { executionInputs?: ExecutionInputsState }, pasoId: number) => {
  const paso = state.executionInputs?.byPasoId[pasoId];
  if (!paso) return false;
  if (paso.flushInProgress) return false;
  const relations = Object.values(paso.relations) as PasoExecutionRelation[];
  const drafts = Object.values(paso.drafts) as PasoExecutionDraft[];
  const missing = relations.filter(r => r.requerido && !((paso.drafts[r.id]?.rawValue ?? r.valor)?.toString().trim()));
  return missing.length === 0 && !drafts.some(d => d.error) && !drafts.some(d => d.saving);
};
