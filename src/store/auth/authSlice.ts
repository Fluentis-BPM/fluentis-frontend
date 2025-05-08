// store/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types/auth";
import { RootState } from "..";
import api from "@/services/api";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
};

// Thunk para verificar el token con el backend
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ user?: User; error?: string }>("/Auth/login", { accessToken });
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.error || "Error desconocido");
      }
    } catch (error) {
      return rejectWithValue("Error al conectar con el servidor " + (error.message));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.pending, (state) => {
        state.status = "loading";
        state.error = null; 
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setAccessToken, clearAuth, setError } = authSlice.actions;
export const { selectAccessToken, selectStatus, selectUser, selectError } = {
  selectAccessToken: (state: RootState) => state.auth.accessToken,
  selectStatus: (state: RootState) => state.auth.status,
  selectUser: (state: RootState) => state.auth.user,
  selectError: (state: RootState) => state.auth.error,
};
export default authSlice.reducer;