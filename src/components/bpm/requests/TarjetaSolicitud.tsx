import React from 'react';
import { motion } from 'motion/react';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Solicitud, EstadoSolicitud } from '@/types/bpm/request';
import { INPUT_TEMPLATES } from '@/types/bpm/inputs';
import { Calendar, User, Workflow, MoreHorizontal, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  solicitud: Solicitud;
  onActualizarEstado: (id: number, estado: EstadoSolicitud) => void;
  onEliminar: (id: number) => void;
}

const getEstadoConfig = (estado: EstadoSolicitud) => {
  switch (estado) {
    case 'aprobado':
      return {
        color: 'bg-request-success text-white',
        icon: CheckCircle,
        gradient: 'bg-gradient-success'
      };
    case 'rechazado':
      return {
        color: 'bg-request-danger text-white',
        icon: XCircle,
        gradient: 'bg-request-danger'
      };
    case 'pendiente':
      return {
        color: 'bg-request-warning text-white',
        icon: Clock,
        gradient: 'bg-request-warning'
      };
    default:
      return {
        color: 'bg-muted text-muted-foreground',
        icon: Clock,
        gradient: 'bg-muted'
      };
  }
};

const parseFecha = (f: string | Date) => (typeof f === 'string' ? new Date(f) : f);

const formatearFecha = (fecha: string | Date) => {
  const d = parseFecha(fecha);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const calcularDiasTranscurridos = (fecha: string | Date) => {
  const ahora = new Date();
  const diferencia = ahora.getTime() - parseFecha(fecha).getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

export const TarjetaSolicitud: React.FC<Props> = ({ solicitud, onActualizarEstado, onEliminar }) => {
  const estadoConfig = getEstadoConfig(solicitud.estado);
  const IconoEstado = estadoConfig.icon;
  const diasTranscurridos = calcularDiasTranscurridos(solicitud.fecha_creacion);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'border-l-request-danger';
      case 'alta': return 'border-l-request-warning';
      case 'media': return 'border-l-request-primary';
      case 'baja': return 'border-l-muted';
      default: return 'border-l-muted';
    }
  };

  const prioridad = String(solicitud.datos_adicionales?.prioridad ?? 'media');

  return (
    <motion.div
      className={`rounded-lg border bg-card text-card-foreground shadow-soft border-l-4 ${getPrioridadColor(prioridad)} group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
      }}
      whileTap={{ scale: 0.98 }}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${estadoConfig.gradient}`}>
            <IconoEstado className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Solicitud #{solicitud.id_solicitud}</h3>
            <p className="text-sm text-muted-foreground">
              {diasTranscurridos === 0 ? 'Hoy' : `Hace ${diasTranscurridos} días`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={estadoConfig.color}>
            {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-smooth hover:bg-gray-100 hover:scale-105"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem 
                onClick={() => onActualizarEstado(solicitud.id_solicitud, 'aprobado')}
                className="text-green-600 hover:bg-green-50 transition-smooth cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onActualizarEstado(solicitud.id_solicitud, 'rechazado')}
                className="text-red-600 hover:bg-red-50 transition-smooth cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onActualizarEstado(solicitud.id_solicitud, 'pendiente')}
                className="text-yellow-600 hover:bg-yellow-50 transition-smooth cursor-pointer"
              >
                <Clock className="w-4 h-4 mr-2" />
                Marcar Pendiente
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEliminar(solicitud.id_solicitud)}
                className="text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Solicitante:</span>
            <span className="font-medium">#{solicitud.solicitante_id}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Creado:</span>
            <span className="font-medium">{formatearFecha(solicitud.fecha_creacion)}</span>
          </div>
          
          {solicitud.flujo_base_id && (
            <div className="flex items-center gap-2 col-span-2">
              <Workflow className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Plantilla:</span>
              <span className="font-medium">#{solicitud.flujo_base_id}</span>
            </div>
          )}
        </div>

        {/* Descripción si existe */}
        {solicitud.datos_adicionales?.descripcion && (
          <div className="p-3 bg-gradient-card rounded-lg border">
            <p className="text-sm text-foreground/90">
              {String(solicitud.datos_adicionales.descripcion)}
            </p>
          </div>
        )}

        {/* Campos dinámicos */}
        {solicitud.campos_dinamicos && solicitud.campos_dinamicos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Campos Dinámicos:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {solicitud.campos_dinamicos.map((relacion) => {
                const input = INPUT_TEMPLATES.find(i => i.id_input === relacion.input_id);
                if (!input || !relacion.valor) return null;

                const displayValue = (() => {
                  switch (input.tipo_input) {
                    case 'date':
                      return new Date(relacion.valor).toLocaleDateString('es-ES');
                    case 'multiplecheckbox':
                      try {
                        const opciones = JSON.parse(relacion.valor);
                        return opciones.join(', ');
                      } catch {
                        return relacion.valor;
                      }
                    case 'archivo':
                      return `📎 ${relacion.valor}`;
                    case 'number':
                      return `${relacion.valor}${input.etiqueta?.includes('Presupuesto') ? ' €' : ''}`;
                    default:
                      return relacion.valor;
                  }
                })();

                return (
                  <div key={relacion.id_relacion} className="p-2 bg-muted/50 rounded border-l-2 border-request-primary/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {input.etiqueta}
                        {relacion.requerido && <span className="text-request-danger ml-1">*</span>}
                      </span>
                      <span className="text-xs bg-request-primary/10 text-request-primary px-1 rounded">
                        {input.tipo_input}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 truncate" title={displayValue}>
                      {displayValue}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prioridad */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prioridad:</span>
            <Badge variant="outline" className={`${getPrioridadColor(prioridad)} border-l-2`}>
              {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );
};