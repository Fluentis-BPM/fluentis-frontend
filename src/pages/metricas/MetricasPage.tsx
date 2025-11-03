import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingDown, TrendingUp, Users, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useKpis } from '@/hooks/metrics/useKpis';
import type { FlowVolumeMonthItem, MomMetricItem } from '@/types/kpis';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';

const numberFmt = (n?: number) => (typeof n === 'number' ? new Intl.NumberFormat().format(n) : '-');
const pctFmt = (n?: number) => (typeof n === 'number' ? `${(n).toFixed(1)}%` : '-');

// Mapea claves técnicas a etiquetas legibles en español
const momMetricLabels: Record<string, string> = {
  avg_close_time_hours: 'Tiempo promedio de cierre (h)',
  avg_approval_hours: 'Tiempo promedio de aprobación (h)',
  avg_execution_hours: 'Tiempo promedio de ejecución (h)',
  flujos_iniciados: 'Flujos iniciados',
  flujos_finalizados: 'Flujos finalizados',
  flujos_cancelados: 'Flujos cancelados',
};

const labelForMomMetric = (key: string) => {
  if (momMetricLabels[key]) return momMetricLabels[key];
  // Fallback genérico: convierte snake_case a Título Capitalizado
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const MetricasPage: React.FC = () => {
  const {
    filters, setFilters,
    loading, error,
    activeFlows, requestsSummary,
    avgCloseTime, avgStepResp,
    volumeByMonth, bottlenecks,
    monthOverMonth, refetch,
  } = useKpis();

  const monthsOptions = [6, 12, 18, 24];

  const volumeData = useMemo<FlowVolumeMonthItem[]>(() => volumeByMonth?.months ?? [], [volumeByMonth]);
  const closeTimeByFlow = useMemo(() => avgCloseTime?.byFlowName ?? [], [avgCloseTime]);
  const stepTypeItems = useMemo(() => avgStepResp?.items ?? [], [avgStepResp]);
  const bottleneckItems = useMemo(() => bottlenecks?.items ?? [], [bottlenecks]);
  const momMetrics = useMemo<MomMetricItem[]>(() => monthOverMonth?.metrics ?? [], [monthOverMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Métricas y KPIs</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Rango de fechas</Label>
              <DateRangePicker
                dateFrom={filters.startDate}
                dateTo={filters.endDate}
                onDateFromChange={(d) => setFilters((prev) => ({ ...prev, startDate: d }))}
                onDateToChange={(d) => setFilters((prev) => ({ ...prev, endDate: d }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Meses para volumen</Label>
              <Select
                value={String(filters.months ?? 12)}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, months: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Meses" />
                </SelectTrigger>
                <SelectContent>
                  {monthsOptions.map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} meses</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cuellos de botella: agrupar por</Label>
              <Select
                value={filters.bottleneckGroupBy ?? 'nombre'}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, bottleneckGroupBy: v as 'nombre' | 'tipo' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Agrupar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre de paso</SelectItem>
                  <SelectItem value="tipo">Tipo de paso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resúmenes principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Flujos creados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFmt(activeFlows?.creados)}</div>
            <p className="text-xs text-muted-foreground">En el rango seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Flujos finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFmt(activeFlows?.finalizados)}</div>
            <p className="text-xs text-muted-foreground">En el rango seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Flujos en curso</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFmt(activeFlows?.enCurso)}</div>
            <p className="text-xs text-muted-foreground">Actualmente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Flujos cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFmt(activeFlows?.cancelados)}</div>
            <p className="text-xs text-muted-foreground">En el rango seleccionado</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de solicitudes y usuarios */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Creadas</div>
              <div className="text-xl font-semibold">{numberFmt(requestsSummary?.creadas)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Aprobadas</div>
              <div className="text-xl font-semibold">{numberFmt(requestsSummary?.aprobadas)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Rechazadas</div>
              <div className="text-xl font-semibold">{numberFmt(requestsSummary?.rechazadas)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
              <div className="text-xl font-semibold">{numberFmt(requestsSummary?.pendientes)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Tiempo prom. respuesta aprobación</div>
              <div className="text-xl font-semibold">{numberFmt(requestsSummary?.tiempoPromedioRespuestaAprobacionHoras)} h</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios más activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requestsSummary?.usuariosMasActivos?.slice(0, 5).map((u) => (
                <div key={u.usuarioId} className="flex items-center justify-between border-b last:border-b-0 py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{u.nombre || `Usuario ${u.usuarioId}`}</span>
                  </div>
                  <Badge variant="secondary">{u.pasosCompletados} pasos</Badge>
                </div>
              ))}
              {(!requestsSummary || (requestsSummary.usuariosMasActivos?.length ?? 0) === 0) && (
                <div className="text-sm text-muted-foreground">No hay datos para el rango seleccionado.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volumen por mes */}
      <Card>
        <CardHeader>
          <CardTitle>Volumen de flujos por mes</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar dataKey="iniciados" fill="#3b82f6" name="Iniciados" />
              <Bar dataKey="finalizados" fill="#10b981" name="Finalizados" />
              <Bar dataKey="cancelados" fill="#ef4444" name="Cancelados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tiempo promedio de cierre por flujo */}
      <Card>
        <CardHeader>
          <CardTitle>Tiempo promedio de cierre por flujo</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={closeTimeByFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="flowName" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar dataKey="avgHours" fill="#8b5cf6" name="Horas promedio" />
              <Bar dataKey="count" fill="#cbd5e1" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-sm text-muted-foreground mt-2">
            Promedio general: <span className="font-semibold">{numberFmt(avgCloseTime?.overallAvgHours)} h</span> ({numberFmt(avgCloseTime?.overallAvgDays)} días)
          </div>
        </CardContent>
      </Card>

      {/* Tiempo promedio de respuesta por tipo de paso */}
      <Card>
        <CardHeader>
          <CardTitle>Tiempo promedio de respuesta por tipo de paso</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepTypeItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipoPaso" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar dataKey="avgHours" fill="#f59e0b" name="Horas promedio" />
              <Bar dataKey="count" fill="#cbd5e1" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cuellos de botella */}
      <Card>
        <CardHeader>
          <CardTitle>Principales cuellos de botella</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bottleneckItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar dataKey="avgHours" fill="#0ea5e9" name="Horas promedio" />
              <Bar dataKey="count" fill="#cbd5e1" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparación mensual (MoM) */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación mensual</CardTitle>
        </CardHeader>
        <CardContent>
          {momMetrics.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {momMetrics.map((m) => (
                <div key={m.metric} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{labelForMomMetric(m.metric)}</div>
                    <div className="text-lg font-semibold">{numberFmt(m.current)} <span className="text-xs text-muted-foreground">(prev: {numberFmt(m.previous)})</span></div>
                  </div>
                  <div className="flex items-center gap-1">
                    {m.changePct >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={m.changePct >= 0 ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                      {pctFmt(m.changePct)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay datos disponibles.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricasPage;
