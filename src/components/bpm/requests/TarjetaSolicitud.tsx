import React from 'react';
import { motion } from 'motion/react';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Solicitud, EstadoSolicitud } from '@/types/bpm/request';
import { normalizeTipoInput, TipoInput } from '@/types/bpm/inputs';
import { Calendar, User, Workflow, MoreHorizontal, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  solicitud: Solicitud;
  onActualizarEstado: (id: number, estado: EstadoSolicitud) => void;
  onEliminar: (id: number) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const getEstadoConfig = (estado: EstadoSolicitud) => {
  switch (estado) {
    case 'aprobado':
      return {
  color: 'bg-request-success text-white',
        icon: CheckCircle,
        gradient: 'bg-gradient-success'
  , badgeBg: 'bg-green-600',
  textColor: 'text-white'
      };
    case 'rechazado':
      return {
  color: 'bg-request-danger text-white',
        icon: XCircle,
        gradient: 'bg-request-danger'
  , badgeBg: 'bg-red-600',
  textColor: 'text-white'
      };
    case 'pendiente':
      return {
  color: 'bg-request-warning text-white',
        icon: Clock,
        gradient: 'bg-request-warning'
  , badgeBg: 'bg-yellow-400',
  textColor: 'text-black'
      };
    default:
      return {
  color: 'bg-muted text-muted-foreground',
  icon: Clock,
  gradient: 'bg-muted',
  badgeBg: 'bg-gray-400',
  textColor: 'text-white'
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

export const TarjetaSolicitud: React.FC<Props> = ({ solicitud, onActualizarEstado, onEliminar, isExpanded = false, onToggle }) => {
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

  const campos = solicitud.campos_dinamicos || [];

  const formatValor = (tipo: TipoInput, raw: string) => {
    if (!raw) return '';
    switch (tipo) {
      case 'date':
        return new Date(raw).toLocaleDateString('es-ES');
      case 'multiplecheckbox':
        try {
          const arr = JSON.parse(raw);
          return Array.isArray(arr) ? arr.join(', ') : String(raw);
        } catch {
          return String(raw);
        }
      case 'archivo':
        // Try to parse expected JSON payload (provider/fileId/directLink)
        try {
          const obj = JSON.parse(raw) as { fileName?: string; name?: string; directLink?: string; link?: string; url?: string };
          const label = obj.fileName || obj.name || 'Archivo';
          const href = obj.directLink || obj.link || obj.url;
          return href ? `${label} (${href})` : label;
        } catch {
          return String(raw);
        }
      default:
        return String(raw);
    }
  };

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
      <CardHeader
        className="flex flex-row items-start justify-between pb-3 cursor-pointer"
        onClick={() => onToggle && onToggle()}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${estadoConfig.gradient}`}>
            <IconoEstado className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {solicitud.nombre || `Solicitud #${solicitud.id_solicitud}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {solicitud.nombre ? `#${solicitud.id_solicitud} • ` : ''}{diasTranscurridos === 0 ? 'Hoy' : `Hace ${diasTranscurridos} días`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Colored dot + badge for distinct estado color */}
          <span className={`inline-block w-2 h-2 rounded-full ${estadoConfig.badgeBg} mr-1`} />
          <Badge className={`${estadoConfig.badgeBg} ${estadoConfig.textColor} px-2 py-0.5` }>
            {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                // evitar que el click del botón propague y dispare el toggle del header
                onClick={(e) => e.stopPropagation()}
                className="transition-smooth hover:bg-gray-100 hover:scale-105"
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

      {isExpanded ? (
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
        {campos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Campos Dinámicos:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campos.map((relacion) => {
                const tipo = normalizeTipoInput((relacion.input as unknown as { tipo_input?: string })?.tipo_input || 'textocorto');
                const label = (relacion.nombre || (relacion.input as unknown as { etiqueta?: string })?.etiqueta || `Campo #${relacion.input_id}`).trim();
                const displayValue = formatValor(tipo, relacion.valor);
                const isLong = tipo === 'textolargo' || String(displayValue).length > 80;

                // In case id_relacion is missing/unstable, fall back to composite key
                const key = `${relacion.id_relacion || 0}-${relacion.input_id}-${label}`;

                // File link extraction (best-effort)
                const fileHref = (() => {
                  if (tipo !== 'archivo' || !relacion.valor) return undefined;
                  try {
                    const obj = JSON.parse(relacion.valor) as { directLink?: string; link?: string; url?: string };
                    return obj.directLink || obj.link || obj.url;
                  } catch {
                    return undefined;
                  }
                })();

                return (
                  <div key={key} className="p-3 bg-muted/40 rounded border border-muted">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-muted-foreground">
                          {label}
                          {relacion.requerido && <span className="text-request-danger ml-1">*</span>}
                        </div>
                        {fileHref ? (
                          <a
                            href={fileHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium underline text-request-primary break-all"
                            title={fileHref}
                          >
                            {displayValue}
                          </a>
                        ) : (
                          <div
                            className={isLong ? 'text-sm font-medium mt-1 whitespace-pre-wrap break-words' : 'text-sm font-medium mt-1 truncate'}
                            title={isLong ? undefined : String(displayValue)}
                          >
                            {displayValue || <span className="text-muted-foreground">(vacío)</span>}
                          </div>
                        )}
                      </div>

                      <span className="shrink-0 text-[10px] bg-request-primary/10 text-request-primary px-2 py-0.5 rounded">
                        {tipo}
                      </span>
                    </div>
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
      ) : null}
    </motion.div>
  );
};