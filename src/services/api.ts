
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
// Variable para impersonation dev-only
let impersonateUserId: string | number | null = null;

// Función para actualizar el token
export const setApiToken = (token: string | null) => {
  currentAccessToken = token;
};

export const setImpersonateUserId = (id: string | number | null) => {
  impersonateUserId = id;
};

export const clearImpersonation = () => {
  impersonateUserId = null;
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

    // Si hay impersonation configurado (dev), añadir header personalizado
    // Nombre: X-Impersonate-UserId (backend acepta headers personalizados en dev)
    if (impersonateUserId) {
      config.headers['X-Impersonate-UserId'] = String(impersonateUserId);
    }

    return config;
  },
  (error) => {
    // Manejar errores en la solicitud
    return Promise.reject(error);
  }
);

export default api;

// --- Decision endpoints (BPM) ---
export type DecisionCreateReq = { IdUsuario: number; Decision: boolean };
export type PasoResp = unknown; // backend returns the full PasoSolicitud object (treat as unknown)
export type DecisionSolicitudResp = { DecisionId: number; EstadoActual: string; TodosVotaron: boolean };

export const postPasoDecision = async (pasoId: number, body: DecisionCreateReq): Promise<PasoResp> => {
  const res = await api.post(`/api/PasoSolicitud/${pasoId}/decisiones`, body);
  return res.data;
};

export const deletePasoDecision = async (pasoId: number, decisionId: number): Promise<void> => {
  await api.delete(`/api/PasoSolicitud/${pasoId}/decisiones/${decisionId}`);
};

export const postSolicitudDecision = async (solicitudId: number, body: DecisionCreateReq): Promise<DecisionSolicitudResp> => {
  const res = await api.post(`/api/solicitudes/${solicitudId}/decision`, body);
  return res.data;
};