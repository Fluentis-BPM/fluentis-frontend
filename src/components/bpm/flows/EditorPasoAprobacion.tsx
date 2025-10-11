import React, { useState, useEffect } from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { GrupoAprobacion, RelacionGrupoAprobacion, RelacionDecisionUsuario, TipoDecision } from '@/types/bpm/approval';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { useBpm } from '@/hooks/bpm/useBpm';
import { useToast } from '@/hooks/bpm/use-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { selectPasoDraft } from '@/store/bpm/bpmSlice';

interface EditorPasoAprobacionProps {
  paso: PasoSolicitud;
  onUpdatePaso: (paso: PasoSolicitud) => void;
  onRegistrarDecision: (decision: TipoDecision) => void;
  gruposDisponibles?: GrupoAprobacion[];
  relacionGrupo?: RelacionGrupoAprobacion;
  decisiones?: RelacionDecisionUsuario[];
  usuarioActualId?: number;
}

export const EditorPasoAprobacion: React.FC<EditorPasoAprobacionProps> = ({
  paso,
  onRegistrarDecision,
  gruposDisponibles = [],
  relacionGrupo,
  decisiones = [],
  usuarioActualId
}) => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | undefined>(relacionGrupo?.grupo_aprobacion_id);
  const [miDecision, setMiDecision] = useState<TipoDecision | undefined>();
  const { stageGroupApproval } = useBpm();
  const { toast } = useToast();
  const draft = useSelector((state: RootState) => selectPasoDraft(state, paso.id_paso_solicitud));

  // Cargar mi decisión si ya existe
  useEffect(() => {
    if (usuarioActualId && relacionGrupo) {
      const miDecisionExistente = decisiones.find(
        d => d.id_usuario === usuarioActualId && d.relacion_grupo_aprobacion_id === relacionGrupo.id_relacion
      );
      if (miDecisionExistente) {
        setMiDecision(miDecisionExistente.decision);
      }
    }
  }, [usuarioActualId, relacionGrupo, decisiones]);

  const asignarGrupo = () => {
    if (!grupoSeleccionado) return;
    stageGroupApproval(paso.id_paso_solicitud, grupoSeleccionado);
    toast({ title: 'Grupo preparado', description: 'Se asignará el grupo al guardar todos los cambios.' });
  };

  const quitarGrupo = () => {
    stageGroupApproval(paso.id_paso_solicitud, null);
    setGrupoSeleccionado(undefined);
    toast({ title: 'Remoción preparada', description: 'Se quitará el grupo al guardar todos los cambios.' });
  };

  const registrarDecision = (decision: TipoDecision) => {
    setMiDecision(decision);
    onRegistrarDecision(decision);
  };

  // Usar relacion proporcionada o derivarla del paso (si viene cargada en pasosPorFlujo)
  const relacionActual: RelacionGrupoAprobacion | undefined = relacionGrupo || (paso.relacionesGrupoAprobacion && paso.relacionesGrupoAprobacion[0] as unknown as RelacionGrupoAprobacion);
  const stagedGrupoId = draft && Object.prototype.hasOwnProperty.call(draft, 'groupApprovalId') ? draft.groupApprovalId : undefined;
  const grupoIdEfectivo = stagedGrupoId !== undefined ? stagedGrupoId ?? undefined : relacionActual?.grupo_aprobacion_id;
  const grupoAsignado = gruposDisponibles.find(g => g.id_grupo === grupoIdEfectivo);

  // Mantener el selector sincronizado con el estado efectivo (staged o actual)
  useEffect(() => {
    setGrupoSeleccionado(grupoIdEfectivo);
  }, [grupoIdEfectivo]);
  
  // Simular miembros del grupo (en una implementación real vendría de la base de datos)
  const miembrosGrupo = [
    { id: 1, nombre: 'Juan Pérez', rol: 'Supervisor' },
    { id: 2, nombre: 'María García', rol: 'Gerente' },
    { id: 3, nombre: 'Carlos López', rol: 'Director' }
  ];

  const decisionesPorUsuario = decisiones.reduce((acc, decision) => {
    acc[decision.id_usuario] = decision.decision;
    return acc;
  }, {} as Record<number, TipoDecision>);

  const totalDecisiones = decisiones.length;
  const aprobaciones = decisiones.filter(d => d.decision === 'si').length;
  const rechazos = decisiones.filter(d => d.decision === 'no').length;

  const puedeDecidor = usuarioActualId && miembrosGrupo.some(m => m.id === usuarioActualId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Paso de Aprobación
          </h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las decisiones del grupo de aprobación
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          Aprobación
        </Badge>
      </div>

      {/* Asignación de grupo */}
  {!grupoAsignado ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Asignar Grupo de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Grupo</Label>
              <Select 
                value={grupoSeleccionado?.toString()} 
                onValueChange={(value) => setGrupoSeleccionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo de aprobación..." />
                </SelectTrigger>
                <SelectContent>
                  {gruposDisponibles.map((grupo) => (
                    <SelectItem key={grupo.id_grupo} value={grupo.id_grupo.toString()}>
                      {grupo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
    <Button onClick={asignarGrupo} disabled={!grupoSeleccionado} className="w-full">
              Asignar Grupo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              {grupoAsignado.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Acciones del grupo asignado */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-amber-700 bg-amber-50">
                Cambios {stagedGrupoId !== undefined ? 'sin guardar' : 'guardados'}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={quitarGrupo}>
                  Quitar grupo
                </Button>
              </div>
            </div>
            {/* Estadísticas de decisiones */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{aprobaciones}</div>
                <div className="text-sm text-green-700">Aprobaciones</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{rechazos}</div>
                <div className="text-sm text-red-700">Rechazos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{totalDecisiones}</div>
                <div className="text-sm text-gray-700">Total</div>
              </div>
            </div>

            <Separator />

            {/* Mi decisión */}
            {puedeDecidor && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Mi Decisión
                </Label>
                {!miDecision ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => registrarDecision('si')} 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button 
                      onClick={() => registrarDecision('no')} 
                      variant="destructive" 
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      {miDecision === 'si' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        Has {miDecision === 'si' ? 'aprobado' : 'rechazado'} este paso
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Lista de miembros y sus decisiones */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Decisiones del Grupo
              </Label>
              <div className="space-y-2">
                {miembrosGrupo.map((miembro) => {
                  const decision = decisionesPorUsuario[miembro.id];
                  return (
                    <div key={miembro.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {miembro.nombre.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{miembro.nombre}</p>
                          <p className="text-xs text-muted-foreground">{miembro.rol}</p>
                        </div>
                      </div>
                      <div>
                        {decision ? (
                          <Badge variant={decision === 'si' ? 'default' : 'destructive'}>
                            {decision === 'si' ? 'Aprobado' : 'Rechazado'}
                          </Badge>
                        ) : (
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
          </CardContent>
        </Card>
      )}

      {/* Información del paso */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado: {paso.estado}</p>
              <p className="text-sm text-muted-foreground">
                Grupo: {grupoAsignado?.nombre || 'No asignado'}
              </p>
            </div>
            <Badge variant={
              paso.estado === 'aprobado' ? 'default' :
              paso.estado === 'rechazado' ? 'destructive' :
              paso.estado === 'pendiente' ? 'secondary' : 'outline'
            }>
              {paso.estado}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};