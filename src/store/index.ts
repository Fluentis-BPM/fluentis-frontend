<<<<<<< HEAD
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
=======
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
>>>>>>> 2371a1cc71030c0836d5bc2b3e11a818e4855219
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;