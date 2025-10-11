import api from './api';
import type { AxiosError } from 'axios';
import type {
  PlantillaSolicitudDto,
  PlantillaSolicitudCreateDto,
  PlantillaSolicitudUpdateDto,
  InstanciarSolicitudDesdePlantillaDto,
} from '@/types/bpm/templates';

export const getPlantillas = async (): Promise<PlantillaSolicitudDto[]> => {
  const { data } = await api.get('/api/plantillas');
  return Array.isArray(data) ? data : [];
};

export const getPlantillaById = async (id: number): Promise<PlantillaSolicitudDto> => {
  const { data } = await api.get(`/api/plantillas/${id}`);
  return data as PlantillaSolicitudDto;
};

export const createPlantilla = async (body: PlantillaSolicitudCreateDto): Promise<PlantillaSolicitudDto> => {
  const { data } = await api.post('/api/plantillas', body);
  return data as PlantillaSolicitudDto;
};

export const updatePlantilla = async (id: number, body: PlantillaSolicitudUpdateDto): Promise<void> => {
  await api.put(`/api/plantillas/${id}`, body);
};

export const deletePlantilla = async (id: number): Promise<void> => {
  await api.delete(`/api/plantillas/${id}`);
};

export const instanciarDesdePlantilla = async (body: InstanciarSolicitudDesdePlantillaDto): Promise<{ solicitudId: number } | unknown> => {
  try {
    const { data } = await api.post('/api/plantillas/instanciar-solicitud', body);
    return data;
  } catch (err) {
    const e = err as AxiosError<unknown>;
    let serverMsg = '';
    const data = e.response?.data as unknown;
    if (data && typeof data === 'object') {
      const d = data as { message?: string; detail?: string };
      serverMsg = d.message || d.detail || '';
    }
    throw new Error(serverMsg || e.message || 'Error al instanciar la solicitud');
  }
};
