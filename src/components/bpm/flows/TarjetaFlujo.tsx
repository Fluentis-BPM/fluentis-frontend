import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Workflow, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  FileText,
  Square,
  Eye
} from 'lucide-react';
import { FlujoActivo, EstadoFlujo, PasoSolicitud } from '@/types/bpm/flow';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  flujo: FlujoActivo;
  pasos?: PasoSolicitud[];
  onActualizarEstado: (flujo_id: number, estado: EstadoFlujo) => void;
  onVerDetalles?: (flujo_id: number) => void;
  onVerDiagrama?: (flujo_id: number) => void;
}

export const TarjetaFlujo: React.FC<Props> = ({ 
  flujo, 
  pasos = [], 
  onActualizarEstado,
  onVerDetalles,
  onVerDiagrama
}) => {
  
  const getEstadoIcon = () => {
    switch (flujo.estado) {
      case 'encurso':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'finalizado':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  const getEstadoBadge = () => {
    switch (flujo.estado) {
      case 'encurso':
        return <Badge variant="warning">En Curso</Badge>;
      case 'finalizado':
        return <Badge variant="success">Finalizado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getDuracion = () => {
    const fechaFin = flujo.fecha_finalizacion || new Date();
    return formatDistance(flujo.fecha_inicio, fechaFin, { 
      locale: es,
      addSuffix: false 
    });
  };

  const pasosCompletados = pasos.filter(p => p.estado === 'completado').length;
  const progreso = pasos.length > 0 ? (pasosCompletados / pasos.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3, scale: 1.02 }}
    >
      <Card className="shadow-soft hover:shadow-elegant transition-smooth">
        <CardHeader className="bg-gradient-secondary text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              <span>Flujo #{flujo.id_flujo_activo}</span>
              {getEstadoIcon()}
            </div>
            <div className="flex items-center gap-2">
              {getEstadoBadge()}
            </div>
          </CardTitle>
        </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Solicitud</p>
            <p className="font-medium">#{flujo.solicitud_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Plantilla</p>
            <p className="font-medium">
              {flujo.flujo_ejecucion_id ? `#${flujo.flujo_ejecucion_id}` : 'Sin plantilla'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Información temporal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Iniciado:</span>
            </div>
            <span className="font-medium">
              {flujo.fecha_inicio.toLocaleDateString('es-ES')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duración:</span>
            </div>
            <span className="font-medium">{getDuracion()}</span>
          </div>
        </div>

        {/* Progreso de pasos */}
        {pasos.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{pasosCompletados}/{pasos.length} pasos</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-smooth"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                {Math.round(progreso)}% completado
              </p>
            </div>
          </>
        )}

        {/* Datos adicionales */}
        {(flujo.datos_solicitud || flujo.campos_dinamicos) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Información de la solicitud incluida</span>
              </div>
              
              {flujo.datos_solicitud && (
                <div className="text-xs text-muted-foreground">
                  • Datos base de la solicitud
                </div>
              )}
              
              {flujo.campos_dinamicos && (
                <div className="text-xs text-muted-foreground">
                  • Campos dinámicos personalizados
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          {onVerDiagrama && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDiagrama(flujo.id_flujo_activo)}
              className="flex items-center gap-1 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 transition-smooth"
            >
              <Workflow className="w-3 h-3" />
              Ver Diagrama
            </Button>
          )}
          
          {flujo.estado === 'encurso' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActualizarEstado(flujo.id_flujo_activo, 'finalizado')}
                className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-500 hover:text-white hover:scale-105 transition-smooth"
              >
                <Square className="w-3 h-3" />
                Finalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActualizarEstado(flujo.id_flujo_activo, 'cancelado')}
                className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:scale-105 transition-smooth"
              >
                <XCircle className="w-3 h-3" />
                Cancelar
              </Button>
            </>
          )}
          
          {onVerDetalles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalles(flujo.id_flujo_activo)}
              className="flex items-center gap-1 ml-auto border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white hover:scale-105 transition-smooth"
            >
              <Eye className="w-3 h-3" />
              Detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
  );
};