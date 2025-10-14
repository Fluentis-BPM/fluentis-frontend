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
      // Accept YYYY-MM-DD or full ISO strings; fallback to Date.parse
      if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmed)) {
        const d = Date.parse(trimmed);
        if (Number.isNaN(d)) return 'Fecha inválida';
      }
      break;
    case 'multiplecheckbox':
      try {
        const arr = JSON.parse(trimmed);
        if (!Array.isArray(arr)) return 'Formato inválido';
        if (requerido && arr.length === 0) return 'Seleccione al menos una opción';
      } catch { return 'JSON inválido'; }
      break;
    case 'archivo':
      try {
        const obj = JSON.parse(trimmed);
        if (requerido && (!obj || typeof obj !== 'object')) return 'Archivo requerido';
      } catch { return 'Formato de archivo inválido'; }
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
      const isDev = typeof import.meta !== 'undefined' && !!((import.meta as unknown as { env?: Record<string, unknown> }).env?.DEV);
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
      // Intentar obtener un mapa idInput -> tipo desde el catálogo
      let inputTypeMap: Record<number, string> = {};
      let inputOptionsMap: Record<number, string[]> = {};
      try {
        const cat = await api.get('/api/inputs');
        const arr: unknown[] = Array.isArray(cat.data) ? cat.data : [];
        inputTypeMap = arr.reduce<Record<number, string>>((acc, it) => {
          const o = it as Record<string, unknown>;
          const id = Number(o['idInput'] ?? o['IdInput'] ?? o['id_input'] ?? 0);
          const tipo = String(o['tipoInput'] ?? o['TipoInput'] ?? o['tipo_input'] ?? '');
          if (id && tipo) acc[id] = tipo;
          return acc;
        }, {});
        inputOptionsMap = arr.reduce<Record<number, string[]>>((acc, it) => {
          const o = it as Record<string, unknown>;
          const id = Number(o['idInput'] ?? o['IdInput'] ?? o['id_input'] ?? 0);
          let opts = o['opciones'] ?? o['Opciones'] ?? o['options'];
          if (!opts) opts = o['OpcionesJson'] ?? o['opcionesJson'] ?? o['OptionsJson'] ?? o['optionsJson'];
          let list: string[] | undefined;
          if (Array.isArray(opts)) {
            list = (opts as unknown[]).filter(x => typeof x === 'string') as string[];
          } else if (typeof opts === 'string') {
            // try JSON first, then delimiters
            const s = opts as string;
            try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) list = parsed.filter(x => typeof x === 'string'); } catch { /* noop */ }
            if (!list) {
              const sep = s.includes(';') ? ';' : (s.includes('|') ? '|' : (s.includes(',') ? ',' : null));
              if (sep) list = s.split(sep).map(x => x.trim()).filter(Boolean);
            }
          }
          if (id && list && list.length) acc[id] = list;
          return acc;
        }, {});
      } catch {/* opcional */}

      let mapped: PasoExecutionRelation[] = rawRelations.map((raw) => {
        const r = raw as Record<string, unknown>;
        const idCandidate = (r['idRelacion'] ?? r['IdRelacion'] ?? r['id_relacion'] ?? r['id_relacion'] ?? r['id'] ?? r['IdRelacionInput']);
        const id = typeof idCandidate === 'number' ? idCandidate : 0;
  const valorObj = r['valor'] ?? r['Valor'] ?? r['InputValue'];
  // Derivar valor plano (RawValue) y metadatos de tipo/opciones desde objeto anidado si existe
  let valor: string = '';
  const tipoInputFromRelation: string | undefined = (r['tipo_input'] ?? r['tipoInput'] ?? r['tipo'] ?? undefined) as string | undefined;
  let tipoInputFromValor: string | undefined;
  let tipoInputFromMeta: string | undefined;
  let opciones: string[] | undefined;
        if (valorObj && typeof valorObj === 'object') {
          const vrec = valorObj as Record<string, unknown>;
          // RawValue
          if ('RawValue' in vrec) {
            valor = String(vrec['RawValue'] ?? '');
          }
          // TipoInput puede venir como PascalCase (e.g., RadioGroup)
          tipoInputFromValor = (vrec['tipoInput'] ?? vrec['TipoInput']) as string | undefined;
          // Opciones puede venir como arreglo o string JSON
          let nestedOpts = vrec['Options'] ?? vrec['Opciones'];
          if (!nestedOpts) nestedOpts = vrec['options'];
          if (Array.isArray(nestedOpts)) {
            opciones = (nestedOpts as unknown[]).filter(o => typeof o === 'string') as string[];
          } else if (typeof nestedOpts === 'string') {
            try {
              const parsed = JSON.parse(nestedOpts);
              if (Array.isArray(parsed)) opciones = parsed.filter(o => typeof o === 'string');
            } catch { /* ignore */ }
          }
        } else {
          valor = String(valorObj ?? '');
        }
  // También intentar leer tipo/opciones desde r.input (metadata del catálogo)
        const inputMeta = r['input'];
        if (inputMeta && typeof inputMeta === 'object') {
          const im = inputMeta as Record<string, unknown>;
          // Preferir tipo desde input meta (normalizado en interceptor como tipo_input_front)
          const metaTipo = (im['tipo_input_front'] ?? im['tipo_input'] ?? im['tipoInput'] ?? im['TipoInput']) as string | undefined;
          if (typeof metaTipo === 'string') tipoInputFromMeta = metaTipo;
          // Fallback opciones desde input meta
          if (!opciones) {
            const imOpts = im['opciones'] ?? im['Opciones'] ?? im['options'];
            if (Array.isArray(imOpts)) {
              opciones = (imOpts as unknown[]).filter(o => typeof o === 'string') as string[];
            } else if (typeof imOpts === 'string') {
              try {
                const parsed = JSON.parse(String(imOpts));
                if (Array.isArray(parsed)) opciones = parsed.filter(o => typeof o === 'string');
              } catch { /* ignore */ }
            }
          }
        }
        // Leer opciones nivel relación si vienen como arreglo directo (algunos endpoints ya las devuelven así)
        if (!opciones) {
          const topArr = (r['opciones'] ?? r['Opciones'] ?? r['options']) as unknown;
          if (Array.isArray(topArr)) {
            opciones = (topArr as unknown[]).filter(o => typeof o === 'string') as string[];
          }
        }
        // Intentar leer JSON desde placeholder como último recurso legacy
        if (!opciones) {
          const ph = (r['placeHolder'] ?? r['PlaceHolder'] ?? r['placeholder']) as string | undefined;
          if (typeof ph === 'string' && ph.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(ph);
              if (Array.isArray(parsed)) opciones = parsed.filter(o => typeof o === 'string');
            } catch {/* ignore */}
          }
        }
  // Resolver mejor tipo con precedencia: meta > catálogo por inputId > valor > relation field
  const inputIdResolved = Number(r['inputId'] ?? r['InputId'] ?? r['input_id'] ?? 0);
  const tipoFromCatalog = inputIdResolved ? inputTypeMap[inputIdResolved] : undefined;
  let rawTipo = tipoInputFromMeta || tipoFromCatalog || tipoInputFromValor || tipoInputFromRelation;
        // Heurísticas: si no tenemos tipo, inferir por forma del valor/opciones
        if (!rawTipo) {
          try {
            const parsed = valor ? JSON.parse(valor) : undefined;
            if (Array.isArray(parsed)) rawTipo = 'MultipleCheckbox';
            else if (parsed && typeof parsed === 'object') {
              const keys = Object.keys(parsed as Record<string, unknown>);
              if (keys.some(k => ['fileId', 'fileName', 'provider', 'directLink'].includes(k))) rawTipo = 'Archivo';
            }
          } catch {/* ignore */}
        }
    if (!rawTipo && opciones && opciones.length > 0) rawTipo = 'Combobox';
  if (!rawTipo && valor && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(valor)) rawTipo = 'Date';
  if (!rawTipo && valor && !isNaN(Number(valor))) rawTipo = 'Number';
  // Catálogo ya considerado en la precedencia anterior
  // Normalizar valor por tipo conocido (para evitar estados inválidos en UI)
  let inferredTipo = rawTipo ? normalizeTipoInput(String(rawTipo)) : undefined;
        if (inferredTipo === 'multiplecheckbox') {
          try {
            const arr = JSON.parse(valor);
            if (!Array.isArray(arr)) valor = '[]';
          } catch { valor = '[]'; }
        }
        if (inferredTipo === 'archivo') {
          if (valor && valor.trim()) {
            try { JSON.parse(valor); } catch { valor = ''; }
          }
        }
        // Si aún hay ambigüedad, aplicar heurísticas por nombre del campo
        const nombreStr = String(r['nombre'] ?? r['Nombre'] ?? r['etiqueta'] ?? '').toLowerCase();
        let heuristicApplied: string | undefined;
        if (inferredTipo === 'number' && nombreStr.includes('archivo')) { inferredTipo = 'archivo'; heuristicApplied = 'nombre→archivo'; }
        if (inferredTipo === 'multiplecheckbox' && (nombreStr.includes('fecha') || nombreStr.includes('date'))) { inferredTipo = 'date'; heuristicApplied = 'nombre→date'; }
        // Detectar números por nombre/valor cuando el catálogo falla (presupuesto, precio, monto, cantidad, total, número)
        const numberHints = ['presupuesto','precio','monto','cantidad','total','numero','número','importe','costo','coste'];
        const seemsNumeric = valor && !isNaN(Number(valor));
        if ((!inferredTipo || ['textocorto','textolargo','date'].includes(inferredTipo)) && (numberHints.some(h => nombreStr.includes(h)) || seemsNumeric)) {
          inferredTipo = 'number'; heuristicApplied = (heuristicApplied ? heuristicApplied + '+' : '') + 'nombre/valor→number';
        }
        // Si hay opciones pero el tipo quedó en date/number/texto, corrígelo a un tipo basado en opciones
        if (opciones && opciones.length > 0 && (!inferredTipo || ['textocorto','textolargo','date','number'].includes(inferredTipo))) {
          let looksArray = false;
          try { const pv = valor ? JSON.parse(valor) : undefined; looksArray = Array.isArray(pv); } catch { /* noop */ }
          if (looksArray || nombreStr.includes('múltiple') || nombreStr.includes('multip') || nombreStr.includes('multiple')) {
            inferredTipo = 'multiplecheckbox'; heuristicApplied = (heuristicApplied ? heuristicApplied + '+' : '') + 'opciones→multiplecheckbox';
          } else if (nombreStr.includes('radio') || (tipoInputFromRelation === 'radiogroup')) {
            inferredTipo = 'radiogroup'; heuristicApplied = (heuristicApplied ? heuristicApplied + '+' : '') + 'opciones→radiogroup';
          } else {
            inferredTipo = 'combobox'; heuristicApplied = (heuristicApplied ? heuristicApplied + '+' : '') + 'opciones→combobox';
          }
        }
        // Último fallback de opciones por catálogo
        if (!opciones && inputIdResolved && inputOptionsMap[inputIdResolved]) {
          opciones = inputOptionsMap[inputIdResolved];
        }
        // Fallback para opciones en string JSON a nivel de relación (OpcionesJson/optionsJson)
        if (!opciones) {
          const j = (r['OpcionesJson'] ?? r['opcionesJson'] ?? r['OptionsJson'] ?? r['optionsJson']) as string | undefined;
          if (typeof j === 'string' && j.trim()) {
            try {
              const parsed = JSON.parse(j);
              if (Array.isArray(parsed)) opciones = parsed.filter(o => typeof o === 'string');
            } catch {/* ignore */}
          }
        }
        // Fallback adicional: si hay 'opciones' como string con separadores comunes
        if (!opciones) {
          const s = (r['opciones'] ?? r['Opciones'] ?? r['options']) as string | undefined;
          if (typeof s === 'string' && s.trim()) {
            const sep = s.includes(';') ? ';' : (s.includes('|') ? '|' : (s.includes(',') ? ',' : null));
            if (sep) {
              opciones = s.split(sep).map(x => x.trim()).filter(Boolean);
            }
          }
        }

        if (isDev) {
          // Consola de diagnóstico para cada relación
          try {
            // Evitar log gigantesco (clonar superficialmente algunas claves)
            const dbg: Record<string, unknown> = {
              id,
              inputId: inputIdResolved,
              nombre: String(r['nombre'] ?? r['Nombre'] ?? r['etiqueta'] ?? ''),
              requerido: Boolean(r['requerido'] ?? r['Requerido'] ?? r['es_requerido'] ?? false),
              fromRelationTipo: tipoInputFromRelation,
              fromValorTipo: tipoInputFromValor,
              fromMetaTipo: tipoInputFromMeta,
              resolvedRawTipo: rawTipo,
              normalizedTipo: inferredTipo,
              opcionesCount: opciones?.length ?? 0,
              catalogTipo: inputIdResolved ? inputTypeMap[inputIdResolved] : undefined,
              precedence: ['meta','catalog','valor','relacion'],
              heuristicApplied,
            };
            // Peek minimal valor info
            let valorShape: string = 'empty';
            if (valor && valor.trim()) {
              try {
                const pv = JSON.parse(valor);
                valorShape = Array.isArray(pv) ? `array(${pv.length})` : typeof pv;
              } catch { valorShape = 'string'; }
            }
            dbg['valorShape'] = valorShape;
            console.groupCollapsed(`[execInputs] Relación ${id}`);
            console.log(dbg);
            console.groupEnd();
          } catch {/* ignore logging errors */}
        }
        return {
          id,
          inputId: (r['inputId'] ?? r['InputId'] ?? r['input_id'] ?? 0) as number,
          nombre: String(r['nombre'] ?? r['Nombre'] ?? r['etiqueta'] ?? ''),
          requerido: Boolean(r['requerido'] ?? r['Requerido'] ?? r['es_requerido'] ?? false),
          placeHolder: (r['placeHolder'] ?? r['PlaceHolder'] ?? r['placeholder'] ?? null) as string | null,
          valor,
          tipo_input: inferredTipo,
          opciones,
        } as PasoExecutionRelation;
      }).filter(r => r.id !== 0);
      // Post-procesar: completar opciones consultando /api/inputs/{id} para los que las necesiten
      try {
        const needOptions = mapped.filter(m => {
          const t = m.tipo_input ? normalizeTipoInput(m.tipo_input) : 'textocorto';
          return (!m.opciones || m.opciones.length === 0) && (t === 'combobox' || t === 'multiplecheckbox' || t === 'radiogroup') && m.inputId;
        });
        if (needOptions.length > 0) {
          const uniqIds = Array.from(new Set(needOptions.map(n => n.inputId)));
          const fetched = await Promise.all(uniqIds.map(async (iid) => {
            try { const res = await api.get(`/api/inputs/${iid}`); return { iid, data: res.data }; }
            catch { return { iid, data: null }; }
          }));
          const optsMap: Record<number, string[]> = {};
          for (const f of fetched) {
            const d = f.data as Record<string, unknown> | null;
            if (!d) continue;
            let opts = d['opciones'] ?? d['Opciones'] ?? d['Options'];
            if (!opts) opts = d['OpcionesJson'] ?? d['opcionesJson'] ?? d['OptionsJson'] ?? d['optionsJson'];
            let list: string[] | undefined;
            if (Array.isArray(opts)) list = (opts as unknown[]).filter(x => typeof x === 'string') as string[];
            else if (typeof opts === 'string') {
              const s = opts as string;
              try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) list = parsed.filter(x => typeof x === 'string'); } catch { /* noop */ }
              if (!list) {
                const sep = s.includes(';') ? ';' : (s.includes('|') ? '|' : (s.includes(',') ? ',' : null));
                if (sep) list = s.split(sep).map(x => x.trim()).filter(Boolean);
              }
            }
            if (list && list.length) optsMap[f.iid] = list;
          }
          if (Object.keys(optsMap).length) {
            mapped = mapped.map(m => {
              if ((!m.opciones || m.opciones.length === 0) && m.inputId && optsMap[m.inputId]) {
                const updated = { ...m, opciones: optsMap[m.inputId] };
                if (isDev) {
                  console.log(`[execInputs] Opciones completadas desde /api/inputs/${m.inputId}`, updated.opciones?.length);
                }
                return updated;
              }
              return m;
            });
          }
        }
      } catch {/* ignore */}

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
  const hasValue = (r: PasoExecutionRelation): boolean => {
    const raw = (paso.drafts[r.id]?.rawValue ?? r.valor ?? '').toString();
    const tipo = r.tipo_input ? normalizeTipoInput(r.tipo_input as string) : 'textocorto';
    if (!raw.trim()) return false;
    if (tipo === 'multiplecheckbox') {
      try { const arr = JSON.parse(raw); return Array.isArray(arr) && arr.length > 0; } catch { return false; }
    }
    if (tipo === 'archivo') {
      try { const obj = JSON.parse(raw); return obj && typeof obj === 'object'; } catch { return false; }
    }
    return true;
  };
  const missing = relations.filter(r => r.requerido && !hasValue(r));
  return missing.length === 0 && !drafts.some(d => d.error) && !drafts.some(d => d.saving);
};
