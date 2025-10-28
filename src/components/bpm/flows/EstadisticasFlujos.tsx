import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { EstadisticasFlujos as EstadisticasFlujosType } from '@/types/bpm/flow';
import { 
  Workflow, 
  Clock, 
  CheckCircle, 
  XCircle
} from 'lucide-react';

interface Props {
  estadisticas: EstadisticasFlujosType;
}

export const EstadisticasFlujos: React.FC<Props> = ({ estadisticas }) => {
  const stats = [
    {
      label: 'Total',
      value: estadisticas.total_flujos,
      icon: Workflow,
      color: 'text-foreground',
      bgColor: 'bg-primary/10',
      description: 'Flujos registrados'
    },
    {
      label: 'En Curso',
      value: estadisticas.en_curso,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      description: 'Actualmente ejecutándose'
    },
    {
      label: 'Finalizados',
      value: estadisticas.finalizados,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Completados exitosamente'
    },
    {
      label: 'Cancelados',
      value: estadisticas.cancelados,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'Cancelados o fallidos'
    }
  ];

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`p-3 rounded-lg ${stat.bgColor} transition-all hover:scale-105`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};