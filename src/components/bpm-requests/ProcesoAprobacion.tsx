import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TipoDecision } from '@/types/approval';
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX } from 'lucide-react';

interface Props {
  solicitud_id: number;
  miembrosGrupo: number[]; // IDs de los usuarios del grupo
  relacionGrupoAprobacionId?: number; // ID de la relación grupo-aprobación
  onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void;
  // Funciones del hook useAprobacion
  obtenerGrupoPorSolicitud: (solicitud_id: number) => any;
  registrarDecision: (id_usuario: number, relacion_grupo_aprobacion_id: number, decision: TipoDecision, onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void) => void;
  verificarAprobacionCompleta: (solicitud_id: number, miembrosGrupo: number[]) => boolean;
  verificarRechazo: (solicitud_id: number) => boolean;
  obtenerEstadisticasAprobacion: (solicitud_id: number, miembrosGrupo: number[]) => any;
}

export const ProcesoAprobacion: React.FC<Props> = ({ 
  solicitud_id, 
  miembrosGrupo, 
  relacionGrupoAprobacionId,
  onEstadoCambiado,
  obtenerGrupoPorSolicitud,
  registrarDecision,
  verificarAprobacionCompleta,
  verificarRechazo,
  obtenerEstadisticasAprobacion
}) => {

  const [usuarioActual, setUsuarioActual] = useState<number>(miembrosGrupo[0] || 1);
  const [decisionSeleccionada, setDecisionSeleccionada] = useState<TipoDecision>('si');

  const grupo = obtenerGrupoPorSolicitud(solicitud_id);
  const estadisticas = obtenerEstadisticasAprobacion(solicitud_id, miembrosGrupo);
  const estaAprobada = verificarAprobacionCompleta(solicitud_id, miembrosGrupo);
  const estaRechazada = verificarRechazo(solicitud_id);

  const handleRegistrarDecision = () => {
    if (!usuarioActual) {
      console.log('Error: No hay usuario actual');
      return;
    }

    // Usar el relacionGrupoAprobacionId proporcionado o crear uno temporal
    let relacionId = relacionGrupoAprobacionId;
    
    if (!relacionId) {
      // Crear un ID temporal basado en la solicitud
      relacionId = solicitud_id * 1000 + (grupo?.id_grupo || 1);
      console.log('Usando ID de relación temporal:', relacionId);
    }

    registrarDecision(usuarioActual, relacionId, decisionSeleccionada, onEstadoCambiado);
  };

  const obtenerDecisionUsuario = (idUsuario: number): TipoDecision | null => {
    const decision = grupo?.decisiones?.find(d => d.id_usuario === idUsuario);
    return decision?.decision || null;
  };

  const getEstadoIcon = () => {
    if (estaAprobada) return <CheckCircle className="w-5 h-5 text-success" />;
    if (estaRechazada) return <XCircle className="w-5 h-5 text-destructive" />;
    return <Clock className="w-5 h-5 text-warning" />;
  };

  const getEstadoTexto = () => {
    if (estaAprobada) return 'Aprobada';
    if (estaRechazada) return 'Rechazada';
    return 'Pendiente de Aprobación';
  };

  const getEstadoBadge = () => {
    if (estaAprobada) return <Badge variant="success">Aprobada</Badge>;
    if (estaRechazada) return <Badge variant="destructive">Rechazada</Badge>;
    return <Badge variant="warning">Pendiente</Badge>;
  };

  return (
    <Card className="shadow-soft border-request-primary/20">
      <CardHeader className="bg-gradient-secondary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Proceso de Aprobación
          {getEstadoIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Estado General */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{getEstadoTexto()}</h3>
            <p className="text-muted-foreground text-sm">
              {grupo?.nombre || 'Grupo de Aprobación'}
            </p>
          </div>
          {getEstadoBadge()}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{estadisticas.total_miembros}</div>
            <div className="text-xs text-muted-foreground">Total Miembros</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">{estadisticas.aprobaciones}</div>
            <div className="text-xs text-muted-foreground">Aprobaciones</div>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{estadisticas.rechazos}</div>
            <div className="text-xs text-muted-foreground">Rechazos</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{estadisticas.pendientes}</div>
            <div className="text-xs text-muted-foreground">Pendientes</div>
          </div>
        </div>

        <Separator />

        {/* Lista de Miembros y sus Decisiones */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Decisiones por Miembro
          </h4>
          <div className="space-y-2">
            {miembrosGrupo.map(idUsuario => {
              const decision = obtenerDecisionUsuario(idUsuario);
              return (
                <div 
                  key={idUsuario} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <span className="font-medium">Usuario {idUsuario}</span>
                  <div className="flex items-center gap-2">
                    {decision === 'si' && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Aprobó
                      </Badge>
                    )}
                    {decision === 'no' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <UserX className="w-3 h-3" />
                        Rechazó
                      </Badge>
                    )}
                    {!decision && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario para Registrar Decisión */}
        {!estaAprobada && !estaRechazada && (
          <>
            <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Registrar Tu Decisión</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Selecciona Tu Usuario</Label>
                    <select
                      id="usuario"
                      value={usuarioActual}
                      onChange={(e) => setUsuarioActual(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {miembrosGrupo.map(id => (
                        <option key={id} value={id}>
                          Usuario {id} {obtenerDecisionUsuario(id) && '(Ya votó)'}
                        </option>
                      ))}
                    </select>
                    {!miembrosGrupo.includes(usuarioActual) && (
                      <p className="text-xs text-destructive">
                        Solo los miembros del grupo pueden votar
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Decisión</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={decisionSeleccionada === 'si' ? 'default' : 'outline'}
                        onClick={() => setDecisionSeleccionada('si')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        variant={decisionSeleccionada === 'no' ? 'destructive' : 'outline'}
                        onClick={() => setDecisionSeleccionada('no')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleRegistrarDecision}
                      disabled={!miembrosGrupo.includes(usuarioActual)}
                      className="w-full"
                    >
                      Registrar Decisión
                    </Button>
                  </div>
                </div>
              </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};