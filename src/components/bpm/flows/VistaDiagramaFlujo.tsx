import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DiagramaFlujo } from './DiagramaFlujo';
import { EditorPaso } from './EditorPaso';
// (Fullscreen simplificado) Se eliminó FlowViewerPage para evitar doble montaje
import { GestionVisualizadores } from './GestionVisualizadores';
import { INPUT_TEMPLATES, normalizeTipoInput, type Input as InputType, type RelacionInput } from '@/types/bpm/inputs';
import { fetchInputsCatalog } from '@/services/inputs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Eliminado Dialog para fullscreen; ahora se usa sólo contenedor fixed
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
  Save,
  Play,
  Shield,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';
import { isRejected as isOptimisticallyRejected, clearAllOptimistic } from '@/hooks/bpm/optimisticDecisions';
import { useBpm } from '@/hooks/bpm/useBpm'; // Nuevo import para usar el estado global
import { useAprobations } from '@/hooks/equipos/aprobations/useAprobations';
import { useUsers } from '@/hooks/users/useUsers';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';

interface VistaDiagramaFlujoProps {
  flujo: FlujoActivo;
  onVolverALista?: () => void; // Solo mantenemos esta prop para volver a la lista
}

export const VistaDiagramaFlujo: React.FC<VistaDiagramaFlujoProps> = ({
  flujo,
  onVolverALista,
}) => {
  const [inputsDisponiblesCat, setInputsDisponiblesCat] = useState<InputType[]>([]);
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
  const navigate = useNavigate();
  
  // Auth: Get current user role
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.rolNombre || '');
  const isSystemAdmin = currentUserRole.toLowerCase() === 'administrador';
  
  // Roles del usuario en este flujo específico
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  const [modoEdicion, setModoEdicion] = useState(true); // Empezar en modo edición por defecto
  const [pasoEditando, setPasoEditando] = useState<PasoSolicitud | null>(null);
  // Eliminado diagramaKey para evitar remounts que resetean el zoom
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(480); // Width for resizable editor
  const [isResizing, setIsResizing] = useState(false);
  const [mostrarPantallaCompleta, setMostrarPantallaCompleta] = useState(false);
  const [mostrarGestionVisualizadores, setMostrarGestionVisualizadores] = useState(false);
  
  // Helper to map campos_dinamicos/relaciones into RelacionInput[] for EditorPaso
  const mapRelacionesFromPaso = React.useCallback((p: PasoSolicitud | null): RelacionInput[] => {
    if (!p) return [];
    const anyPaso = p as unknown as { campos_dinamicos?: unknown; relacionesInput?: unknown };
    const cd = anyPaso.campos_dinamicos;
    if (Array.isArray(cd)) return cd as RelacionInput[];
    if (cd && typeof cd === 'object') {
      const entries = Object.entries(cd as Record<string, { valor?: string; requerido?: boolean; nombre?: string; placeholder?: string | null }>);
      return entries.map(([key, campo]) => ({
        id_relacion: Number(key),
        input_id: Number(key),
        nombre: campo.nombre,
        valor: String(campo.valor ?? ''),
        placeholder: campo.placeholder ?? null,
        requerido: Boolean(campo.requerido),
        paso_solicitud_id: p.id_paso_solicitud,
      }));
    }
    const rel = anyPaso.relacionesInput;
    let mapped = Array.isArray(rel) ? (rel as RelacionInput[]) : [];
    // Fallback: if initial step has no relaciones nor campos_dinamicos, try to build from flujo.datos_solicitud
    if ((!mapped || mapped.length === 0) && p.tipo_paso === 'inicio' && flujo?.datos_solicitud && typeof flujo.datos_solicitud === 'object') {
      const entries = Object.entries(flujo.datos_solicitud as Record<string, unknown>);
      mapped = entries.map(([key, value], idx) => ({
        id_relacion: -1000 - idx,
        input_id: 0,
        nombre: key,
        valor: String(value ?? ''),
        placeholder: null,
        requerido: false,
        paso_solicitud_id: p.id_paso_solicitud,
      }));
    }
    return mapped;
  }, []);

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

  // Detectar y procesar roles del usuario en este flujo
  useEffect(() => {
    const roles = flujo.roles_usuario || [];
    setUserRoles(roles);
    
    console.log('🔍 [ROLES] Flujo ID:', flujo.id_flujo_activo);
    console.log('🔍 [ROLES] Roles detectados del usuario:', roles);
    console.log('🔍 [ROLES] Es administrador del sistema:', isSystemAdmin);
    
    // Determinar permisos
    const hasAdminRole = roles.includes('admin');
    const hasAprobadorRole = roles.includes('aprobador');
    const hasEjecutorRole = roles.includes('ejecutor');
    const hasCreadorRole = roles.includes('creador');
    const hasVisualizadorRole = roles.includes('visualizador');
    
    console.log('🔍 [ROLES] Desglose de roles:');
    console.log('  - Admin:', hasAdminRole);
    console.log('  - Aprobador:', hasAprobadorRole);
    console.log('  - Ejecutor:', hasEjecutorRole);
    console.log('  - Creador:', hasCreadorRole);
    console.log('  - Visualizador:', hasVisualizadorRole);
    
    // Determinar modo de edición según permisos
    if (isSystemAdmin) {
      setModoEdicion(true);
      console.log('✅ [PERMISOS] Modo edición COMPLETO (Administrador del sistema)');
    } else if (hasAdminRole) {
      setModoEdicion(true);
      console.log('✅ [PERMISOS] Modo edición COMPLETO (Admin del flujo)');
    } else {
      setModoEdicion(false);
      console.log('👁️ [PERMISOS] Modo SOLO LECTURA');
      
      if (hasAprobadorRole && hasEjecutorRole) {
        console.log('🔘 [PERMISOS] Botones disponibles: Aprobar/Rechazar + Ejecutar');
      } else if (hasAprobadorRole) {
        console.log('🔘 [PERMISOS] Botón disponible: Aprobar/Rechazar');
      } else if (hasEjecutorRole) {
        console.log('🔘 [PERMISOS] Botón disponible: Ejecutar');
      } else {
        console.log('🔘 [PERMISOS] Sin botones de acción (Creador/Visualizador)');
      }
    }
  }, [flujo.id_flujo_activo, flujo.roles_usuario, isSystemAdmin]);

  // Bloquea scroll global mientras está activo el modo pantalla completa
  useEffect(() => {
    if (mostrarPantallaCompleta) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mostrarPantallaCompleta]);

  // Obtener pasos y caminos del estado global
  const pasos = pasosPorFlujo[flujo.id_flujo_activo] || [];
  // Aplicar override optimista (mostrar rechazado hasta que el usuario refresque explícitamente)
  const pasosConOverride = React.useMemo(() => {
    return pasos.map(p => (
      isOptimisticallyRejected(Number(p.id_paso_solicitud))
        ? { ...p, estado: 'rechazado' as typeof p.estado }
        : p
    ));
  }, [pasos]);
  const caminos = caminosPorFlujo[flujo.id_flujo_activo] || [];

  // Estadísticas calculadas localmente
  const estadisticasPasos = {
    total: pasosConOverride.length,
    pendientes: pasosConOverride.filter(p => p.estado === 'pendiente').length,
    aprobados: pasosConOverride.filter(p => p.estado === 'aprobado').length,
    rechazados: pasosConOverride.filter(p => p.estado === 'rechazado').length,
    excepciones: pasosConOverride.filter(p => p.estado === 'excepcion').length,
  };

  // Cargar catálogo del backend para inputs disponibles; fallback a templates si falla
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchInputsCatalog();
        const mapped: InputType[] = items.map(it => ({
          id_input: it.idInput,
          tipo_input: normalizeTipoInput(it.tipoInput),
          etiqueta: it.label || normalizeTipoInput(it.tipoInput),
        }));
        if (mounted) setInputsDisponiblesCat(mapped);
      } catch {
        if (mounted) setInputsDisponiblesCat([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar pasos y caminos al montar el componente
  useEffect(() => {
    toast({
      title: 'Cargando diagrama...',
      description: `Obteniendo pasos y conexiones para el flujo #${flujo.id_flujo_activo}.`,
      duration: 2000,
    });
    loadPasosYConexiones(flujo.id_flujo_activo);
  }, [loadPasosYConexiones, flujo.id_flujo_activo, toast]);

  // Resincronizar el paso editando cuando lleguen nuevos pasos desde el store
  useEffect(() => {
    if (pasoEditando) {
      const actualizado = pasos.find(p => p.id_paso_solicitud === pasoEditando.id_paso_solicitud);
      if (actualizado && actualizado !== pasoEditando) {
        setPasoEditando(actualizado);
      }
    }
  }, [pasos, pasoEditando]);

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

  // Evitar remounts innecesarios del diagrama para preservar el zoom/viewport
  // ReactFlow y el componente DiagramaFlujo ya sincronizan nodos/edges internamente

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

  // Notificar al editor cuando algún paso cambie a "rechazado" (detección por dif)
  const [prevEstadoByPaso, setPrevEstadoByPaso] = useState<Record<number, string>>({});
  useEffect(() => {
    if (!pasosConOverride || pasosConOverride.length === 0) return;
    // construir mapa actual
    const curr: Record<number, string> = {};
    for (const p of pasosConOverride) {
      curr[p.id_paso_solicitud] = String(p.estado || '').toLowerCase();
    }
    // detectar nuevas transiciones a rechazado
    const newlyRejected: PasoSolicitud[] = [];
    for (const p of pasosConOverride) {
      const prev = prevEstadoByPaso[p.id_paso_solicitud];
      const now = String(p.estado || '').toLowerCase();
      if (now === 'rechazado' && prev !== 'rechazado') {
        newlyRejected.push(p);
      }
    }
    if (newlyRejected.length) {
      for (const p of newlyRejected) {
        // Intentar extraer un comentario breve si el backend lo aporta en p.comentarios
        const comentario = Array.isArray(p.comentarios) && p.comentarios.length > 0
          ? p.comentarios[p.comentarios.length - 1]?.contenido
          : undefined;
        toast({
          title: `Paso rechazado: ${p.nombre}`,
          description: comentario ? `Comentario: ${comentario}` : 'Este paso ha sido marcado como rechazado.',
          duration: 6000,
          variant: 'destructive'
        });
      }
    }
    setPrevEstadoByPaso(curr);
  }, [pasosConOverride, toast]);

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
                
                {/* Badges de roles del usuario */}
                {(isSystemAdmin || userRoles.length > 0) && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Tus roles:</span>
                    {isSystemAdmin && (
                      <Badge variant="default" className="bg-purple-600 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin del Sistema
                      </Badge>
                    )}
                    {userRoles.includes('admin') && (
                      <Badge variant="default" className="bg-purple-500">
                        Admin
                      </Badge>
                    )}
                    {userRoles.includes('aprobador') && (
                      <Badge variant="default" className="bg-green-600">
                        Aprobador
                      </Badge>
                    )}
                    {userRoles.includes('ejecutor') && (
                      <Badge variant="default" className="bg-blue-600">
                        Ejecutor
                      </Badge>
                    )}
                    {userRoles.includes('creador') && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Creador
                      </Badge>
                    )}
                    {userRoles.includes('visualizador') && (
                      <Badge variant="outline" className="border-gray-400 text-gray-600">
                        <Eye className="w-3 h-3 mr-1" />
                        Visualizador
                      </Badge>
                    )}
                  </div>
                )}
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
              {/* Botón de Gestión de Visualizadores - Solo para admins */}
              {(isSystemAdmin || userRoles.includes('admin')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarGestionVisualizadores(true)}
                  className="hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Visualizadores
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { 
                  toast({ title: 'Sincronizando…', description: 'Actualizando diagrama desde el servidor', duration: 1200 });
                  clearAllOptimistic(); 
                  // Solo recargar datos; no forzar remount para preservar zoom
                  loadPasosYConexiones(flujo.id_flujo_activo);
                }}
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
                pasos={pasosConOverride}
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
                    {(isSystemAdmin || userRoles.includes('admin')) ? (
                      <Edit className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                    <h3 className="font-semibold">{pasoEditando.nombre}</h3>
                    <Badge variant={
                      pasoEditando.tipo_paso === 'aprobacion' ? 'secondary' : 'success'
                    }>
                      {pasoEditando.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  {(isSystemAdmin || userRoles.includes('admin')) ? (
                    // Admin view: Full edit panel
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
                      relacionesInput={mapRelacionesFromPaso(pasoEditando)}
                      inputsDisponibles={inputsDisponiblesCat.length ? inputsDisponiblesCat : INPUT_TEMPLATES}
                      gruposAprobacion={gruposAprobacion}
                      usuarioActualId={1}
                      onValidarCamposDinamicos={(campos) => {
                        console.log('Validando campos dinámicos:', campos);
                        return true;
                      }}
                    />
                  ) : (
                    // Non-admin view: Read-only panel with action buttons
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">Modo Solo Lectura</span>
                          </div>
                          <p className="text-sm text-blue-600">
                            {userRoles.includes('aprobador') || userRoles.includes('ejecutor')
                              ? 'Puedes ver los detalles del paso. Usa los botones de acción para trabajar con tus tareas.'
                              : 'Tienes permisos de visualización únicamente.'
                            }
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Nombre del Paso</Label>
                            <p className="mt-1 text-base">{pasoEditando.nombre}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Tipo de Paso</Label>
                            <p className="mt-1">
                              <Badge variant={pasoEditando.tipo_paso === 'aprobacion' ? 'secondary' : 'default'}>
                                {pasoEditando.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                              </Badge>
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Estado Actual</Label>
                            <div className="mt-1">
                              <Badge variant={
                                pasoEditando.estado === 'aprobado' ? 'default' :
                                pasoEditando.estado === 'rechazado' ? 'destructive' :
                                pasoEditando.estado === 'excepcion' ? 'secondary' : 'outline'
                              }>
                                {pasoEditando.estado}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</Label>
                            <p className="mt-1 text-sm">{parseDate(pasoEditando.fecha_inicio)?.toLocaleString('es-ES') || 'N/A'}</p>
                          </div>

                          {pasoEditando.responsable_id && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Responsable</Label>
                              <p className="mt-1 text-sm">
                                {(() => {
                                  const u = allUsers.find(x => x.idUsuario === pasoEditando.responsable_id);
                                  return u ? u.nombre || u.name : `ID: ${pasoEditando.responsable_id}`;
                                })()}
                              </p>
                            </div>
                          )}

                          {pasoEditando.regla_aprobacion && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Regla de Aprobación</Label>
                              <p className="mt-1 text-sm capitalize">{
                                pasoEditando.regla_aprobacion === 'individual'
                                  ? 'mayoría'
                                  : pasoEditando.regla_aprobacion === 'unanime'
                                    ? 'unánime'
                                    : pasoEditando.regla_aprobacion
                              }</p>
                            </div>
                          )}

                          {/* Información del grupo de aprobación */}
                          {pasoEditando.tipo_paso === 'aprobacion' && pasoEditando.relacionesGrupoAprobacion && pasoEditando.relacionesGrupoAprobacion.length > 0 && (() => {
                            const relacionGrupo = pasoEditando.relacionesGrupoAprobacion![0];
                            const miembros = relacionGrupo.usuarios_grupo || [];
                            const decisiones = relacionGrupo.decisiones || [];
                            const aprobaciones = decisiones.filter((d: { decision: boolean }) => d.decision === true).length;
                            const rechazos = decisiones.filter((d: { decision: boolean }) => d.decision === false).length;
                            const pendientes = miembros.length - decisiones.length;
                            
                            return (
                              <div className="border rounded-lg p-4 space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Estado del Grupo de Aprobación
                                </Label>
                                
                                {/* Estadísticas */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="text-lg font-bold text-green-600">{aprobaciones}</div>
                                    <div className="text-xs text-green-700">Aprobados</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-50 rounded">
                                    <div className="text-lg font-bold text-red-600">{rechazos}</div>
                                    <div className="text-xs text-red-700">Rechazados</div>
                                  </div>
                                  <div className="text-center p-2 bg-amber-50 rounded">
                                    <div className="text-lg font-bold text-amber-600">{pendientes}</div>
                                    <div className="text-xs text-amber-700">Pendientes</div>
                                  </div>
                                </div>

                                {/* Lista de miembros */}
                                <div className="space-y-2">
                                  {miembros.map((miembro: { id_usuario: number; nombre: string }) => {
                                    const decision = decisiones.find((d: { id_usuario: number; decision: boolean }) => d.id_usuario === miembro.id_usuario);
                                    return (
                                      <div key={miembro.id_usuario} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                        <span>{miembro.nombre}</span>
                                        {decision ? (
                                          <Badge variant={decision.decision ? 'default' : 'destructive'} className="text-xs">
                                            {decision.decision ? '✓ Aprobó' : '✗ Rechazó'}
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-xs">
                                            ⏳ Pendiente
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex flex-col gap-3 p-6 border-t bg-gray-50/50">
                        {userRoles.includes('aprobador') && (
                          <Button 
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              console.log('🔘 [ACCIÓN] Navegando a Mis Pasos (Aprobador)');
                              navigate('/flujos/mis-pasos');
                            }}
                          >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Aprobar / Rechazar
                          </Button>
                        )}
                        
                        {userRoles.includes('ejecutor') && (
                          <Button 
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              console.log('🔘 [ACCIÓN] Navegando a Mis Pasos (Ejecutor)');
                              navigate('/flujos/mis-pasos');
                            }}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Ejecutar
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleNodeSelect(null)} 
                          className="w-full h-12"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  )}
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
                  return pasos.map((paso, index) => (
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
                        {paso.tipo_paso === 'fin' && paso.estado === 'entregado' ? (
                          <Badge variant="success">Finalizado</Badge>
                        ) : (
                          <Badge variant={
                            paso.estado === 'aprobado' ? 'default' :
                            paso.estado === 'rechazado' ? 'destructive' :
                            paso.estado === 'excepcion' ? 'secondary' : 'outline'
                          }>
                            {paso.estado}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Eliminado segundo árbol fullscreen (Dialog + FlowViewerPage) para usar solo el contenedor expandido */}

      {/* Diálogo de Gestión de Visualizadores */}
      <GestionVisualizadores
        isOpen={mostrarGestionVisualizadores}
        onClose={() => setMostrarGestionVisualizadores(false)}
        flujoActivoId={flujo.id_flujo_activo}
      />
    </div>
  );
};