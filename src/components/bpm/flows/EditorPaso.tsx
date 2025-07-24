import React, { useState } from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { RelacionInput, Input as InputType } from '@/types/bpm/inputs';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, X, Users, FileText, Settings } from 'lucide-react';
import { EditorPasoEjecucion } from './EditorPasoEjecucion';
import { EditorPasoAprobacion } from './EditorPasoAprobacion';
import { ConfiguracionReglasFlujo } from './ConfiguracionReglasFlujo';

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
  onMarcarCompletado?: () => void;
  onRegistrarDecision?: (decision: TipoDecision) => void;
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
  onMarcarCompletado,
  onRegistrarDecision
}) => {
  const [datosEditados, setDatosEditados] = useState<PasoSolicitud | null>(paso);

  React.useEffect(() => {
    setDatosEditados(paso);
  }, [paso]);

  const handleGuardar = () => {
    if (datosEditados) {
      onGuardar(datosEditados);
      onClose();
    }
  };

  const handleCambio = (campo: keyof PasoSolicitud, valor: any) => {
    if (datosEditados) {
      setDatosEditados(prev => prev ? { ...prev, [campo]: valor } : null);
    }
  };

  const handleMarcarCompletado = () => {
    if (datosEditados && onMarcarCompletado) {
      const pasoActualizado = { ...datosEditados, estado: 'completado' as const };
      setDatosEditados(pasoActualizado);
      onGuardar(pasoActualizado);
      onMarcarCompletado();
    }
  };

  const handleRegistrarDecision = (decision: TipoDecision) => {
    if (datosEditados && onRegistrarDecision) {
      const nuevoEstado: PasoSolicitud['estado'] = decision === 'si' ? 'aprobado' : 'rechazado';
      const pasoActualizado = { ...datosEditados, estado: nuevoEstado };
      setDatosEditados(pasoActualizado);
      onGuardar(pasoActualizado);
      onRegistrarDecision(decision);
    }
  };

  if (!datosEditados) return null;

  // Si es panel, renderizar sin Dialog
  if (isPanel) {
    return (
      <>
        <div className="p-4 space-y-6">
          <Tabs defaultValue="configuracion" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="reglas" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Reglas
              </TabsTrigger>
              <TabsTrigger 
                value="ejecucion" 
                disabled={datosEditados.tipo_paso !== 'ejecucion'}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Datos
              </TabsTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={datosEditados.descripcion || ''}
                  onChange={(e) => handleCambio('descripcion', e.target.value)}
                  placeholder="Describe qué se debe hacer en este paso..."
                  rows={3}
                />
              </div>

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
                      Fecha de inicio: {datosEditados.fecha_inicio.toLocaleDateString()}
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
            </TabsContent>

            <TabsContent value="reglas">
              <ConfiguracionReglasFlujo
                paso={datosEditados}
                onUpdatePaso={setDatosEditados}
              />
            </TabsContent>

            <TabsContent value="ejecucion">
              {datosEditados.tipo_paso === 'ejecucion' && (
                <EditorPasoEjecucion
                  paso={datosEditados}
                  onUpdatePaso={onGuardar}
                  onMarcarCompletado={handleMarcarCompletado}
                  relacionesInput={relacionesInput}
                  inputsDisponibles={inputsDisponibles}
                />
              )}
            </TabsContent>

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
        
        <div className="flex gap-2 pt-4 border-t mx-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="reglas" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Reglas
              </TabsTrigger>
              <TabsTrigger 
                value="ejecucion" 
                disabled={datosEditados.tipo_paso !== 'ejecucion'}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Datos
              </TabsTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={datosEditados.descripcion || ''}
                  onChange={(e) => handleCambio('descripcion', e.target.value)}
                  placeholder="Describe qué se debe hacer en este paso..."
                  rows={3}
                />
              </div>

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
                      Fecha de inicio: {datosEditados.fecha_inicio.toLocaleDateString()}
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
            </TabsContent>

            <TabsContent value="reglas">
              <ConfiguracionReglasFlujo
                paso={datosEditados}
                onUpdatePaso={setDatosEditados}
              />
            </TabsContent>

            <TabsContent value="ejecucion">
              {datosEditados.tipo_paso === 'ejecucion' && (
                <EditorPasoEjecucion
                  paso={datosEditados}
                  onUpdatePaso={onGuardar}
                  onMarcarCompletado={handleMarcarCompletado}
                  relacionesInput={relacionesInput}
                  inputsDisponibles={inputsDisponibles}
                />
              )}
            </TabsContent>

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
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};