import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { GrupoAprobacion, CreateGrupoAprobacionInput, UpdateGrupoAprobacionInput } from '@/types/equipos/aprobations';
import type { User } from '@/types/auth';

// API types (simplified)
interface ApiUsuario { idUsuario: number; nombre: string; email: string; departamento?: { idDepartamento: number; nombre: string } | null; rol?: { idRol: number; nombre: string } | null; cargo?: { idCargo: number; nombre: string } | null; }
interface ApiRelacionUsuarioGrupo { idRelacion: number; grupoAprobacionId: number; usuarioId: number; usuario: ApiUsuario; }
interface ApiGrupoAprobacion { idGrupo?: number; idgrupo?: number; id_grupo?: number; nombre: string; fecha?: string; esGlobal?: boolean; esglobal?: boolean; es_global?: boolean; relacionesUsuarioGrupo?: ApiRelacionUsuarioGrupo[]; relacionesusuarioGrupo?: ApiRelacionUsuarioGrupo[]; relaciones_usuario_grupo?: ApiRelacionUsuarioGrupo[]; }

// Helper para extraer mensajes de error sin usar any
function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || fallback;
  // Axios-like shape
  if (err && typeof err === 'object') {
    const maybeResp = (err as { response?: { data?: unknown } }).response;
    if (maybeResp?.data) {
      if (typeof maybeResp.data === 'string') return maybeResp.data;
      if (typeof (maybeResp.data as { message?: unknown }).message === 'string') {
        return (maybeResp.data as { message: string }).message;
      }
    }
  }
  return fallback;
}

const pickFirst = <T, K extends keyof T>(obj: T, keys: K[]): T[K] | undefined => { for (const k of keys) if (obj[k] !== undefined) return obj[k]; return undefined; };
// Reemplaza any por unknown
interface LooseObject { [key: string]: unknown; }
const normalizeApiGrupo = (raw: unknown): ApiGrupoAprobacion => {
  const obj = raw as LooseObject;
  return {
    idGrupo: pickFirst(obj, ['idGrupo','idgrupo','id_grupo']) as number | undefined,
    nombre: obj['nombre'] as string,
    fecha: obj['fecha'] as string | undefined,
    esGlobal: pickFirst(obj, ['esGlobal','esglobal','es_global']) as boolean | undefined,
    relacionesUsuarioGrupo: pickFirst(obj, ['relacionesUsuarioGrupo','relacionesusuarioGrupo','relaciones_usuario_grupo']) as ApiRelacionUsuarioGrupo[] | undefined
  };
};

// Normalizador de rolNombre a los valores permitidos por la interfaz User
const toRolNombre = (raw?: string): User['rolNombre'] => {
  if (!raw) return 'Miembro';
  const v = raw.trim().toLowerCase();
  if (v === 'administrador') return 'Administrador';
  if (v === 'visualizador') return 'Visualizador';
  if (v === 'visualizador departamental' || v === 'visualizadordepartamental') return 'Visualizador Departamental';
  return 'Miembro';
};
// Para el campo legacy 'rol' debemos usar el valor restringido del tipo (incluye la variante sin espacio)
const toLegacyRol = (raw?: string): User['rol'] => {
  if (!raw) return 'Miembro';
  const v = raw.trim().toLowerCase();
  if (v === 'administrador') return 'Administrador';
  if (v === 'visualizador') return 'Visualizador';
  if (v === 'visualizador departamental' || v === 'visualizadordepartamental') return 'Visualizadordepartamental';
  if (v === 'miembro') return 'Miembro';
  return 'Miembro';
};

const mapFromApi = (apiItemRaw: unknown): GrupoAprobacion => {
  const apiItem = normalizeApiGrupo(apiItemRaw);
  return {
    id_grupo: apiItem.idGrupo!,
    nombre: apiItem.nombre,
    fecha: apiItem.fecha || '',
    es_global: apiItem.esGlobal ?? false,
    usuarios: (apiItem.relacionesUsuarioGrupo || []).map(r => ({
      idUsuario: r.usuario.idUsuario,
      oid: r.usuario.idUsuario,
      email: r.usuario.email,
      nombre: r.usuario.nombre,
      cargoNombre: r.usuario.cargo?.nombre || '',
      departamentoNombre: r.usuario.departamento?.nombre || '',
      rolNombre: toRolNombre(r.usuario.rol?.nombre),
      departamento: r.usuario.departamento?.nombre || '',
      rol: toLegacyRol(r.usuario.rol?.nombre),
      cargo: r.usuario.cargo?.nombre || ''
    }))
  };
};

interface ApprovalGroupsState { grupos: GrupoAprobacion[]; loading: boolean; error: string | null; creating: boolean; createError: string | null; updating: boolean; mutatingMembers: boolean; deleting: boolean; lastActionError: string | null; }
const initialState: ApprovalGroupsState = { grupos: [], loading: false, error: null, creating: false, createError: null, updating: false, mutatingMembers: false, deleting: false, lastActionError: null };

