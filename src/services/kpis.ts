import api from '@/services/api';
import type {
  AvgFlowCloseTimeDto,
  AvgStepResponseByTypeDto,
  FlowVolumeByMonthDto,
  BottlenecksDto,
  MonthOverMonthDto,
  ActiveFlowsSummaryDto,
  RequestsSummaryDto,
} from '@/types/kpis';

export const getAvgFlowCloseTime = async (params: { startDate?: string; endDate?: string; porFlujo?: boolean } = {}) => {
  const res = await api.get<AvgFlowCloseTimeDto>('/api/kpis/tiempo-cierre-promedio', { params });
  return res.data;
};

export const getAvgStepResponseByType = async (params: { startDate?: string; endDate?: string } = {}) => {
  const res = await api.get<AvgStepResponseByTypeDto>('/api/kpis/tiempo-respuesta-por-tipo', { params });
  return res.data;
};

export const getFlowVolumeByMonth = async (params: { months?: number } = {}) => {
  const res = await api.get<FlowVolumeByMonthDto>('/api/kpis/volumen-por-mes', { params });
  return res.data;
};

export const getBottlenecks = async (params: { startDate?: string; endDate?: string; groupBy?: 'nombre' | 'tipo'; top?: number } = {}) => {
  const res = await api.get<BottlenecksDto>('/api/kpis/cuellos-de-botella', { params });
  return res.data;
};

export const getMonthOverMonth = async (params: { month?: string } = {}) => {
  const res = await api.get<MonthOverMonthDto>('/api/kpis/comparacion-mensual', { params });
  return res.data;
};

export const getActiveFlowsSummary = async (params: { startDate?: string; endDate?: string } = {}) => {
  const res = await api.get<ActiveFlowsSummaryDto>('/api/kpis/resumen-flujos', { params });
  return res.data;
};

export const getRequestsSummary = async (params: { startDate?: string; endDate?: string; topN?: number } = {}) => {
  const res = await api.get<RequestsSummaryDto>('/api/kpis/resumen-solicitudes', { params });
  return res.data;
};
