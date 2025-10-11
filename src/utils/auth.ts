import { store } from '../store';
import { logout } from '../store/auth/authSlice';

export const handleLogout = () => {
  store.dispatch(logout());
  // Por si esta guardado en el localStorage
  localStorage.removeItem('token');
};

export const getAuthToken = () => {
  return store.getState().auth.token;
};