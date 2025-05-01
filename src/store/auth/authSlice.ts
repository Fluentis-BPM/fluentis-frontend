import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../types/auth";
import { User } from "../../types/auth";


// export const fetchUserProfile = createAsyncThunk<FetchUserProfileResponse, void, { state: { auth: AuthState } }>(
//   "auth/fetchUserProfile",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response: AxiosResponse<FetchUserProfileResponse> = await axios.get("https://localhost:5001/Usuarios/me", {
//         headers: {
//           Authorization: `Bearer ${auth.accessToken}`,
//         },
//       });
//       return response.data;
//     } catch (error: AxiosError<any>) {
//       return rejectWithValue(error.response?.data || "Error fetching profile");
//     }
//   }
// );

const initialState: AuthState = {
  user: null,
  accessToken: null,
  // profile: null,
  status: "idle",
  error: null,
};

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
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchUserProfile.pending, (state) => {
  //       state.status = "loading";
  //     })
  //     .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<FetchUserProfileResponse>) => {
  //       state.status = "succeeded";
  //       state.profile = action.payload;
  //     })
  //     .addCase(fetchUserProfile.rejected, (state, action) => {
  //       state.status = "failed";
  //       state.error = action.payload as string;
  //     });
  // },
});

export const { setUser, setAccessToken, clearAuth, setError } = authSlice.actions;
export default authSlice.reducer;