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
import { Edit, Save, X, Users, FileText, Database } from 'lucide-react';
import { EditorPasoEjecucion } from './EditorPasoEjecucion';
import { EditorPasoAprobacion } from './EditorPasoAprobacion';
import { ConfiguracionReglasFlujo } from './ConfiguracionReglasFlujo';
import { EditorCamposDinamicos } from './EditorCamposDinamicos';
import { fmtDate } from '@/lib/utils';

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
  onMarcarCompletado,
  onRegistrarDecision,
  // Nuevas props para campos dinámicos
  camposDinamicosIniciales,
  onValidarCamposDinamicos
}) => {
  const [datosEditados, setDatosEditados] = useState<PasoSolicitud | null>(paso);
  const [camposDinamicosEditados, setCamposDinamicosEditados] = useState<RelacionInput[]>([]);
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);

  React.useEffect(() => {
    setDatosEditados(paso);
    // Inicializar campos dinámicos si es paso inicial
  if (paso && paso.tipo_paso === 'inicio' && camposDinamicosIniciales) {
      if (Array.isArray(camposDinamicosIniciales)) {
        setCamposDinamicosEditados([...camposDinamicosIniciales]);
      } else {
        // Convertir objeto CamposDinamicos a array RelacionInput
        const camposArray: RelacionInput[] = Object.entries(camposDinamicosIniciales).map(([input_id, campo]) => ({
          id_relacion: parseInt(input_id),
          input_id: parseInt(input_id),
          paso_solicitud_id: paso.id_paso_solicitud,
          valor: campo.valor,
          requerido: campo.requerido,
          input: inputsDisponibles.find(inp => inp.id_input === parseInt(input_id))
        }));
        setCamposDinamicosEditados(camposArray);
      }
    }
  }, [paso, camposDinamicosIniciales, inputsDisponibles]);

  // Función para validar campos dinámicos
  const validarCamposDinamicos = (campos: RelacionInput[]): string[] => {
    const errores: string[] = [];
    
    campos.forEach(campo => {
      const inputDef = inputsDisponibles.find(inp => inp.id_input === campo.input_id);
      if (campo.requerido && (!campo.valor || campo.valor.trim() === '')) {
        const inputNombre = inputDef?.etiqueta || `Campo ${campo.input_id}`;
        errores.push(`${inputNombre} es requerido`);
      }

      // Validaciones específicas por tipo
      if (inputDef?.validacion && campo.valor) {
        const validacion = inputDef.validacion;

        if (validacion.min && campo.valor.length < validacion.min) {
          errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} debe tener al menos ${validacion.min} caracteres`);
        }

        if (validacion.max && campo.valor.length > validacion.max) {
          errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} no puede exceder ${validacion.max} caracteres`);
        }

        if (validacion.pattern && !new RegExp(validacion.pattern).test(campo.valor)) {
          errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} no tiene el formato correcto`);
        }

        if (inputDef.tipo_input === 'number') {
          const numValue = parseFloat(campo.valor);
          if (isNaN(numValue)) {
            errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} debe ser un número válido`);
          } else {
            if (validacion.min && numValue < validacion.min) {
              errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} debe ser mayor o igual a ${validacion.min}`);
            }
            if (validacion.max && numValue > validacion.max) {
              errores.push(`${inputDef.etiqueta || `Campo ${campo.input_id}`} debe ser menor o igual a ${validacion.max}`);
            }
          }
        }
      }
    });
    
    return errores;
  };

  const handleCambioCampoDinamico = (inputId: number, valor: string) => {
    setCamposDinamicosEditados(prev => 
      prev.map(campo => 
        campo.input_id === inputId 
          ? { ...campo, valor }
          : campo
      )
    );
    
    // Validar en tiempo real
    const camposActualizados = camposDinamicosEditados.map(campo => 
      campo.input_id === inputId ? { ...campo, valor } : campo
    );
    const errores = validarCamposDinamicos(camposActualizados);
    setErroresValidacion(errores);
  };

  const handleToggleRequerido = (inputId: number, requerido: boolean) => {
    setCamposDinamicosEditados(prev => 
      prev.map(campo => 
        campo.input_id === inputId 
          ? { ...campo, requerido }
          : campo
      )
    );
  };

  const handleGuardar = () => {
    if (datosEditados) {
      // Validar campos dinámicos si es paso inicial
  if (datosEditados.tipo_paso === 'inicio' && camposDinamicosEditados.length > 0) {
        const errores = validarCamposDinamicos(camposDinamicosEditados);
        setErroresValidacion(errores);
        
        if (errores.length > 0) {
          return; // No guardar si hay errores
        }
        
        // Llamar validación personalizada si existe
        if (onValidarCamposDinamicos && !onValidarCamposDinamicos(camposDinamicosEditados)) {
          return;
        }
        
        // Actualizar campos dinámicos en el paso
        const pasoConCampos = {
          ...datosEditados,
          campos_dinamicos: camposDinamicosEditados
        };
        onGuardar(pasoConCampos);
      } else {
        onGuardar(datosEditados);
      }
      onClose();
    }
  };

  const handleCambio = (campo: keyof PasoSolicitud, valor: string | number | boolean | Date | undefined) => {
    if (datosEditados) {
      setDatosEditados(prev => prev ? { ...prev, [campo]: valor } : null);
    }
  };

  const handleMarcarCompletado = () => {
    if (datosEditados && onMarcarCompletado) {
  const pasoActualizado = { ...datosEditados, estado: 'entregado' as const };
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
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs defaultValue="configuracion" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger 
                value="campos-dinamicos"
                disabled={datosEditados.tipo_paso !== 'inicio'}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Campos
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
                  onUpdatePaso={(p) => setDatosEditados(p)}
                  showTipoFlujo={false}
                />
              </div>
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

            <TabsContent value="campos-dinamicos">
              <EditorCamposDinamicos
                camposDinamicos={camposDinamicosEditados}
                erroresValidacion={erroresValidacion}
                onCambioCampo={handleCambioCampoDinamico}
                onToggleRequerido={handleToggleRequerido}
                esInicial={datosEditados.tipo_paso === 'inicio'}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex gap-3 p-6 border-t bg-gray-50/50">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger 
                value="campos-dinamicos"
                disabled={datosEditados.tipo_paso !== 'inicio'}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Campos
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
                  onUpdatePaso={setDatosEditados}
                  showTipoFlujo={false}
                />
              </div>
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

            <TabsContent value="campos-dinamicos">
              <EditorCamposDinamicos
                camposDinamicos={camposDinamicosEditados}
                erroresValidacion={erroresValidacion}
                onCambioCampo={handleCambioCampoDinamico}
                onToggleRequerido={handleToggleRequerido}
                esInicial={datosEditados.tipo_paso === 'inicio'}
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};