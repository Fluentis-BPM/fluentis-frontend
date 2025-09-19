import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { PlantillaSolicitudDto, PlantillaSolicitudCreateDto, PlantillaSolicitudUpdateDto, InstanciarSolicitudDesdePlantillaDto } from '@/types/bpm/templates';
import { getPlantillas, getPlantillaById, createPlantilla, updatePlantilla, deletePlantilla, instanciarDesdePlantilla } from '@/services/templates';

interface TemplatesState {
  items: PlantillaSolicitudDto[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

const initialState: TemplatesState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

export const fetchPlantillas = createAsyncThunk<PlantillaSolicitudDto[], void, { rejectValue: string }>('templates/fetchAll', async (_, { rejectWithValue }) => {
  try { return await getPlantillas(); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error'); }
});

export const fetchPlantilla = createAsyncThunk<PlantillaSolicitudDto, { id: number }, { rejectValue: string }>('templates/fetchById', async ({ id }, { rejectWithValue }) => {
  try { return await getPlantillaById(id); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error'); }
});

export const createPlantillaThunk = createAsyncThunk<PlantillaSolicitudDto, PlantillaSolicitudCreateDto, { rejectValue: string }>('templates/create', async (body, { rejectWithValue }) => {
  try { return await createPlantilla(body); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error creando'); }
});

export const updatePlantillaThunk = createAsyncThunk<void, { id: number; body: PlantillaSolicitudUpdateDto }, { rejectValue: string }>('templates/update', async ({ id, body }, { rejectWithValue }) => {
  try { await updatePlantilla(id, body); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error actualizando'); }
});

export const deletePlantillaThunk = createAsyncThunk<void, { id: number }, { rejectValue: string }>('templates/delete', async ({ id }, { rejectWithValue }) => {
  try { await deletePlantilla(id); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error eliminando'); }
});

export const instanciarSolicitudThunk = createAsyncThunk<unknown, InstanciarSolicitudDesdePlantillaDto, { rejectValue: string }>('templates/instantiate', async (body, { rejectWithValue }) => {
  try { return await instanciarDesdePlantilla(body); } catch (e) { return rejectWithValue((e as Error)?.message || 'Error instanciando'); }
});

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantillas.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPlantillas.fulfilled, (s, a: PayloadAction<PlantillaSolicitudDto[]>) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchPlantillas.rejected, (s, a) => { s.loading = false; s.error = (a.payload as string) || 'Error'; })
      .addCase(fetchPlantilla.fulfilled, (s, a: PayloadAction<PlantillaSolicitudDto>) => {
        const idx = s.items.findIndex(x => x.idPlantilla === a.payload.idPlantilla);
        if (idx >= 0) s.items[idx] = a.payload; else s.items.push(a.payload);
      })
      .addCase(createPlantillaThunk.pending, (s) => { s.creating = true; s.error = null; })
      .addCase(createPlantillaThunk.fulfilled, (s, a: PayloadAction<PlantillaSolicitudDto>) => { s.creating = false; s.items.unshift(a.payload); })
      .addCase(createPlantillaThunk.rejected, (s, a) => { s.creating = false; s.error = (a.payload as string) || 'Error creando'; })
      .addCase(updatePlantillaThunk.pending, (s) => { s.updating = true; s.error = null; })
      .addCase(updatePlantillaThunk.fulfilled, (s) => { s.updating = false; })
      .addCase(updatePlantillaThunk.rejected, (s, a) => { s.updating = false; s.error = (a.payload as string) || 'Error actualizando'; })
      .addCase(deletePlantillaThunk.pending, (s) => { s.deleting = true; s.error = null; })
      .addCase(deletePlantillaThunk.fulfilled, (s) => { s.deleting = false; })
      .addCase(deletePlantillaThunk.rejected, (s, a) => { s.deleting = false; s.error = (a.payload as string) || 'Error eliminando'; });
  },
});

export default templatesSlice.reducer;
export const selectTemplates = (state: RootState) => state.templates.items;
export const selectTemplatesLoading = (state: RootState) => state.templates.loading;
export const selectTemplatesError = (state: RootState) => state.templates.error;
