import React, { useEffect, useState } from 'react';
import { useSolicitudes } from '@/hooks/bpm/useSolicitudes';
import { FormularioSolicitud } from './FormularioSolicitud';
import { TarjetaSolicitud } from './TarjetaSolicitud';
import { EstadisticasSolicitudes } from './EstadisticasSolicitudes';
import { ProcesoAprobacion } from './ProcesoAprobacion';
import { GestionGruposAprobacion } from './GestionGruposAprobacion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CrearSolicitudInput, Solicitud } from '@/types/bpm/request';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstadoSolicitud } from '@/types/bpm/request';
import { Search, Filter, SortDesc, FileX, Layers, Users, Plus, ArrowRight, Workflow, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';
import { useAprobations } from '@/hooks/equipos/aprobations/useAprobations';
import type { GrupoAprobacion } from '@/types/equipos/aprobations';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Toggle } from '@/components/ui/toggle';
import { useUsers } from '@/hooks/users/useUsers';
import { setImpersonateUserId, clearImpersonation } from '@/services/api';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export const ModuloSolicitudes: React.FC<{
  solicitudesData: ReturnType<typeof useSolicitudes>;
  onNavigateToFlujos: () => void;
}> = ({ solicitudesData, onNavigateToFlujos }) => {
  const navigate = useNavigate();
  const { 
    solicitudes, 
    crearSolicitud, 
    actualizarEstado, 
    eliminarSolicitud, 
    estadisticas,
    asignarGrupoAprobacion,
    // Funcionalidades de aprobación desde useSolicitudes
    obtenerGrupoPorSolicitud,
    relacionesGrupo,
  registrarDecisionSolicitud,
    asociarGrupoASolicitud,
    verificarAprobacionCompleta,
    verificarRechazo,
    obtenerEstadisticasAprobacion,
    // Funcionalidades de flujos
    obtenerFlujoPorSolicitud
  } = solicitudesData;

  const { toast } = useToast();
  const [expandedSolicitudId, setExpandedSolicitudId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [showCreateChoice, setShowCreateChoice] = useState(false);
  const { grupos: gruposBackend } = useAprobations();
  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario || 0);
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.rolNombre || '');
  const { users: usuariosBackend, loading: usersLoading } = useUsers();

  // Verificar si el usuario es administrador
  const isAdmin = currentUserRole.toLowerCase() === 'administrador';

  // Impersonation (admin-only) state
  const _persistedImpersonated = typeof window !== 'undefined' ? window.localStorage.getItem('impersonatedUserId') : null;
  const [impersonationEnabled, setImpersonationEnabled] = useState<boolean>(() => isAdmin && Boolean(_persistedImpersonated));
  const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(() => (isAdmin && _persistedImpersonated) ? Number(_persistedImpersonated) : null);

  // Limpiar impersonation si el usuario no es admin
  useEffect(() => {
    if (!isAdmin && (impersonationEnabled || impersonatedUserId)) {
      setImpersonationEnabled(false);
      setImpersonatedUserId(null);
      clearImpersonation();
      try { 
        window.localStorage.removeItem('impersonatedUserId'); 
      } catch (err) { /* noop */ }
    }
  }, [isAdmin, impersonationEnabled, impersonatedUserId]);

  // --- Ejemplo de usuario ficticio "Juan Pérez" ---
  // Usamos un id alto/ficticio que no choque con IDs reales
  const JUAN_PEREZ_ID = 99999;
  const JUAN_PEREZ_USER = {
    idUsuario: JUAN_PEREZ_ID,
    nombre: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    oid: null,
    departamentoId: null,
    departamentoNombre: 'IT',
    rolId: null,
    rolNombre: 'Aprobador',
    cargoId: null,
    cargoNombre: 'Analista',
  };
  const GRUPO_PRUEBAS_ID = -999;
  // Mock members to show more realistic demo in example group
  const MOCK_MEMBER_1 = { idUsuario: 11111, nombre: 'Usuario Mock A', email: 'mocka@ejemplo.com', departamentoNombre: 'Ventas', rolNombre: 'Aprobador', cargoNombre: 'Supervisor' };
  const MOCK_MEMBER_2 = { idUsuario: 11112, nombre: 'Usuario Mock B', email: 'mockb@ejemplo.com', departamentoNombre: 'Compras', rolNombre: 'Aprobador', cargoNombre: 'Analista' };
  // Shared group object used when the fake group id is encountered
  type MockUser = { idUsuario: number; nombre: string; email?: string; departamentoNombre?: string; rolNombre?: string; cargoNombre?: string };
  const GRUPO_PRUEBAS_OBJ = {
    id_grupo: GRUPO_PRUEBAS_ID,
    nombre: 'Grupo pruebas',
    es_global: false,
    usuarios: [JUAN_PEREZ_USER as MockUser, MOCK_MEMBER_1 as MockUser, MOCK_MEMBER_2 as MockUser],
    fecha: new Date().toISOString(),
    // decisiones: one mock already approved to show status, the other pending
    decisiones: [
      { id_usuario: MOCK_MEMBER_1.idUsuario, decision: 'si' },
      // no decision entry for MOCK_MEMBER_2 => pending
    ],
  } as unknown as GrupoAprobacion;

  // Handlers para impersonation
  const handleToggleImpersonation = (enabled: boolean) => {
    setImpersonationEnabled(enabled);
    if (!enabled) {
      setImpersonatedUserId(null);
      clearImpersonation();
      try { window.localStorage.removeItem('impersonatedUserId'); } catch (err) { /* noop */ }
      // Recargar solicitudes con el usuario actual
      if (currentUserId) {
        solicitudesData.cargarSolicitudes(currentUserId);
      }
    } else if (impersonatedUserId) {
      // Si se habilita y ya hay un usuario seleccionado, recargar
      solicitudesData.cargarSolicitudes(impersonatedUserId);
    }
    // notify same-window listeners
    try { window.dispatchEvent(new CustomEvent('impersonation-changed', { detail: { id: enabled ? impersonatedUserId : null } })); } catch (err) { /* noop */ }
  };

  const handleSelectImpersonatedUser = (value: string) => {
    const id = value ? Number(value) : null;
    setImpersonatedUserId(id);
    if (id) {
  // If a user was selected, enable impersonation mode automatically
  setImpersonationEnabled(true);
      setImpersonateUserId(id);
      try { window.localStorage.setItem('impersonatedUserId', String(id)); } catch (err) { /* noop */ }
      // Recargar solicitudes con el nuevo usuario
      solicitudesData.cargarSolicitudes(id);
    } else {
      clearImpersonation();
      // Recargar solicitudes con el usuario actual
      if (currentUserId) {
        solicitudesData.cargarSolicitudes(currentUserId);
      }
    }
  // notify same-window listeners
  try { window.dispatchEvent(new CustomEvent('impersonation-changed', { detail: { id } })); } catch (err) { /* noop */ }
  };

  // Keep impersonation state in sync with other tabs/components (storage events + same-window CustomEvent)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'impersonatedUserId') {
        const v = e.newValue;
        setImpersonatedUserId(v ? Number(v) : null);
        setImpersonationEnabled(v !== null);
      }
    };
    const onCustom = (e: Event) => {
      try {
        const id = (e as CustomEvent).detail?.id;
        setImpersonatedUserId(id ?? null);
        setImpersonationEnabled(Boolean(id));
      } catch (err) { /* noop */ }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('impersonation-changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('impersonation-changed', onCustom as EventListener);
    };
  }, []);

  // Seed local relacionesGrupo from solicitudes that include backend grupo id
  useEffect(() => {
    if (!solicitudes || solicitudes.length === 0) return;
    solicitudes.forEach((s) => {
    const gid = (s && typeof s === 'object' ? ((s as unknown) as { grupo_aprobacion_id?: number }).grupo_aprobacion_id : undefined);
      if (gid && !relacionesGrupo.some(r => r.solicitud_id === s.id_solicitud)) {
        try { asociarGrupoASolicitud(gid, s.id_solicitud); } catch (e) { /* noop */ }
      }
    });
  }, [solicitudes, relacionesGrupo, asociarGrupoASolicitud]);

  // Si estamos impersonando a Juan Pérez, inyectar dos solicitudes de ejemplo
  const solicitudesConEjemplos = React.useMemo(() => {
  if (!(impersonationEnabled && impersonatedUserId === JUAN_PEREZ_ID)) return solicitudes;
  const ejemplo1 = {
      id_solicitud: 999900,
      nombre: 'Solicitud ejemplo A',
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
      datos_adicionales: { descripcion: 'Ejemplo: compra pequeña' },
      solicitante_id: 1,
      solicitante: { idUsuario: 1, nombre: 'Ana Gómez', email: 'ana@empresa.com' },
      grupo_aprobacion_id: GRUPO_PRUEBAS_ID,
  } as unknown as Solicitud;
  const ejemplo2 = {
      id_solicitud: 999901,
      nombre: 'Solicitud ejemplo B',
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
      datos_adicionales: { descripcion: 'Ejemplo: permiso acceso' },
      solicitante_id: 2,
      solicitante: { idUsuario: 2, nombre: 'Carlos Ruiz', email: 'carlos@empresa.com' },
      grupo_aprobacion_id: GRUPO_PRUEBAS_ID,
  } as unknown as Solicitud;
    // evitar duplicados si ya existen
    const existingIds = new Set(solicitudes.map(s => s.id_solicitud));
    const itemsToAdd = [ejemplo1, ejemplo2].filter(e => !existingIds.has(e.id_solicitud));
    return [...itemsToAdd, ...solicitudes];
  }, [impersonationEnabled, impersonatedUserId, solicitudes]);

  const handleCrearSolicitud = async (input: CrearSolicitudInput, grupoAprobacionId?: number) => {
    try {
      const nuevaSolicitud = await crearSolicitud(input);

  
      if (grupoAprobacionId) {
        asignarGrupoAprobacion(nuevaSolicitud.id_solicitud, grupoAprobacionId);
      }

      toast({
        title: "Solicitud creada",
        description: `Solicitud #${nuevaSolicitud.id_solicitud} creada exitosamente`,
      });
      setMostrarFormulario(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la solicitud" + (error instanceof Error ? `: ${error.message}` : ""),
        variant: "destructive",
      });
    }
  };

  const handleActualizarEstado = (id: number, estado: EstadoSolicitud) => {
    try {
      actualizarEstado(id, estado);
      toast({
        title: "Estado actualizado",
        description: `Solicitud #${id} marcada como ${estado}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado" + (error instanceof Error ? `: ${error.message}` : ""),
        variant: "destructive",
      });
    }
  };

  const handleEliminar = (id: number) => {
    try {
      eliminarSolicitud(id);
      toast({
        title: "Solicitud eliminada",
        description: `Solicitud #${id} eliminada correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la solicitud" + (error instanceof Error ? `: ${error.message}` : ""),
        variant: "destructive",
      });
    }
  };

  // Filtrar solicitudes
  const baseFiltrado = solicitudesConEjemplos.filter(solicitud => {
    const descRaw = solicitud.datos_adicionales?.descripcion;
    const descStr = typeof descRaw === 'string' ? descRaw : '';
    const coincideBusqueda = busqueda === '' || 
      solicitud.id_solicitud.toString().includes(busqueda) ||
      (solicitud.solicitante_id !== undefined && solicitud.solicitante_id.toString().includes(busqueda)) ||
      descStr.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'todos' || solicitud.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  // Determinar usuario que está visualizando (administrador impersonado o usuario actual)
  const viewerUserId = (isAdmin && impersonationEnabled && impersonatedUserId) ? impersonatedUserId : currentUserId;

  // Filtrar para mostrar:
  // 1. Solicitudes creadas por el usuario (solicitante_id === viewerUserId)
  // 2. Solicitudes donde el usuario es miembro de algún grupo de aprobación
  const solicitudesFiltradas = (viewerUserId)
    ? baseFiltrado.filter(solicitud => {
        // Mostrar si el usuario es el solicitante
        if (solicitud.solicitante_id === viewerUserId) {
          return true;
        }
        
        // Verificar si el usuario es miembro de algún grupo de aprobación de esta solicitud
        // Primero verificar en el array grupos_aprobacion de la solicitud
        if (solicitud.grupos_aprobacion && Array.isArray(solicitud.grupos_aprobacion)) {
          for (const grupoRel of solicitud.grupos_aprobacion) {
            const grupoId = grupoRel.grupo_aprobacion_id;
            if (!grupoId) continue;
            
            let g = gruposBackend.find(gr => gr.id_grupo === grupoId);
            // si es nuestro grupo ficticio, construirlo on-the-fly
            if (!g && grupoId === GRUPO_PRUEBAS_ID) {
              g = GRUPO_PRUEBAS_OBJ;
            }
            
            if (g) {
              const miembros = (g.usuarios || []).map(u => u.idUsuario).filter(Boolean) as number[];
              if (miembros.includes(viewerUserId as number)) {
                return true;
              }
            }
          }
        }
        
        // Fallback: verificar en relaciones locales si no hay grupos_aprobacion
        const relacion = relacionesGrupo.find(r => r.solicitud_id === solicitud.id_solicitud);
        const assignedGroupId = relacion?.grupo_aprobacion_id ?? (solicitud as { grupo_aprobacion_id?: number }).grupo_aprobacion_id;
        if (assignedGroupId) {
          let g = gruposBackend.find(gr => gr.id_grupo === assignedGroupId);
          if (!g && assignedGroupId === GRUPO_PRUEBAS_ID) {
            g = GRUPO_PRUEBAS_OBJ;
          }
          if (g) {
            const miembros = (g.usuarios || []).map(u => u.idUsuario).filter(Boolean) as number[];
            if (miembros.includes(viewerUserId as number)) {
              return true;
            }
          }
        }
        
        return false;
      })
    : baseFiltrado;


  const totalItems = solicitudesFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const solicitudesPagina = solicitudesFiltradas.slice(startIndex, endIndex);

  // Reset page when filters/search change or when pageSize changes
  React.useEffect(() => {
    setPage(1);
  }, [busqueda, filtroEstado, pageSize]);

  // Ensure current page is within bounds when totalPages changes
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Refrescar solicitudes para el usuario actual/impersonado
  const handleRefreshSolicitudes = () => {
    const uid = viewerUserId || currentUserId;
    if (uid) {
      try {
        solicitudesData.cargarSolicitudes(uid);
        toast({ title: 'Solicitudes actualizadas', description: 'Se recargó la lista de solicitudes.' });
      } catch (e) {
        toast({ title: 'Error al refrescar', description: e instanceof Error ? e.message : 'No se pudo recargar', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Container principal con ancho máximo y centrado */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header compacto */}
        <div className="flex items-center justify-between bg-gradient-card rounded-xl p-6 shadow-elegant animate-slide-up">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Gestión de Solicitudes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Sistema base para manejo de solicitudes con identificadores únicos
            </p>
          </div>
          
          <Button 
            onClick={() => {
              if (mostrarFormulario) {
                setMostrarFormulario(false);
              } else {
                setShowCreateChoice(true);
              }
            }}
            variant="gradient"
            size="sm"
            className="hover:scale-105 transition-smooth"
          >
            <Plus className="w-4 h-4 mr-2" />
            {mostrarFormulario ? 'Ocultar' : 'Nueva Solicitud'}
          </Button>
        </div>

        {/* Dialogo de elección: plantilla o en blanco */}
        <Dialog open={showCreateChoice} onOpenChange={setShowCreateChoice}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear solicitud</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                className="w-full h-11"
                variant="gradient"
                onClick={() => {
                  setShowCreateChoice(false);
                  navigate('/flujos/plantillas');
                }}
              >
                Usar una plantilla existente
              </Button>
              <Button
                className="w-full h-11"
                variant="outline"
                onClick={() => {
                  setShowCreateChoice(false);
                  setMostrarFormulario(true);
                  // opcional: desplazar al formulario
                  setTimeout(() => {
                    try {
                      const el = document.getElementById('form-crear-solicitud');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch (e) {
                      // noop
                    }
                  }, 50);
                }}
              >
                Iniciar en blanco
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateChoice(false)}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EstadisticasSolicitudes estadisticas={estadisticas} />

        {/* Impersonation (admin-only): toggle + selector */}
        {isAdmin && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-end gap-3 mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">Modo Administrador (Ver como)</span>
                <Toggle
                  pressed={impersonationEnabled}
                  onPressedChange={(v: boolean) => handleToggleImpersonation(v)}
                  size="sm"
                >
                  {impersonationEnabled ? 'ON' : 'OFF'}
                </Toggle>
              </div>

              <div className="w-60">
                <Select value={impersonatedUserId ? String(impersonatedUserId) : ''} onValueChange={handleSelectImpersonatedUser}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder={usersLoading ? 'Cargando usuarios...' : 'Seleccionar usuario...'} />
                  </SelectTrigger>
                  <SelectContent>
                      {/* Juan Pérez ejemplo siempre disponible en el selector (dev-example) */}
                      <SelectItem key="juan_perez" value={String(JUAN_PEREZ_ID)}>{JUAN_PEREZ_USER.nombre}</SelectItem>
                      {usuariosBackend.map(u => (
                        <SelectItem key={u.idUsuario} value={String(u.idUsuario)}>{u.nombre}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Pestañas principales */}
        <Tabs defaultValue="solicitudes" className="space-y-4">
          <div className="relative max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-100 border-0">
            <TabsTrigger 
              value="solicitudes" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-smooth"
            >
              <Layers className="w-4 h-4" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="grupos" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Grupos de Aprobación
            </TabsTrigger>
            </TabsList>
            <Button
              onClick={handleRefreshSolicitudes}
              variant="outline"
              size="sm"
              disabled={Boolean(solicitudesData.isLoading)}
              className="h-8 absolute right-0 top-1/2 -translate-y-1/2"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${solicitudesData.isLoading ? 'animate-spin' : ''}`} />
              {solicitudesData.isLoading ? 'Actualizando...' : 'Refrescar'}
            </Button>
          </div>

          <TabsContent value="solicitudes" className="space-y-4">
            {/* Formulario de creación */}
    {mostrarFormulario && (
              <div className="max-w-4xl mx-auto">
                <div id="form-crear-solicitud" />
                <FormularioSolicitud 
                  onCrearSolicitud={handleCrearSolicitud}
      isLoading={solicitudesData.isLoading}
                  // gruposAprobacion removed (hook internal)
                  // onCrearGrupo removed
                />
              </div>
            )}

            {/* Controles de filtrado y búsqueda */}
            <Card className="shadow-soft max-w-5xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="w-4 h-4" />
                  Filtros y Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por ID, solicitante o descripción..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 h-9 transition-smooth focus:ring-request-primary/50"
                      />
                    </div>
                  </div>
                  
                  <Select value={filtroEstado} onValueChange={(value: EstadoSolicitud | 'todos') => setFiltroEstado(value)}>
                    <SelectTrigger className="w-44 h-9 transition-smooth focus:ring-request-primary/50">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="aprobado">Aprobadas</SelectItem>
                      <SelectItem value="rechazado">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 text-sm">
                    <SortDesc className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {solicitudesFiltradas.length} resultado{solicitudesFiltradas.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de solicitudes */}
            <div className="max-w-5xl mx-auto space-y-3">
              {solicitudesFiltradas.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileX className="w-10 h-10 text-muted-foreground mb-3" />
                    <h3 className="text-base font-semibold mb-1">No hay solicitudes</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {solicitudes.length === 0 
                        ? "Aún no se han creado solicitudes. ¡Crea la primera!"
                        : "No se encontraron solicitudes que coincidan con los filtros aplicados."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {solicitudesPagina.map((solicitud) => {
                    const relacion = relacionesGrupo.find(r => r.solicitud_id === solicitud.id_solicitud);
                    const assignedGroupId = relacion?.grupo_aprobacion_id ?? (solicitud as { grupo_aprobacion_id?: number }).grupo_aprobacion_id;
                                    let g = gruposBackend.find(gr => gr.id_grupo === assignedGroupId);
                                    if (!g && assignedGroupId === GRUPO_PRUEBAS_ID) {
                                      g = GRUPO_PRUEBAS_OBJ;
                                    }
                                    const miembrosReales = ((g?.usuarios || []).map(u => u.idUsuario).filter(Boolean) as number[]) || [];
                                    const esMiembro = viewerUserId && miembrosReales.includes(viewerUserId);

                    const quickApprove = async () => {
                      if (!viewerUserId) return;
                      registrarDecisionSolicitud(solicitud.id_solicitud, Number(viewerUserId), 'si', (nuevoEstado) => actualizarEstado(solicitud.id_solicitud, nuevoEstado));
                      toast({ title: 'Decisión registrada', description: 'Has aprobado la solicitud.' });
                    };
                    const quickReject = async () => {
                      if (!viewerUserId) return;
                      registrarDecisionSolicitud(solicitud.id_solicitud, Number(viewerUserId), 'no', (nuevoEstado) => actualizarEstado(solicitud.id_solicitud, nuevoEstado));
                      toast({ title: 'Decisión registrada', description: 'Has rechazado la solicitud.' });
                    };

                    const isExpanded = expandedSolicitudId === solicitud.id_solicitud;

                    return (
                      <div key={solicitud.id_solicitud} className="space-y-3">
                        <TarjetaSolicitud
                          solicitud={solicitud}
                          onActualizarEstado={handleActualizarEstado}
                          onEliminar={handleEliminar}
                          isExpanded={isExpanded}
                          onToggle={() => setExpandedSolicitudId(isExpanded ? null : solicitud.id_solicitud)}
                        />

                        {/* Mostrar detalles (acciones rápidas, flujo, proceso) sólo si la tarjeta está expandida */}
                        {isExpanded && (
                          <>
                            {/* Acciones rápidas para miembros del grupo */}
                            {assignedGroupId && solicitud.estado === 'pendiente' && esMiembro && (
                              <div className="flex gap-2 px-1">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={quickApprove}>
                                  Aprobar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={quickReject}>
                                  Rechazar
                                </Button>
                              </div>
                            )}

                            {/* Notificación de flujo creado */}
                            {solicitud.estado === 'aprobado' && obtenerFlujoPorSolicitud(solicitud.id_solicitud) && (
                              <Card className="shadow-soft border-success/50 bg-success/5">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20">
                                        <Workflow className="w-4 h-4 text-success" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-success">Flujo Activo</h4>
                                        <p className="text-xs text-muted-foreground">
                                          Flujo #{obtenerFlujoPorSolicitud(solicitud.id_solicitud)?.id_flujo_activo} creado automáticamente
                                        </p>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={onNavigateToFlujos}
                                      className="border-success text-success hover:bg-success/10 h-8 text-xs"
                                    >
                                      <ArrowRight className="w-3 h-3 mr-1" />
                                      Ver Flujo
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Proceso de Aprobación */}
                            {(() => {
                              if (!assignedGroupId) {
                                return (
                                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                                    <p className="text-xs text-muted-foreground text-center">
                                      No hay grupo de aprobación asignado a esta solicitud
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <ProcesoAprobacion
                                  solicitud_id={solicitud.id_solicitud}
                                  miembrosGrupo={miembrosReales}
                                  relacionGrupoAprobacionId={relacion?.id_relacion}
                                  onEstadoCambiado={(nuevoEstado) => 
                                    handleActualizarEstado(solicitud.id_solicitud, nuevoEstado)
                                  }
                                  obtenerGrupoPorSolicitud={obtenerGrupoPorSolicitud}
                                  registrarDecision={(idUsuario, _relacionId, dec, onChange) =>
                                    registrarDecisionSolicitud(solicitud.id_solicitud, idUsuario, dec, onChange)
                                  }
                                  verificarAprobacionCompleta={verificarAprobacionCompleta}
                                  verificarRechazo={verificarRechazo}
                                  obtenerEstadisticasAprobacion={(sid, miembros) => {
                                    const stats = obtenerEstadisticasAprobacion(sid, miembros);
                                    return { 
                                      total: stats.total_miembros,
                                      total_miembros: stats.total_miembros,
                                      aprobaciones: stats.aprobaciones,
                                      rechazos: stats.rechazos,
                                      pendientes: stats.pendientes
                                    };
                                  }}
                                  usuarioActualId={viewerUserId as number}
                                />
                              );
                            })()}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Pagination controls */}
            <div className="max-w-5xl mx-auto flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Page</span>
                <strong className="px-2">{page}</strong>
                <span>of</span>
                <strong className="px-2">{totalPages}</strong>
                <span className="text-xs text-muted-foreground">• {totalItems} items</span>
              </div>

              <div className="flex items-center gap-2">
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-28 h-8 bg-card text-card-foreground border rounded">
                    <SelectValue className="text-sm text-card-foreground" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="text-card-foreground">5 / page</SelectItem>
                    <SelectItem value="10" className="text-card-foreground">10 / page</SelectItem>
                    <SelectItem value="20" className="text-card-foreground">20 / page</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button aria-label="previous page" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button aria-label="next page" size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grupos">
            <div className="max-w-4xl mx-auto">
                  {impersonationEnabled && impersonatedUserId === JUAN_PEREZ_ID ? (
                    <GestionGruposAprobacion visibleGroups={[GRUPO_PRUEBAS_OBJ]} />
                  ) : (
                    <GestionGruposAprobacion />
                  )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};