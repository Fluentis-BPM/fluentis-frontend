
import axios from "axios";
import { fromApiTipoInput, coerceValor } from '@/lib/tipoInputMapper';

// Crear una instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080", 
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

// Interceptor de respuesta: normaliza tipos de inputs y valores dinámicos
api.interceptors.response.use(
  (response) => {
    try {
      const data = response.data;
      // Normalizar estructura de pasos (cuando venga FlujoActivoResponse u objetos similares)
      if (data && typeof data === 'object') {
        // Caso listado de flujos activos con pasos
        const maybePasos = (data as Record<string, unknown>)['pasos'];
        if (Array.isArray(maybePasos)) {
          (data as Record<string, unknown>)['pasos'] = maybePasos.map((p: unknown) => normalizePaso(p));
        }
        // Caso respuesta que ya es un paso puntual
        if (looksLikePaso(data)) {
          response.data = normalizePaso(data);
        }
        // Caso bulk de pasos directamente (poco común, prevención)
        if (Array.isArray(data) && data.every((el: unknown) => looksLikePaso(el))) {
          response.data = (data as unknown[]).map((p) => normalizePaso(p));
        }
      }
    } catch (e) {
      // Silencioso: no queremos romper flujo si algo no se pudo normalizar
      // console.warn('Normalization warning:', e);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

function looksLikePaso(obj: unknown): boolean {
  return Boolean(
    obj && typeof obj === 'object' && 'id_paso_solicitud' in (obj as Record<string, unknown>) && 'flujo_activo_id' in (obj as Record<string, unknown>)
  );
}

function normalizePaso(paso: unknown) {
  if (!looksLikePaso(paso)) return paso;
  const p = paso as Record<string, unknown> & { relacionesInput?: unknown[]; campos_dinamicos?: unknown[] };
  if (Array.isArray(p.relacionesInput)) {
    p.relacionesInput = p.relacionesInput.map((r) => normalizeRelacionInput(r));
  }
  if (Array.isArray(p.campos_dinamicos)) {
    p.campos_dinamicos = p.campos_dinamicos.map((r) => normalizeRelacionInput(r));
  }
  return p;
}

function normalizeRelacionInput(rel: unknown) {
  if (!rel || typeof rel !== 'object') return rel;
  const r = rel as Record<string, unknown>;
  const input = r['input'];
  if (input && typeof input === 'object') {
    const apiTipo = (input as Record<string, unknown>)['tipoInput'] || (input as Record<string, unknown>)['TipoInput'];
    if (apiTipo) {
      const frontTipo = fromApiTipoInput(String(apiTipo));
      (input as Record<string, unknown>)['tipo_input_front'] = frontTipo;
      (input as Record<string, unknown>)['tipoInput'] = apiTipo;
    }
  }
  const valor = r['Valor'];
  if (valor && typeof valor === 'object') {
    const vrec = valor as Record<string, unknown>;
    if (vrec['tipoInput'] && vrec['rawValue']) {
      const frontTipo = fromApiTipoInput(String(vrec['tipoInput']));
      try {
        vrec['parsed'] = coerceValor(frontTipo, String(vrec['rawValue']));
      } catch {
        vrec['parsed'] = vrec['rawValue'];
      }
    }
  }
  return r;
}

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