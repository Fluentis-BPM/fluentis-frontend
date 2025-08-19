import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import type { Solicitud } from '@/types/bpm/request';
import type { RelacionInput } from '@/types/bpm/inputs';

// API enums and DTOs
export type EstadoSolicitudApi = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface RelacionInputValorDto { RawValue: string | number | boolean | null }
export interface RelacionInputCreateDto {
  InputId: number;
  Nombre?: string;
  PlaceHolder?: string;
  Valor?: RelacionInputValorDto | null;
  Requerido?: boolean;
}

export interface SolicitudCreateDto {
  SolicitanteId: number;
  FlujoBaseId?: number | null;
  Nombre: string;
  Descripcion?: string;
  Inputs?: RelacionInputCreateDto[];
  GrupoAprobacionId?: number | null;
}

// Mapping helpers
const pick = <T>(obj: Record<string, unknown>, keys: string[], fallback?: T): T | undefined => {
  for (const k of keys) { const v = obj[k]; if (v !== undefined && v !== null) return v as T; }
  return fallback;
};

const estadoApiToUi = (estado?: EstadoSolicitudApi): 'pendiente' | 'aprobado' | 'rechazado' => {
  switch (estado) { case 'Aprobado': return 'aprobado'; case 'Rechazado': return 'rechazado'; default: return 'pendiente'; }
};

const mapInputs = (arr: unknown[]): RelacionInput[] => arr.map((riObj) => {
  const ri = (riObj ?? {}) as Record<string, unknown>;
  const pickRi = <T>(o: Record<string, unknown>, keys: string[], fb?: T): T | undefined => {
    for (const k of keys) { const v = o[k]; if (v !== undefined && v !== null) return v as T; }
    return fb;
  };
  const rawVal = pickRi<string | number | boolean | { RawValue?: string | number | boolean | null }>(ri, ['valor','Valor']);
  const valor = typeof rawVal === 'object' && rawVal && 'RawValue' in rawVal
    ? String((rawVal as { RawValue?: string | number | boolean | null }).RawValue ?? '')
    : String((rawVal as string | number | boolean | undefined) ?? '');
  return {
    id_relacion: pickRi<number>(ri, ['idRelacion','IdRelacion']) ?? Date.now(),
    input_id: pickRi<number>(ri, ['inputId','InputId'], 0)!,
    nombre: pickRi<string>(ri, ['nombre','Nombre']),
    valor,
    placeholder: pickRi<string | null>(ri, ['placeHolder','PlaceHolder'], null) ?? null,
    requerido: Boolean(pickRi<boolean>(ri, ['requerido','Requerido'], false)),
    paso_solicitud_id: 0,
  };
});

