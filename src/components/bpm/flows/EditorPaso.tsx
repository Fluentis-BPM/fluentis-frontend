import React, { useState } from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { RelacionInput, Input as InputType, CamposDinamicos } from '@/types/bpm/inputs';
import { GrupoAprobacion, RelacionGrupoAprobacion, RelacionDecisionUsuario, TipoDecision } from '@/types/bpm/approval';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, X, Users, FileText } from 'lucide-react';
import { EditorPasoEjecucion } from './EditorPasoEjecucion';
import { EditorPasoAprobacion } from './EditorPasoAprobacion';
import { ConfiguracionReglasFlujo } from './ConfiguracionReglasFlujo';
// import { EditorCamposDinamicos } from './EditorCamposDinamicos';
import { fmtDate } from '@/lib/utils';
import { useBpm } from '@/hooks/bpm/useBpm';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { selectPasoDraft } from '@/store/bpm/bpmSlice';

interface EditorPasoProps {
  paso: PasoSolicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (pasoActualizado: PasoSolicitud) => void;
  responsablesDisponibles?: { id: number; nombre: string; rol: string; departamento: string }[];
  isPanel?: boolean;
  // Nuevos props para manejo específico de tipos
  relacionesInput?: RelacionInput[];
  inputsDisponibles?: InputType[];
  gruposAprobacion?: GrupoAprobacion[];
  relacionGrupoAprobacion?: RelacionGrupoAprobacion;
  decisionesUsuarios?: RelacionDecisionUsuario[];
  usuarioActualId?: number;
  onRegistrarDecision?: (decision: TipoDecision) => void;
  // Nuevos props para campos dinámicos
  camposDinamicosIniciales?: RelacionInput[] | CamposDinamicos;
  onValidarCamposDinamicos?: (campos: RelacionInput[]) => boolean;
}

