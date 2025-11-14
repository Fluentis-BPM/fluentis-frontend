

export type AvgFlowCloseTimeDto = {
  overallAvgHours: number;
  overallAvgDays: number;
  byFlowName?: AvgByFlowDto[];
};

export type AvgByFlowDto = {
  flowName: string;
  avgHours: number;
  count: number;
};

export type AvgStepResponseByTypeDto = {
  items: AvgByStepTypeItem[];
};

export type AvgByStepTypeItem = {
  tipoPaso: string; // "aprobacion" | "ejecucion"
  avgHours: number;
  count: number;
};

export type FlowVolumeByMonthDto = {
  months: FlowVolumeMonthItem[];
};

export type FlowVolumeMonthItem = {
  month: string; // YYYY-MM
  iniciados: number;
  finalizados: number;
  cancelados: number;
};

export type BottlenecksDto = {
  groupBy: string; // "nombre" | "tipo"
  items: BottleneckItem[];
};

export type BottleneckItem = {
  key: string; // paso nombre or tipo
  avgHours: number;
  count: number;
};

export type MonthOverMonthDto = {
  month: string; // YYYY-MM
  previousMonth: string; // YYYY-MM
  metrics: MomMetricItem[];
};

export type MomMetricItem = {
  metric: string; // e.g., "avg_close_time_hours"
  current: number;
  previous: number;
  changePct: number; // -100..+100
};

export type ActiveFlowsSummaryDto = {
  startDate?: string;
  endDate?: string;
  creados: number;
  finalizados: number;
  enCurso: number;
  cancelados: number;
};

export type RequestsSummaryDto = {
  startDate?: string;
  endDate?: string;
  creadas: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
  tiempoPromedioRespuestaAprobacionHoras: number;
  usuariosMasActivos: UsuarioActividadItem[];
};

export type UsuarioActividadItem = {
  usuarioId: number;
  nombre?: string;
  pasosCompletados: number;
};