const mapSolicitud = (sObj: unknown): Solicitud => {
  const s = (sObj ?? {}) as Record<string, unknown>;
  const id = pick<number>(s, ['idSolicitud', 'IdSolicitud']) ?? Date.now();
  const fecha = pick<string>(s, ['fechaCreacion', 'FechaCreacion']);
  // Try multiple shapes for grupo id
  let grupoAprobacionId = pick<number>(s, ['grupoAprobacionId', 'GrupoAprobacionId', 'grupoId', 'GrupoId', 'grupo_aprobacion_id']);
  if (!grupoAprobacionId) {
    const nested = pick<Record<string, unknown>>(s, ['grupoAprobacion', 'GrupoAprobacion']);
    if (nested) {
      grupoAprobacionId = pick<number>(nested, ['idGrupo', 'IdGrupo', 'id', 'Id']);
    }
  }
  const inputsArr = (pick<unknown[]>(s, ['inputs','Inputs'], []) || []) as unknown[];
  const gruposApi = (pick<unknown[]>(s, ['gruposAprobacion','GruposAprobacion'], []) || []) as unknown[];
  const grupos_aprobacion = gruposApi.map((g) => {
    const go = (g ?? {}) as Record<string, unknown>;
    const decisionesApi = (pick<unknown[]>(go, ['decisiones','Decisiones'], []) || []) as unknown[];
    return {
      id_relacion: pick<number>(go, ['idRelacion','IdRelacion']) ?? 0,
      grupo_aprobacion_id: pick<number>(go, ['grupoAprobacionId','GrupoAprobacionId']) ?? 0,
      paso_solicitud_id: pick<number | null>(go, ['pasoSolicitudId','PasoSolicitudId']) ?? null,
      solicitud_id: pick<number | null>(go, ['solicitudId','SolicitudId']) ?? null,
      decisiones: decisionesApi.map((d) => {
        const dd = (d ?? {}) as Record<string, unknown>;
        const raw = pick<boolean | null>(dd, ['decision','Decision']);
        const decision: 'si' | 'no' | null = raw === true ? 'si' : raw === false ? 'no' : null;
        return {
          id_relacion: pick<number>(dd, ['idRelacion','IdRelacion']) ?? 0,
          id_usuario: pick<number>(dd, ['idUsuario','IdUsuario']) ?? 0,
          decision,
          fecha_decision: pick<string>(dd, ['fechaDecision','FechaDecision'])
        };
      })
    };
  });
  // If no top-level group id, fall back to the first relation's group id
  if (!grupoAprobacionId && Array.isArray(grupos_aprobacion) && grupos_aprobacion.length > 0) {
    const first = grupos_aprobacion[0];
    if (first && typeof first.grupo_aprobacion_id === 'number' && first.grupo_aprobacion_id > 0) {
      grupoAprobacionId = first.grupo_aprobacion_id;
    }
  }
  return {
    id_solicitud: id,
    solicitante_id: (pick<number>(s, ['solicitanteId', 'SolicitanteId']) ?? 0),
    fecha_creacion: fecha ? new Date(fecha) : new Date(),
    flujo_base_id: pick<number>(s, ['flujoBaseId', 'FlujoBaseId']),
    estado: estadoApiToUi(pick<EstadoSolicitudApi>(s, ['estado', 'Estado'])),
    nombre: pick<string>(s, ['nombre', 'Nombre']),
    descripcion: pick<string>(s, ['descripcion', 'Descripcion']),
    solicitante: (() => { const u = pick<Record<string, unknown>>(s, ['solicitante','Solicitante']); return u ? { idUsuario: pick<number>(u, ['idUsuario','IdUsuario']) ?? 0, nombre: pick<string>(u, ['nombre','Nombre']) ?? '', email: pick<string>(u, ['email','Email']) ?? '' } : undefined; })(),
    grupos_aprobacion,
    datos_adicionales: { nombre: pick<string>(s, ['nombre', 'Nombre']), descripcion: pick<string>(s, ['descripcion', 'Descripcion']) },
    campos_dinamicos: mapInputs(inputsArr),
    grupo_aprobacion_id: grupoAprobacionId,
    estado_texto: estadoApiToUi(pick<EstadoSolicitudApi>(s, ['estado', 'Estado'])),
    dias_transcurridos: 0,
  };
};

// Thunks
export const fetchSolicitudes = createAsyncThunk<Solicitud[], void, { rejectValue: string }>(
  'solicitudes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/solicitudes');
      const arr: unknown[] = Array.isArray(data) ? data : [];
      return arr.map(mapSolicitud);
    } catch (e: unknown) {
      return rejectWithValue('Error al cargar solicitudes: ' + (e as Error).message);
    }
  }
);

export const createSolicitud = createAsyncThunk<Solicitud, SolicitudCreateDto, { rejectValue: string }>(
  'solicitudes/create',
  async (dto, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/solicitudes', dto);
      return mapSolicitud(data);
    } catch (e: unknown) {
      return rejectWithValue('Error al crear solicitud: ' + (e as Error).message);
    }
  }
);

export const updateSolicitudEstado = createAsyncThunk<{ id: number; estado: EstadoSolicitudApi }, { id: number; estado: EstadoSolicitudApi }, { rejectValue: string }>(
  'solicitudes/updateEstado',
  async ({ id, estado }, { rejectWithValue }) => {
    try {
  // Backend expects SolicitudUpdateDto with IdSolicitud and Estado
  await api.put(`/api/solicitudes/${id}`, { IdSolicitud: id, Estado: estado });
      return { id, estado };
    } catch (e: unknown) {
      return rejectWithValue('Error al actualizar solicitud: ' + (e as Error).message);
    }
  }
);

