import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Auth selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectStatus = (state: RootState) => state.auth.status;
export const selectUser = (state: RootState) => state.auth.user;
export const selectError = (state: RootState) => state.auth.error;