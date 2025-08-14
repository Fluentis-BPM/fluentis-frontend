import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import bpmReducer from './bpm/bpmSlice';
import approvalGroupsReducer from './approvalGroups/approvalGroupsSlice';

export const store = configureStore({
  reducer: {
    bpm: bpmReducer,
    auth: authReducer,
    approvalGroups: approvalGroupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Auth selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectStatus = (state: RootState) => state.auth.status;
export const selectUser = (state: RootState) => state.auth.user;
export const selectError = (state: RootState) => state.auth.error;