export const addGrupoAprobacion = createAsyncThunk<unknown, { id: number; grupoAprobacionId: number }, { rejectValue: string }>(
  'solicitudes/addGrupoAprobacion',
  async ({ id, grupoAprobacionId }, { rejectWithValue }) => {
    try {
  // Backend expects RelacionGrupoAprobacionCreateDto
  const { data } = await api.post(`/api/solicitudes/${id}/grupos-aprobacion`, { GrupoAprobacionId: grupoAprobacionId });
      return data;
    } catch (e: unknown) {
      return rejectWithValue('Error al asociar grupo: ' + (e as Error).message);
    }
  }
);

export const addInput = createAsyncThunk<unknown, { id: number; input: RelacionInputCreateDto }, { rejectValue: string }>(
  'solicitudes/addInput',
  async ({ id, input }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/solicitudes/${id}/inputs`, input);
      return data;
    } catch (e: unknown) {
      return rejectWithValue('Error al agregar input: ' + (e as Error).message);
    }
  }
);

export const updateInput = createAsyncThunk<unknown, { id: number; inputId: number; input: Partial<RelacionInputCreateDto> & { Valor?: RelacionInputValorDto | null } }, { rejectValue: string }>(
  'solicitudes/updateInput',
  async ({ id, inputId, input }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/solicitudes/${id}/inputs/${inputId}`, input);
      return data;
    } catch (e: unknown) {
      return rejectWithValue('Error al actualizar input: ' + (e as Error).message);
    }
  }
);

export const addDecision = createAsyncThunk<{ DecisionId: number; EstadoActual: EstadoSolicitudApi; TodosVotaron: boolean }, { id: number; usuarioId: number; decision: boolean }, { rejectValue: string }>(
  'solicitudes/addDecision',
  async ({ id, usuarioId, decision }, { rejectWithValue }) => {
    try {
  // Backend expects RelacionDecisionUsuarioCreateDto
  const { data } = await api.post(`/api/solicitudes/${id}/decision`, { IdUsuario: usuarioId, Decision: decision });
      return data;
    } catch (e: unknown) {
      return rejectWithValue('Error al registrar decisión: ' + (e as Error).message);
    }
  }
);

// Fetch assigned approval group for a solicitud (best-effort across API shapes)
export const fetchSolicitudGrupo = createAsyncThunk<{ id: number; grupoAprobacionId: number }, { id: number }, { rejectValue: string }>(
  'solicitudes/fetchGrupo',
  async ({ id }, { rejectWithValue }) => {
    try {
      // Try plural then singular endpoints
      const tryEndpoints = [
        `/api/solicitudes/${id}/grupos-aprobacion`,
        `/api/solicitudes/${id}/grupo-aprobacion`,
  `/api/solicitudes/${id}/grupo`,
  `/api/Solicitudes/${id}/GruposAprobacion`,
  `/api/Solicitudes/${id}/GrupoAprobacion`,
  `/api/Solicitudes/${id}/Grupo`
      ];
      for (const path of tryEndpoints) {
        try {
          const { data } = await api.get(path);
          // Data could be object or array; try to extract a group id
          const candidates: unknown[] = Array.isArray(data) ? data : [data];
          for (const it of candidates) {
            const obj = (it ?? {}) as Record<string, unknown>;
            const gid = ((): number | undefined => {
              const keys = ['grupoAprobacionId','GrupoAprobacionId','grupoId','GrupoId','idGrupo','IdGrupo','id_grupo'];
              for (const k of keys) { const v = obj[k]; if (typeof v === 'number') return v; }
              // nested group
              const nested = obj['grupoAprobacion'] as Record<string, unknown> | undefined;
              if (nested) {
                for (const k of ['idGrupo','IdGrupo','id','Id']) { const v = nested[k]; if (typeof v === 'number') return v; }
              }
              return undefined;
            })();
            if (typeof gid === 'number') return { id, grupoAprobacionId: gid };
          }
        } catch { /* try next endpoint */ }
      }
      return rejectWithValue('Grupo no encontrado');
    } catch (e: unknown) {
      return rejectWithValue('Error cargando grupo: ' + (e as Error).message);
    }
  }
);

// State
interface SolicitudesState {
  items: Solicitud[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  mutating: boolean;
}

const initialState: SolicitudesState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  mutating: false,
};

