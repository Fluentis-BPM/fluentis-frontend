import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Flujos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        whileHover={{ y: -2, scale: 1.02 }}
      >
        <Card className="shadow-soft hover:shadow-elegant transition-smooth h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flujos</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {estadisticas.total_flujos}
            </div>
            <p className="text-xs text-muted-foreground">
              Flujos registrados en el sistema
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* En Curso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        whileHover={{ y: -2, scale: 1.02 }}
      >
        <Card className="shadow-soft hover:shadow-elegant transition-smooth h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Curso</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {estadisticas.en_curso}
            </div>
            <p className="text-xs text-muted-foreground">
              Flujos actualmente ejecutándose
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Finalizados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ y: -2, scale: 1.02 }}
      >
        <Card className="shadow-soft hover:shadow-elegant transition-smooth h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {estadisticas.finalizados}
            </div>
            <p className="text-xs text-muted-foreground">
              Flujos completados exitosamente
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancelados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        whileHover={{ y: -2, scale: 1.02 }}
      >
        <Card className="shadow-soft hover:shadow-elegant transition-smooth h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {estadisticas.cancelados}
            </div>
            <p className="text-xs text-muted-foreground">
              Flujos cancelados o fallidos
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};