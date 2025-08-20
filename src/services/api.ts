
import axios from "axios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: "http://localhost:8080", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para almacenar el token actual
let currentAccessToken: string | null = null;

// Función para actualizar el token
export const setApiToken = (token: string | null) => {
  currentAccessToken = token;
};

// Initialize token from localStorage if available (helps on hard reloads before Redux hydrates)
try {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage?.getItem('accessToken');
    if (stored) {
      currentAccessToken = stored;
    }
  }
} catch {
  // ignore access errors
}

// Configurar el interceptor para incluir el accessToken
api.interceptors.request.use(
  (config) => {
    // Si hay un accessToken, añadirlo al encabezado Authorization
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    return config;
  },
  (error) => {
    // Manejar errores en la solicitud
    return Promise.reject(error);
  }
);

export default api;