export const EditorPaso: React.FC<EditorPasoProps> = ({
  paso,
  isOpen,
  onClose,
  onGuardar,
  responsablesDisponibles = [],
  isPanel = false,
  relacionesInput = [],
  inputsDisponibles = [],
  gruposAprobacion = [],
  relacionGrupoAprobacion,
  decisionesUsuarios = [],
  usuarioActualId,
  onRegistrarDecision,
  // Nuevas props para campos dinámicos (no utilizados en editor de diseño)
  // camposDinamicosIniciales,
  // onValidarCamposDinamicos
}) => {
  const { stagePasoMetadata } = useBpm();
  const [datosEditados, setDatosEditados] = useState<PasoSolicitud | null>(paso);
  const pasoDraft = useSelector((state: RootState) => datosEditados ? selectPasoDraft(state, datosEditados.id_paso_solicitud) : undefined);

  React.useEffect(() => {
    setDatosEditados(paso);
  }, [paso]);

  // Campos dinámicos se gestionan en componentes especializados

  // Guardado centralizado en "Guardar Todo" global.

  const handleCambio = (campo: keyof PasoSolicitud, valor: string | number | boolean | Date | undefined) => {
    if (!datosEditados) return;
    const next = { ...datosEditados, [campo]: valor } as PasoSolicitud;
    setDatosEditados(next);
    // Stage PascalCase metadata patch
    const patch: Record<string, unknown> = {};
    switch (campo) {
      case 'nombre':
        patch['Nombre'] = valor; break;
      case 'tipo_paso':
        patch['TipoPaso'] = (valor as string)?.toLowerCase() === 'aprobacion' ? 'Aprobacion' : 'Ejecucion'; break;
      case 'responsable_id':
        patch['ResponsableId'] = valor; break;
      case 'regla_aprobacion':
        // Usar snake_case para alinearnos con backend DTO (regla_aprobacion)
        patch['regla_aprobacion'] = valor; break;
      case 'tipo_flujo':
        patch['TipoFlujo'] = valor; break;
      default:
        break;
    }
    if (Object.keys(patch).length > 0) {
      stagePasoMetadata(next.id_paso_solicitud, patch);
    }
  };

  // Marcar como completado se gestiona fuera de Campos; acción removida aquí

  const handleRegistrarDecision = async (decision: TipoDecision) => {
    if (datosEditados && onRegistrarDecision) {
      const nuevoEstado: PasoSolicitud['estado'] = decision === 'si' ? 'aprobado' : 'rechazado';
      setDatosEditados({ ...datosEditados, estado: nuevoEstado });
      onRegistrarDecision(decision);
    }
  };

  if (!datosEditados) return null;

  // Si es panel, renderizar sin Dialog
  if (isPanel) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div />
            {pasoDraft && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700">Cambios sin guardar</Badge>
            )}
          </div>
          <Tabs defaultValue="configuracion" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              {(datosEditados.tipo_paso === 'ejecucion' || datosEditados.tipo_paso === 'inicio') && (
                <TabsTrigger 
                  value="ejecucion" 
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Campos
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="aprobacion" 
                disabled={datosEditados.tipo_paso !== 'aprobacion'}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Aprobación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configuracion" className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Paso</Label>
                  <Input
                    id="nombre"
                    value={datosEditados.nombre}
                    onChange={(e) => handleCambio('nombre', e.target.value)}
                    placeholder="Ej: Revisión de Documentos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_paso">Tipo de Paso</Label>
                  <Select
                    value={datosEditados.tipo_paso}
                    onValueChange={(value) => handleCambio('tipo_paso', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ejecucion">Ejecución</SelectItem>
                      <SelectItem value="aprobacion">Aprobación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campo de descripción removido (no existe en PasoSolicitud) */}

              {/* Asignación de responsable */}
              <div className="space-y-2">
                <Label>Responsable Asignado</Label>
                {responsablesDisponibles.length > 0 ? (
                  <Select
                    value={datosEditados.responsable_id?.toString() || 'unassigned'}
                    onValueChange={(value) => handleCambio('responsable_id', value === 'unassigned' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {responsablesDisponibles.map((responsable) => (
                        <SelectItem key={responsable.id} value={responsable.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{responsable.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {responsable.rol}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {responsable.departamento}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={datosEditados.responsable_id || ''}
                      onChange={(e) => handleCambio('responsable_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="ID del responsable"
                    />
                    <Badge variant="outline" className="whitespace-nowrap">
                      ID Manual
                    </Badge>
                  </div>
                )}
              </div>

              {/* Estado actual */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estado Actual</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha de inicio: {fmtDate(datosEditados.fecha_inicio)}
                    </p>
                  </div>
                  <Badge variant={
                    datosEditados.estado === 'aprobado' ? 'default' :
                    datosEditados.estado === 'rechazado' ? 'destructive' :
                    datosEditados.estado === 'excepcion' ? 'secondary' : 'outline'
                  }>
                    {datosEditados.estado}
                  </Badge>
                </div>
              </div>

              {/* Reglas (embebidas) */}
              <div className="mt-4">
                <ConfiguracionReglasFlujo
                  paso={datosEditados}
                  onUpdatePaso={(p) => {
                    setDatosEditados(p);
                    // Map changes to staging
                    const patch: Record<string, unknown> = {
                      TipoFlujo: p.tipo_flujo,
                    };
                    if (p.tipo_paso === 'aprobacion') {
                      patch['regla_aprobacion'] = p.regla_aprobacion;
                    }
                    stagePasoMetadata(p.id_paso_solicitud, patch);
                  }}
                  showTipoFlujo={false}
                />
              </div>
            </TabsContent>

              {(datosEditados.tipo_paso === 'ejecucion' || datosEditados.tipo_paso === 'inicio') && (
              <TabsContent value="ejecucion">
                <EditorPasoEjecucion
                  paso={datosEditados}
                  relacionesInput={relacionesInput}
                  inputsDisponibles={inputsDisponibles}
                  readOnly={datosEditados.tipo_paso === 'inicio'}
                />
              </TabsContent>
            )}

            <TabsContent value="aprobacion">
              {datosEditados.tipo_paso === 'aprobacion' && (
                <EditorPasoAprobacion
                  paso={datosEditados}
                  onUpdatePaso={onGuardar}
                  onRegistrarDecision={handleRegistrarDecision}
                  gruposDisponibles={gruposAprobacion}
                  relacionGrupo={relacionGrupoAprobacion}
                  decisiones={decisionesUsuarios}
                  usuarioActualId={usuarioActualId}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex gap-3 p-6 border-t bg-gray-50/50">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  // Renderizado como Dialog (modo original)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Paso - {datosEditados.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="configuracion" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              {(datosEditados.tipo_paso === 'ejecucion' || datosEditados.tipo_paso === 'inicio') && (
                <TabsTrigger 
                  value="ejecucion" 
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Campos
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="aprobacion" 
                disabled={datosEditados.tipo_paso !== 'aprobacion'}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Aprobación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configuracion" className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Paso</Label>
                  <Input
                    id="nombre"
                    value={datosEditados.nombre}
                    onChange={(e) => handleCambio('nombre', e.target.value)}
                    placeholder="Ej: Revisión de Documentos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_paso">Tipo de Paso</Label>
                  <Select
                    value={datosEditados.tipo_paso}
                    onValueChange={(value) => handleCambio('tipo_paso', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ejecucion">Ejecución</SelectItem>
                      <SelectItem value="aprobacion">Aprobación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campo de descripción removido (no existe en PasoSolicitud) */}

              {/* Asignación de responsable */}
              <div className="space-y-2">
                <Label>Responsable Asignado</Label>
                {responsablesDisponibles.length > 0 ? (
                  <Select
                    value={datosEditados.responsable_id?.toString() || 'unassigned'}
                    onValueChange={(value) => handleCambio('responsable_id', value === 'unassigned' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {responsablesDisponibles.map((responsable) => (
                        <SelectItem key={responsable.id} value={responsable.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{responsable.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {responsable.rol}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {responsable.departamento}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={datosEditados.responsable_id || ''}
                      onChange={(e) => handleCambio('responsable_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="ID del responsable"
                    />
                    <Badge variant="outline" className="whitespace-nowrap">
                      ID Manual
                    </Badge>
                  </div>
                )}
              </div>

              {/* Estado actual */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estado Actual</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha de inicio: {fmtDate(datosEditados.fecha_inicio)}
                    </p>
                  </div>
                  <Badge variant={
                    datosEditados.estado === 'aprobado' ? 'default' :
                    datosEditados.estado === 'rechazado' ? 'destructive' :
                    datosEditados.estado === 'excepcion' ? 'secondary' : 'outline'
                  }>
                    {datosEditados.estado}
                  </Badge>
                </div>
              </div>

              {/* Reglas (embebidas) */}
              <div className="mt-4">
                <ConfiguracionReglasFlujo
                  paso={datosEditados}
                  onUpdatePaso={(p) => {
                    setDatosEditados(p);
                    const patch: Record<string, unknown> = {
                      TipoFlujo: p.tipo_flujo,
                    };
                    if (p.tipo_paso === 'aprobacion') {
                      patch['regla_aprobacion'] = p.regla_aprobacion;
                    }
                    stagePasoMetadata(p.id_paso_solicitud, patch);
                  }}
                  showTipoFlujo={false}
                />
              </div>
            </TabsContent>

              {(datosEditados.tipo_paso === 'ejecucion' || datosEditados.tipo_paso === 'inicio') && (
              <TabsContent value="ejecucion">
                <EditorPasoEjecucion
                  paso={datosEditados}
                  relacionesInput={relacionesInput}
                  inputsDisponibles={inputsDisponibles}
                  readOnly={datosEditados.tipo_paso === 'inicio'}
                />
              </TabsContent>
            )}

            <TabsContent value="aprobacion">
              {datosEditados.tipo_paso === 'aprobacion' && (
                <EditorPasoAprobacion
                  paso={datosEditados}
                  onUpdatePaso={onGuardar}
                  onRegistrarDecision={handleRegistrarDecision}
                  gruposDisponibles={gruposAprobacion}
                  relacionGrupo={relacionGrupoAprobacion}
                  decisiones={decisionesUsuarios}
                  usuarioActualId={usuarioActualId}
                />
              )}
            </TabsContent>

          </Tabs>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};