const solicitudesSlice = createSlice({
  name: 'solicitudes',
  initialState,
  reducers: {
    solicitudesLocalRemove: (state: SolicitudesState, action: PayloadAction<{ id: number }>) => {
      state.items = state.items.filter((s: Solicitud) => s.id_solicitud !== action.payload.id);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSolicitudes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSolicitudes.fulfilled, (state, action: PayloadAction<Solicitud[]>) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchSolicitudes.rejected, (state, action) => { state.loading = false; state.error = (action.payload as string) || 'Error'; })

      .addCase(createSolicitud.pending, (state) => { state.creating = true; state.error = null; })
      .addCase(createSolicitud.fulfilled, (state, action: PayloadAction<Solicitud>) => { state.creating = false; if (action.payload) state.items.unshift(action.payload); })
      .addCase(createSolicitud.rejected, (state, action) => { state.creating = false; state.error = (action.payload as string) || 'Error creando'; })

      .addCase(updateSolicitudEstado.pending, (state) => { state.updating = true; state.error = null; })
      .addCase(updateSolicitudEstado.fulfilled, (state, action) => {
        state.updating = false;
        const { id, estado } = action.payload as { id: number; estado: EstadoSolicitudApi };
        const item = state.items.find(x => x.id_solicitud === id);
        if (item) {
          const ui = estadoApiToUi(estado);
          item.estado = ui;
          item.estado_texto = ui;
        }
      })
      .addCase(updateSolicitudEstado.rejected, (state, action) => { state.updating = false; state.error = (action.payload as string) || 'Error actualizando'; })

      .addCase(addInput.pending, (state) => { state.mutating = true; state.error = null; })
      .addCase(addInput.fulfilled, (state) => { state.mutating = false; })
      .addCase(addInput.rejected, (state, action) => { state.mutating = false; state.error = (action.payload as string) || 'Error agregando input'; })

      .addCase(updateInput.pending, (state) => { state.mutating = true; state.error = null; })
      .addCase(updateInput.fulfilled, (state) => { state.mutating = false; })
      .addCase(updateInput.rejected, (state, action) => { state.mutating = false; state.error = (action.payload as string) || 'Error actualizando input'; })

      .addCase(addGrupoAprobacion.pending, (state) => { state.mutating = true; state.error = null; })
      .addCase(addGrupoAprobacion.fulfilled, (state, action) => {
        state.mutating = false;
        // Reflect group assignment immediately
        try {
          const { id, grupoAprobacionId } = (action as unknown as { meta: { arg: { id: number; grupoAprobacionId: number } } }).meta.arg;
          const item = state.items.find(x => x.id_solicitud === id);
          if (item) item.grupo_aprobacion_id = grupoAprobacionId;
        } catch { /* noop */ }
      })
      .addCase(addGrupoAprobacion.rejected, (state, action) => { state.mutating = false; state.error = (action.payload as string) || 'Error asociando grupo'; })

      .addCase(addDecision.pending, (state) => { state.mutating = true; state.error = null; })
      .addCase(addDecision.fulfilled, (state, action: PayloadAction<{ DecisionId: number; EstadoActual: EstadoSolicitudApi; TodosVotaron: boolean }>) => {
        state.mutating = false;
        // Optionally reflect EstadoActual if provided
        if (action.payload && typeof action.payload.EstadoActual === 'string') {
          // We don't have the id here; callers can refetch if needed.
        }
      })
      .addCase(addDecision.rejected, (state, action) => { state.mutating = false; state.error = (action.payload as string) || 'Error registrando decisión'; });

    builder
      .addCase(fetchSolicitudGrupo.fulfilled, (state, action: PayloadAction<{ id: number; grupoAprobacionId: number }>) => {
        const { id, grupoAprobacionId } = action.payload;
        const item = state.items.find(x => x.id_solicitud === id);
        if (item) item.grupo_aprobacion_id = grupoAprobacionId;
      })
  .addCase(fetchSolicitudGrupo.rejected, () => { /* ignore */ });
  },
});

export const { solicitudesLocalRemove } = solicitudesSlice.actions;
export default solicitudesSlice.reducer;// File intentionally removed; keep placeholder export to avoid module resolution issues if imported somewhere else inadvertently.
