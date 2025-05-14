
import axios from "axios";
import { store } from "../store"; 
import { selectAccessToken } from "../store/auth/authSlice"; 

// Crear una instancia de Axios
const api = axios.create({
  baseURL: "https://fluentis-backend.onrender.com", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Configurar el interceptor para incluir el accessToken
api.interceptors.request.use(
  (config) => {
    // Acceder al accessToken desde el store
    const state = store.getState();
    const accessToken = selectAccessToken(state);

    // Si hay un accessToken, añadirlo al encabezado Authorization
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    // Manejar errores en la solicitud
    return Promise.reject(error);
  }
);

export default api;