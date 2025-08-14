// src/store/bpm/bpmSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FlujoActivo, PasoSolicitud, CaminoParalelo, FlujoActivoResponse } from '@/types/bpm/flow';
import axios from 'axios';

interface BpmState {
  flujosActivos: FlujoActivo[];
  pasosPorFlujo: { [key: number]: PasoSolicitud[] };
  caminosPorFlujo: { [key: number]: CaminoParalelo[] };
  loading: boolean;
  error: string | null;
  flujoSeleccionado: number | null;
}

const initialState: BpmState = {
  flujosActivos: [],
  pasosPorFlujo: {},
  caminosPorFlujo: {},
  loading: false,
  error: null,
  flujoSeleccionado: null,
};

export const fetchFlujosActivos = createAsyncThunk(
  'bpm/fetchFlujosActivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<FlujoActivo[]>('/api/FlujosActivos');
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
      const response = await axios.get<FlujoActivoResponse>(`/api/FlujosActivos/Pasos/${flujoActivoId}`);
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
      });
  },
});

export const { setFlujoSeleccionado } = bpmSlice.actions;
export default bpmSlice.reducer;