export const fetchGrupos = createAsyncThunk<GrupoAprobacion[], void, { rejectValue: string }>('approvalGroups/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const resp = await api.get('/api/GrupoAprobaciones');
    const data: unknown[] = Array.isArray(resp.data) ? resp.data : [];
    return data.map(mapFromApi);
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error fetching grupos'));
  }
});

export const createGrupoThunk = createAsyncThunk<void, CreateGrupoAprobacionInput, { rejectValue: string }>('approvalGroups/create', async (input, { dispatch, rejectWithValue }) => {
  try {
    await api.post('/api/GrupoAprobaciones', { nombre: input.nombre, esGlobal: input.esGlobal, usuarioIds: input.usuarioIds });
    await dispatch(fetchGrupos());
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error creating grupo'));
  }
});

export const updateGrupoThunk = createAsyncThunk<void, { id: number; data: UpdateGrupoAprobacionInput }, { rejectValue: string }>('approvalGroups/update', async ({ id, data }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/api/GrupoAprobaciones/${id}`, { nombre: data.nombre, esGlobal: data.esGlobal });
    await dispatch(fetchGrupos());
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error updating grupo'));
  }
});

export const addUsuariosThunk = createAsyncThunk<void, { id: number; usuarioIds: number[] }, { rejectValue: string }>('approvalGroups/addUsuarios', async ({ id, usuarioIds }, { dispatch, rejectWithValue }) => {
  try {
    await api.post(`/api/GrupoAprobaciones/${id}/usuarios`, usuarioIds);
    await dispatch(fetchGrupos());
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error adding users'));
  }
});

export const removeUsuarioThunk = createAsyncThunk<void, { id: number; usuarioId: number }, { rejectValue: string }>('approvalGroups/removeUsuario', async ({ id, usuarioId }, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`/api/GrupoAprobaciones/${id}/usuarios/${usuarioId}`);
    await dispatch(fetchGrupos());
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error removing user'));
  }
});

export const deleteGrupoThunk = createAsyncThunk<void, { id: number }, { rejectValue: string }>('approvalGroups/delete', async ({ id }, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`/api/GrupoAprobaciones/${id}`);
    await dispatch(fetchGrupos());
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err, 'Error deleting grupo'));
  }
});

const approvalGroupsSlice = createSlice({ name: 'approvalGroups', initialState, reducers: { clearApprovalGroupsErrors(state) { state.error = null; state.createError = null; state.lastActionError = null; } }, extraReducers: builder => { builder
  .addCase(fetchGrupos.pending, state => { state.loading = true; state.error = null; })
  .addCase(fetchGrupos.fulfilled, (state, action: PayloadAction<GrupoAprobacion[]>) => { state.loading = false; state.grupos = action.payload; })
  .addCase(fetchGrupos.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Error'; })
  .addCase(createGrupoThunk.pending, state => { state.creating = true; state.createError = null; })
  .addCase(createGrupoThunk.fulfilled, state => { state.creating = false; })
  .addCase(createGrupoThunk.rejected, (state, action) => { state.creating = false; state.createError = action.payload || 'Error creando grupo'; })
  .addCase(updateGrupoThunk.pending, state => { state.updating = true; state.lastActionError = null; })
  .addCase(updateGrupoThunk.fulfilled, state => { state.updating = false; })
  .addCase(updateGrupoThunk.rejected, (state, action) => { state.updating = false; state.lastActionError = action.payload || 'Error actualizando'; })
  .addCase(addUsuariosThunk.pending, state => { state.mutatingMembers = true; state.lastActionError = null; })
  .addCase(addUsuariosThunk.fulfilled, state => { state.mutatingMembers = false; })
  .addCase(addUsuariosThunk.rejected, (state, action) => { state.mutatingMembers = false; state.lastActionError = action.payload || 'Error agregando usuarios'; })
  .addCase(removeUsuarioThunk.pending, state => { state.mutatingMembers = true; state.lastActionError = null; })
  .addCase(removeUsuarioThunk.fulfilled, state => { state.mutatingMembers = false; })
  .addCase(removeUsuarioThunk.rejected, (state, action) => { state.mutatingMembers = false; state.lastActionError = action.payload || 'Error removiendo usuario'; })
  .addCase(deleteGrupoThunk.pending, state => { state.deleting = true; state.lastActionError = null; })
  .addCase(deleteGrupoThunk.fulfilled, state => { state.deleting = false; })
  .addCase(deleteGrupoThunk.rejected, (state, action) => { state.deleting = false; state.lastActionError = action.payload || 'Error eliminando grupo'; }); } });

export const { clearApprovalGroupsErrors } = approvalGroupsSlice.actions;
export default approvalGroupsSlice.reducer;
