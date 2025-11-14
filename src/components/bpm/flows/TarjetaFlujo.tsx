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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FlujoActivo, EstadoFlujo, PasoSolicitud } from '@/types/bpm/flow';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  flujo: FlujoActivo;
  pasos?: PasoSolicitud[];
  onActualizarEstado: (flujo_id: number, estado: EstadoFlujo) => void;
  onVerDetalles?: (flujo_id: number) => void;
  onVerDiagrama?: (flujo_id: number) => void;
  vista?: 'lista' | 'grid'; // Nueva prop para controlar la vista
}

export const TarjetaFlujo: React.FC<Props> = ({ 
  flujo, 
  pasos = [], 
  // onActualizarEstado,
  onVerDetalles,
  onVerDiagrama,
  vista = 'grid'
}) => {
  // Helper to safely parse different date shapes coming from API
  const parseDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number' || typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };
  
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
    const start = parseDate(flujo.fecha_inicio);
    const end = parseDate(flujo.fecha_finalizacion) || new Date();
    if (!start) return 'Desconocida';
    return formatDistance(start, end, { 
      locale: es,
      addSuffix: false 
    });
  };

  // Consider a paso completed when it's aprobado or entregado
  const pasosCompletados = pasos.filter(p => p.estado === 'aprobado' || p.estado === 'entregado').length;
  const progreso = pasos.length > 0 ? (pasosCompletados / pasos.length) * 100 : 0;

  // Vista compacta para lista (filas)
  if (vista === 'lista') {
    return (
      <Card className="shadow-soft hover:shadow-elegant transition-smooth">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Información principal */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getEstadoIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-semibold text-sm truncate" title={flujo.nombre || `Flujo #${flujo.id_flujo_activo}`}>
                          {flujo.nombre || `Flujo #${flujo.id_flujo_activo}`}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{flujo.nombre || `Flujo #${flujo.id_flujo_activo}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {getEstadoBadge()}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Solicitud #{flujo.solicitud_id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      const d = parseDate(flujo.fecha_inicio);
                      return d ? d.toLocaleDateString('es-ES') : 'Desconocido';
                    })()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getDuracion()}
                  </span>
                  {pasos.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      {pasosCompletados}/{pasos.length} pasos ({Math.round(progreso)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {onVerDiagrama && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVerDiagrama(flujo.id_flujo_activo)}
                  className="flex items-center gap-1 border-primary text-primary hover:bg-primary hover:text-white h-8"
                >
                  <Workflow className="w-3 h-3" />
                  Ver Diagrama
                </Button>
              )}
              
              {/* {flujo.estado === 'encurso' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActualizarEstado(flujo.id_flujo_activo, 'finalizado')}
                    className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-500 hover:text-white h-8"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Finalizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActualizarEstado(flujo.id_flujo_activo, 'cancelado')}
                    className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-500 hover:text-white h-8"
                  >
                    <XCircle className="w-3 h-3" />
                    Cancelar
                  </Button>
                </>
              )} */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista de cuadros (grid) - original completa
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
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Workflow className="w-5 h-5 flex-shrink-0" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate" title={flujo.nombre ? `Flujo para: ${flujo.nombre}` : `Flujo #${flujo.id_flujo_activo}`}>
                      {flujo.nombre ? `Flujo para: ${flujo.nombre}` : `Flujo #${flujo.id_flujo_activo}`}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flujo.nombre ? `Flujo para: ${flujo.nombre}` : `Flujo #${flujo.id_flujo_activo}`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {getEstadoIcon()}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
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
              {(() => {
                const d = parseDate(flujo.fecha_inicio);
                return d ? d.toLocaleDateString('es-ES') : 'Desconocido';
              })()}
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
        {(flujo.datos_solicitud) && (
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
          
          {/* {flujo.estado === 'encurso' && (
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
          )} */}
          
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