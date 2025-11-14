import { useCallback, useEffect, useState } from 'react';
import {
  getActiveFlowsSummary,
  getAvgFlowCloseTime,
  getAvgStepResponseByType,
  getBottlenecks,
  getFlowVolumeByMonth,
  getMonthOverMonth,
  getRequestsSummary,
} from '@/services/kpis';
import type {
  ActiveFlowsSummaryDto,
  AvgFlowCloseTimeDto,
  AvgStepResponseByTypeDto,
  BottlenecksDto,
  FlowVolumeByMonthDto,
  MonthOverMonthDto,
  RequestsSummaryDto,
} from '@/types/kpis';

export type KpiFilters = {
  startDate?: Date;
  endDate?: Date;
  months?: number; // for volume chart
  bottleneckGroupBy?: 'nombre' | 'tipo';
  bottleneckTop?: number;
  momMonth?: string; // YYYY-MM
  topUsers?: number; // for requests summary
};

export function useKpis(initialFilters: KpiFilters = {}) {
  const [filters, setFilters] = useState<KpiFilters>({ months: 12, bottleneckGroupBy: 'nombre', bottleneckTop: 10, topUsers: 5, ...initialFilters });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFlows, setActiveFlows] = useState<ActiveFlowsSummaryDto | null>(null);
  const [requestsSummary, setRequestsSummary] = useState<RequestsSummaryDto | null>(null);
  const [avgCloseTime, setAvgCloseTime] = useState<AvgFlowCloseTimeDto | null>(null);
  const [avgStepResp, setAvgStepResp] = useState<AvgStepResponseByTypeDto | null>(null);
  const [volumeByMonth, setVolumeByMonth] = useState<FlowVolumeByMonthDto | null>(null);
  const [bottlenecks, setBottlenecks] = useState<BottlenecksDto | null>(null);
  const [monthOverMonth, setMonthOverMonth] = useState<MonthOverMonthDto | null>(null);

  const toYMD = (d?: Date) => (d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : undefined);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const commonRange = { startDate: toYMD(filters.startDate), endDate: toYMD(filters.endDate) };

      const [af, rs, ct, sr, vol, bn, mom] = await Promise.all([
        getActiveFlowsSummary(commonRange),
        getRequestsSummary({ ...commonRange, topN: filters.topUsers }),
        getAvgFlowCloseTime({ ...commonRange, porFlujo: true }),
        getAvgStepResponseByType(commonRange),
        getFlowVolumeByMonth({ months: filters.months ?? 12 }),
        getBottlenecks({ ...commonRange, groupBy: filters.bottleneckGroupBy ?? 'nombre', top: filters.bottleneckTop ?? 10 }),
        getMonthOverMonth({ month: filters.momMonth }),
      ]);

      setActiveFlows(af);
      setRequestsSummary(rs);
      setAvgCloseTime(ct);
      setAvgStepResp(sr);
      setVolumeByMonth(vol);
      setBottlenecks(bn);
      setMonthOverMonth(mom);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error loading KPIs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    filters,
    setFilters,
    loading,
    error,
    activeFlows,
    requestsSummary,
    avgCloseTime,
    avgStepResp,
    volumeByMonth,
    bottlenecks,
    monthOverMonth,
    refetch: fetchAll,
  };
}
