// store/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types/auth";
import axios from "axios";
import { setApiToken } from "../../services/api";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  isAuthenticated: false,
  token: null,
};

// Thunk para verificar el token con el backend
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ user?: User; error?: string }>("http://localhost:8080/Auth/login", 
        { accessToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.error || "Error desconocido");
      }
    } catch (error: unknown) {
      return rejectWithValue("Error al conectar con el servidor " + (error as Error).message);
    }
  }
);

// Thunk para verificar el token silenciosamente (sin mostrar errores en UI)
export const silentVerifyToken = createAsyncThunk(
  "auth/silentVerifyToken",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ user?: User; error?: string }>("http://localhost:8080/Auth/login", 
        { accessToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.error || "Error desconocido");
      }
    } catch (error: unknown) {
      return rejectWithValue("Error al conectar con el servidor " + (error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.token = action.payload;
      // Update the API token
      setApiToken(action.payload);
      // Persist to localStorage
      localStorage.setItem('accessToken', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      state.isAuthenticated = false;
      // Clear the API token
      setApiToken(null);
      // Clear persisted token
      localStorage.removeItem('accessToken');
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
        state.isAuthenticated = true;
        // Ensure API token is set if we have an access token
        if (state.accessToken) {
          setApiToken(state.accessToken);
        }
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        // Clear invalid token from localStorage
        localStorage.removeItem('accessToken');
        // Clear the API token
        setApiToken(null);
      })
      // Silent verification handlers (no UI status changes for failures)
      .addCase(silentVerifyToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        // Ensure API token is set if we have an access token
        if (state.accessToken) {
          setApiToken(state.accessToken);
        }
      })
      .addCase(silentVerifyToken.rejected, (state) => {
        // Silent failure - just clear the invalid token without setting error status
        state.status = "idle";
        state.error = null;
        state.user = null;
        state.accessToken = null;
        state.token = null;
        state.isAuthenticated = false;
        // Clear invalid token from localStorage
        localStorage.removeItem('accessToken');
        // Clear the API token
        setApiToken(null);
      });
  },
});

export const { setUser, setAccessToken, clearAuth, setError } = authSlice.actions;

// Export logout as alias for clearAuth for backward compatibility
export const logout = clearAuth;

export default authSlice.reducer;