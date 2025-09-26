import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DiagramaFlujo } from './DiagramaFlujo';
import { EditorPaso } from './EditorPaso';
import FlowViewerPage from '@/pages/bpm/FlowViewerPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FlujoActivo, PasoSolicitud } from '@/types/bpm/flow';
import { 
  Workflow, 
  Eye, 
  Edit, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';
import { useBpm } from '@/hooks/bpm/useBpm'; // Nuevo import para usar el estado global
import { useAprobations } from '@/hooks/equipos/aprobations/useAprobations';
import { useUsers } from '@/hooks/users/useUsers';

interface VistaDiagramaFlujoProps {
  flujo: FlujoActivo;
  onVolverALista?: () => void; // Solo mantenemos esta prop para volver a la lista
}

export const VistaDiagramaFlujo: React.FC<VistaDiagramaFlujoProps> = ({
  flujo,
  onVolverALista,
}) => {
  const { 
    pasosPorFlujo, 
    caminosPorFlujo, 
    loading, 
    error, 
    loadPasosYConexiones,
    createPasoSolicitud,
    updatePasoSolicitud,
    deletePasoSolicitud,
    createConexionPaso,
    putConexionesPaso,
    deleteConexionPaso,
    lastActionError,
    isAnyDirty,
    commitAllPasoDrafts,
    clearAllDrafts
  } = useBpm();
  const { grupos: gruposAprobacion } = useAprobations();
  // Load real users to replace mock responsables list used previously
  const { users: allUsers } = useUsers();
  const { toast } = useToast();
  const [modoEdicion, setModoEdicion] = useState(true); // Empezar en modo edición por defecto
  const [pasoEditando, setPasoEditando] = useState<PasoSolicitud | null>(null);
  const [diagramaKey, setDiagramaKey] = useState(0); // Para forzar re-render
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(480); // Width for resizable editor
  const [isResizing, setIsResizing] = useState(false);
  const [mostrarPantallaCompleta, setMostrarPantallaCompleta] = useState(false);

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

  // Obtener pasos y caminos del estado global
  const pasos = pasosPorFlujo[flujo.id_flujo_activo] || [];
  const caminos = caminosPorFlujo[flujo.id_flujo_activo] || [];

  // Estadísticas calculadas localmente
  const estadisticasPasos = {
    total: pasos.length,
    pendientes: pasos.filter(p => p.estado === 'pendiente').length,
    aprobados: pasos.filter(p => p.estado === 'aprobado').length,
    rechazados: pasos.filter(p => p.estado === 'rechazado').length,
    excepciones: pasos.filter(p => p.estado === 'excepcion').length,
  };

  // Cargar pasos y caminos al montar el componente
  useEffect(() => {
    toast({
      title: 'Cargando diagrama...',
      description: `Obteniendo pasos y conexiones para el flujo #${flujo.id_flujo_activo}.`,
      duration: 2000,
    });
    loadPasosYConexiones(flujo.id_flujo_activo);
  }, [loadPasosYConexiones, flujo.id_flujo_activo, toast]);

  // Mostrar notificaciones basadas en el estado
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `No se pudo cargar el diagrama del flujo #${flujo.id_flujo_activo}: ${error}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [error, flujo.id_flujo_activo, toast]);

  // Warn on unload if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isAnyDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isAnyDirty]);

  // Mostrar errores de acciones
  useEffect(() => {
    if (lastActionError) {
      toast({
        title: 'Error en la operación',
        description: lastActionError,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [lastActionError, toast]);

  useEffect(() => {
    if (!loading && pasos.length > 0 && caminos.length > 0 && !error) {
      toast({
        title: 'Éxito',
        description: `Diagrama del flujo #${flujo.id_flujo_activo} cargado.`,
        duration: 3000,
      });
    }
  }, [loading, pasos.length, caminos.length, error, flujo.id_flujo_activo, toast]);

  const handleNodeSelect = (paso: PasoSolicitud | null) => {
    if (paso) {
      setSelectedNodeId(paso.id_paso_solicitud.toString());
      setPasoEditando(paso);
    } else {
      setSelectedNodeId(null);
      setPasoEditando(null);
    }
  };

  // Efectos para refrescar diagrama solo cuando sea necesario
  useEffect(() => {
    setDiagramaKey(prev => prev + 1);
  }, [pasos.length, caminos.length]); // No incluir pasos o caminos completos

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 320;
      const maxWidth = window.innerWidth * 0.6;
      setEditorWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'encurso': 'default',
      'finalizado': 'default', 
      'cancelado': 'destructive'
    } as const;
    return <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>{estado}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header del flujo */}
      <Card className="shadow-soft animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Flujo #{flujo.id_flujo_activo}
                  {getEstadoBadge(flujo.estado)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Solicitud #{flujo.solicitud_id} • Iniciado {(() => {
                    const d = parseDate(flujo.fecha_inicio);
                    return d ? d.toLocaleDateString('es-ES') : 'Desconocido';
                  })()}
                </p>
                {flujo.datos_solicitud && (
                  <div className="mt-2 p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Datos de Solicitud:</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(flujo.datos_solicitud).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAnyDirty && (
                <Badge variant="secondary" className="mr-2">Cambios sin guardar</Badge>
              )}
              {onVolverALista && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onVolverALista}
                  className="hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300"
                >
                  ← Volver a la Lista
                </Button>
              )}
              {isAnyDirty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearAllDrafts()}
                  className="hover:bg-muted hover:scale-105 transition-all duration-300"
                >
                  Descartar Cambios
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiagramaKey(prev => prev + 1)}
                className="mr-2 hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refrescar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="diagrama" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-card p-1 rounded-lg shadow-soft">
          <TabsTrigger 
            value="diagrama" 
            className="flex items-center gap-2 transition-all duration-300 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow"
          >
            <Workflow className="w-4 h-4" />
            Diagrama de Flujo
          </TabsTrigger>
          <TabsTrigger 
            value="estadisticas" 
            className="flex items-center gap-2 transition-all duration-300 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow"
          >
            <CheckCircle2 className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagrama" className="space-y-4">
          <div className={`${mostrarPantallaCompleta ? 'fixed inset-0 z-40' : 'relative h-[600px]'} border rounded-lg overflow-hidden bg-gray-50`}>
            {/* Floating action buttons: view/edit + fullscreen + save */}
            <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
              {isAnyDirty && (
                <Button
                  size="icon"
                  variant="success"
                  className="rounded-full shadow-md"
                  onClick={async () => {
                    await commitAllPasoDrafts();
                    toast({ title: 'Cambios guardados', description: 'Se aplicaron todos los cambios pendientes.' });
                  }}
                  title="Guardar todos los cambios"
                  aria-label="Guardar todos los cambios"
                >
                  <Save className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant={modoEdicion ? 'outline' : 'outline'}
                className="rounded-full shadow-md"
                onClick={() => setModoEdicion(!modoEdicion)}
                title={modoEdicion ? 'Solo ver' : 'Editar'}
              >  
                {modoEdicion ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full shadow-md"
                onClick={() => setMostrarPantallaCompleta(!mostrarPantallaCompleta)}
                title={mostrarPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {mostrarPantallaCompleta ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
            <div 
              className={`h-full transition-all duration-300 ${mostrarPantallaCompleta ? 'min-h-screen' : ''}`}
              style={{ marginRight: pasoEditando ? `${editorWidth}px` : '0' }}
            >
              <DiagramaFlujo
                key={diagramaKey}
                pasos={pasos}
                caminos={caminos}
                readOnly={!modoEdicion}
                selectedNodeId={selectedNodeId || undefined}
                onNodeSelect={handleNodeSelect}
                datosSolicitudIniciales={flujo.datos_solicitud}
                flujoActivoId={flujo.id_flujo_activo}
                onCreatePaso={createPasoSolicitud}
                onDeletePaso={deletePasoSolicitud}
                onCreateConexion={createConexionPaso}
                onReplaceConexiones={putConexionesPaso}
                onDeleteConexion={deleteConexionPaso}
              />
            </div>
            {pasoEditando && (
              <motion.div
                initial={{ x: editorWidth }}
                animate={{ x: 0 }}
                exit={{ x: editorWidth }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-0 right-0 h-full bg-white border-l shadow-xl flex flex-col z-10"
                style={{ width: `${editorWidth}px` }}
              >
                <div 
                  className="absolute left-0 top-0 w-1 h-full bg-gray-200 hover:bg-primary cursor-col-resize z-20 transition-colors"
                  onMouseDown={handleMouseDown}
                  style={{ marginLeft: '-2px' }}
                />
                <div className="px-6 py-4 border-b bg-white">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    <h3 className="font-semibold">{pasoEditando.nombre}</h3>
                    <Badge variant={
                      pasoEditando.tipo_paso === 'aprobacion' ? 'secondary' : 'success'
                    }>
                      {pasoEditando.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <EditorPaso
                    paso={pasoEditando}
                    isOpen={false}
                    onClose={() => handleNodeSelect(null)}
                    onGuardar={(pasoActualizado) => {
                      const p = updatePasoSolicitud(pasoActualizado.id_paso_solicitud, pasoActualizado);
                      toast({
                        title: 'Paso actualizado',
                        description: `Los cambios en "${pasoActualizado.nombre}" se han guardado`,
                      });
                      handleNodeSelect(null); // Cerrar el editor
                      return p;
                    }}
                    responsablesDisponibles={allUsers
                      .filter(u => typeof u.idUsuario === 'number')
                      .map(u => ({
                        id: u.idUsuario as number,
                        nombre: u.nombre || u.name || `Usuario ${u.idUsuario}`,
                        rol: (u.rolNombre || u.rol || 'Miembro') as string,
                        departamento: u.departamentoNombre || u.departamento || '—'
                      }))}
                    isPanel={true}
                    inputsDisponibles={[
                      {
                        id_input: 1,
                        tipo_input: 'textocorto',
                        etiqueta: 'Título de la solicitud',
                        placeholder: 'Ingrese un título descriptivo',
                        validacion: { required: true, max: 100 }
                      },
                      {
                        id_input: 2,
                        tipo_input: 'textolargo',
                        etiqueta: 'Justificación detallada',
                        placeholder: 'Explique los motivos de la solicitud...',
                        validacion: { required: true, max: 1000 }
                      },
                      {
                        id_input: 3,
                        tipo_input: 'combobox',
                        etiqueta: 'Departamento solicitante',
                        opciones: ['Recursos Humanos', 'Finanzas', 'Tecnología', 'Operaciones', 'Marketing'],
                        validacion: { required: true }
                      },
                      {
                        id_input: 4,
                        tipo_input: 'date',
                        etiqueta: 'Fecha requerida',
                        validacion: { required: false }
                      },
                      {
                        id_input: 5,
                        tipo_input: 'number',
                        etiqueta: 'Presupuesto estimado',
                        placeholder: '0.00',
                        validacion: { min: 0, max: 1000000 }
                      },
                      {
                        id_input: 6,
                        tipo_input: 'multiplecheckbox',
                        etiqueta: 'Opciones múltiples',
                        opciones: ['Opción A', 'Opción B', 'Opción C'],
                        validacion: { required: false }
                      },
                      {
                        id_input: 7,
                        tipo_input: 'archivo',
                        etiqueta: 'Adjuntar archivo',
                        validacion: { required: false }
                      }
                    ]}
                    gruposAprobacion={gruposAprobacion}

                    usuarioActualId={1}
                    onValidarCamposDinamicos={(campos) => {
                      console.log('Validando campos dinámicos:', campos);
                      return true;
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-2xl font-bold text-success">{estadisticasPasos.aprobados}</p>
                      <p className="text-sm text-muted-foreground">Aprobados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-warning">{estadisticasPasos.pendientes}</p>
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold text-destructive">{estadisticasPasos.rechazados}</p>
                      <p className="text-sm text-muted-foreground">Rechazados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-primary">{estadisticasPasos.excepciones}</p>
                      <p className="text-sm text-muted-foreground">Excepciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const inicioPaso: PasoSolicitud = {
                    id_paso_solicitud: 0,
                    flujo_activo_id: flujo.id_flujo_activo,
                    paso_id: undefined,
                    camino_id: undefined,
                    responsable_id: undefined,
                    fecha_inicio: new Date(),
                    tipo_paso: 'ejecucion',
                    estado: 'pendiente',
                    nombre: flujo.datos_solicitud && Object.keys(flujo.datos_solicitud).length > 0 ? 'Paso inicial (Solicitud)' : 'Paso inicial',
                    tipo_flujo: 'normal',
                    regla_aprobacion: undefined,
                    posicion_x: 20,
                    posicion_y: 20,
                    relacionesInput: [],
                    relacionesGrupoAprobacion: [],
                    comentarios: [],
                    excepciones: []
                  } as PasoSolicitud;

                  const combined = [inicioPaso, ...pasos];
                  return combined.map((paso, index) => (
                    <div
                      key={paso.id_paso_solicitud}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      onClick={() => handleNodeSelect(paso)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <h4 className="font-medium">{paso.nombre}</h4>
                          <p className="text-sm text-muted-foreground">
                            {paso.tipo_paso === 'inicio' ? 'Paso inicial' : (paso.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución')}
                          </p>
                          {paso.tipo_paso === 'inicio' && flujo.datos_solicitud && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <strong>Datos de solicitud:</strong>
                              <div className="mt-1">
                                {Object.entries(flujo.datos_solicitud).map(([k,v]) => (
                                  <div key={k} className="truncate">{k}: {String(v)}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {paso.responsable_id && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {(() => {
                              const u = allUsers.find(x => x.idUsuario === paso.responsable_id);
                              return u ? u.nombre || u.name : `ID: ${paso.responsable_id}`;
                            })()}
                          </div>
                        )}
                        <Badge variant={
                          paso.estado === 'aprobado' ? 'default' :
                          paso.estado === 'rechazado' ? 'destructive' :
                          paso.estado === 'excepcion' ? 'secondary' : 'outline'
                        }>
                          {paso.estado}
                        </Badge>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={mostrarPantallaCompleta} onOpenChange={setMostrarPantallaCompleta}>
  <DialogContent className="max-w-full w-screen h-screen max-h-screen p-0 gap-0 border-0 flex flex-col">
          <FlowViewerPage
            flujo={flujo}
            pasos={pasos}
            caminos={caminos}
           />
        </DialogContent>
      </Dialog>
    </div>
  );
};