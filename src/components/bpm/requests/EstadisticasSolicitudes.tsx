import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface Estadisticas {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}

interface Props {
  estadisticas: Estadisticas;
}

export const EstadisticasSolicitudes: React.FC<Props> = ({ estadisticas }) => {
  const calcularPorcentaje = (valor: number, total: number) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const tarjetas = [
    {
      titulo: 'Total',
      valor: estadisticas.total,
      icono: FileText,
      color: 'text-request-primary',
      bgColor: 'bg-request-primary/10',
      gradiente: 'bg-gradient-primary'
    },
    {
      titulo: 'Aprobadas',
      valor: estadisticas.aprobadas,
      porcentaje: calcularPorcentaje(estadisticas.aprobadas, estadisticas.total),
      icono: CheckCircle,
      color: 'text-request-success',
      bgColor: 'bg-request-success/10',
      gradiente: 'bg-gradient-success'
    },
    {
      titulo: 'Pendientes',
      valor: estadisticas.pendientes,
      porcentaje: calcularPorcentaje(estadisticas.pendientes, estadisticas.total),
      icono: Clock,
      color: 'text-request-warning',
      bgColor: 'bg-request-warning/10',
      gradiente: 'bg-request-warning'
    },
    {
      titulo: 'Rechazadas',
      valor: estadisticas.rechazadas,
      porcentaje: calcularPorcentaje(estadisticas.rechazadas, estadisticas.total),
      icono: XCircle,
      color: 'text-request-danger',
      bgColor: 'bg-request-danger/10',
      gradiente: 'bg-request-danger'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
      {tarjetas.map((tarjeta, index) => {
        const Icono = tarjeta.icono;
        
        return (
          <motion.div
            key={tarjeta.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
          >
            <Card className="shadow-soft hover:shadow-elevated transition-smooth h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {tarjeta.titulo}
                </CardTitle>
                <div className={`p-1.5 rounded-full ${tarjeta.bgColor}`}>
                  <Icono className={`w-3.5 h-3.5 ${tarjeta.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <div className="text-xl font-bold">{tarjeta.valor}</div>
                  {tarjeta.porcentaje !== undefined && (
                    <div className={`text-xs font-medium ${tarjeta.color}`}>
                      {tarjeta.porcentaje}%
                    </div>
                  )}
                </div>
                
                {tarjeta.porcentaje !== undefined && estadisticas.total > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${tarjeta.gradiente} transition-all duration-500`}
                      style={{ width: `${tarjeta.porcentaje}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
    </div>
  );
};