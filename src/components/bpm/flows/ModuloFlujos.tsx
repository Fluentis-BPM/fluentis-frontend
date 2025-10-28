import React, { useEffect } from 'react';
import { useBpm } from '@/hooks/bpm/useBpm';
import { TarjetaFlujo } from './TarjetaFlujo';
import { EstadisticasFlujos } from './EstadisticasFlujos';
import { VistaDiagramaFlujo } from './VistaDiagramaFlujo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EstadoFlujo } from '@/types/bpm/flow';
import { Search, Filter, SortDesc, FileX, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Toggle } from '@/components/ui/toggle';
import { useUsers } from '@/hooks/users/useUsers';
import { setImpersonateUserId, clearImpersonation } from '@/services/api';

export const ModuloFlujos: React.FC = () => {
  const {
    flujosActivos,
    loading,
    error,
    flujoSeleccionado,
    loadFlujosActivos,
    selectFlujo,
  } = useBpm();
  const { toast } = useToast();
  const [filtroEstado, setFiltroEstado] = React.useState<EstadoFlujo | 'todos'>('todos');
  const [busqueda, setBusqueda] = React.useState('');
  const [fechaInicio, setFechaInicio] = React.useState('');
  const [fechaFin, setFechaFin] = React.useState('');
  const [vistaLayout, setVistaLayout] = React.useState<'lista' | 'grid'>('lista'); // Por defecto lista
  
  // Auth and admin functionality
  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario || 0);
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.rolNombre || '');
  const { users: usuariosBackend, loading: usersLoading } = useUsers();

  // Verificar si el usuario es administrador
  const isAdmin = currentUserRole.toLowerCase() === 'administrador';

  // Impersonation (admin-only) state
  const _persistedImpersonated = typeof window !== 'undefined' ? window.localStorage.getItem('impersonatedUserIdFlujos') : null;
  const [impersonationEnabled, setImpersonationEnabled] = React.useState<boolean>(() => isAdmin && Boolean(_persistedImpersonated));
  const [impersonatedUserId, setImpersonatedUserId] = React.useState<number | null>(() => (isAdmin && _persistedImpersonated) ? Number(_persistedImpersonated) : null);

  // Limpiar impersonation si el usuario no es admin
  useEffect(() => {
    if (!isAdmin && (impersonationEnabled || impersonatedUserId)) {
      setImpersonationEnabled(false);
      setImpersonatedUserId(null);
      clearImpersonation();
      try { 
        window.localStorage.removeItem('impersonatedUserIdFlujos'); 
      } catch (err) { /* noop */ }
    }
  }, [isAdmin, impersonationEnabled, impersonatedUserId]);

  // Handlers para impersonation
  const handleToggleImpersonation = (enabled: boolean) => {
    setImpersonationEnabled(enabled);
    if (!enabled) {
      setImpersonatedUserId(null);
      clearImpersonation();
      try { window.localStorage.removeItem('impersonatedUserIdFlujos'); } catch (err) { /* noop */ }
      // Recargar flujos con el usuario actual
      if (currentUserId) {
        loadFlujosActivos(currentUserId, fechaInicio, fechaFin, getEstadoNumerico(filtroEstado));
      }
    } else if (impersonatedUserId) {
      // Si se habilita y ya hay un usuario seleccionado, recargar
      loadFlujosActivos(impersonatedUserId, fechaInicio, fechaFin, getEstadoNumerico(filtroEstado));
    }
    // notify same-window listeners
    try { window.dispatchEvent(new CustomEvent('impersonation-changed-flujos', { detail: { id: enabled ? impersonatedUserId : null } })); } catch (err) { /* noop */ }
  };

  const handleSelectImpersonatedUser = (value: string) => {
    const id = value ? Number(value) : null;
    setImpersonatedUserId(id);
    if (id) {
      // If a user was selected, enable impersonation mode automatically
      setImpersonationEnabled(true);
      setImpersonateUserId(id);
      try { window.localStorage.setItem('impersonatedUserIdFlujos', String(id)); } catch (err) { /* noop */ }
      // Recargar flujos con el nuevo usuario
      loadFlujosActivos(id, fechaInicio, fechaFin, getEstadoNumerico(filtroEstado));
    } else {
      clearImpersonation();
      // Recargar flujos con el usuario actual
      if (currentUserId) {
        loadFlujosActivos(currentUserId, fechaInicio, fechaFin, getEstadoNumerico(filtroEstado));
      }
    }
    // notify same-window listeners
    try { window.dispatchEvent(new CustomEvent('impersonation-changed-flujos', { detail: { id } })); } catch (err) { /* noop */ }
  };

  // Keep impersonation state in sync with other tabs/components
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'impersonatedUserIdFlujos') {
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
    window.addEventListener('impersonation-changed-flujos', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('impersonation-changed-flujos', onCustom as EventListener);
    };
  }, []);

  // Helper para convertir estado string a número
  const getEstadoNumerico = (estado: EstadoFlujo | 'todos'): number | undefined => {
    if (estado === 'todos') return undefined;
    const estadoMap: Record<EstadoFlujo, number> = {
      'encurso': 0,
      'finalizado': 1,
      'cancelado': 2,
    };
    return estadoMap[estado];
  };

  // Determinar usuario que está visualizando
  const viewerUserId = (isAdmin && impersonationEnabled && impersonatedUserId) ? impersonatedUserId : currentUserId;

  // Cargar flujos al montar el componente o cuando cambien los filtros
  useEffect(() => {
    if (viewerUserId) {
      toast({
        title: 'Cargando flujos...',
        description: 'Por favor, espera mientras se obtienen los flujos activos.',
        duration: 2000,
      });
      loadFlujosActivos(viewerUserId, fechaInicio, fechaFin, getEstadoNumerico(filtroEstado));
    }
  }, [viewerUserId, fechaInicio, fechaFin, filtroEstado]);
  
  // Mostrar notificaciones basadas en el estado
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!loading && Array.isArray(flujosActivos) && flujosActivos.length > 0 && !error) {
      toast({
        title: 'Éxito',
        description: `Se cargaron ${flujosActivos.length} flujos activos.`,
        duration: 3000,
      });
    }
  }, [loading, Array.isArray(flujosActivos) ? flujosActivos.length : 0, error, toast]);

  // Simulación de estadísticas (puedes integrar un thunk si hay un endpoint)
  const estadisticas = {
    total_flujos: Array.isArray(flujosActivos) ? flujosActivos.length : 0,
    en_curso: Array.isArray(flujosActivos) ? flujosActivos.filter(f => f.estado === 'encurso').length : 0,
    finalizados: Array.isArray(flujosActivos) ? flujosActivos.filter(f => f.estado === 'finalizado').length : 0,
    cancelados: Array.isArray(flujosActivos) ? flujosActivos.filter(f => f.estado === 'cancelado').length : 0,
  };

  const handleVerDiagrama = (flujo_id: number) => {
    selectFlujo(flujo_id);
  };

  const handleVolverALista = () => {
    selectFlujo(null);
  };

  // Filtrar flujos
  const flujosFiltrados = Array.isArray(flujosActivos) ? flujosActivos.filter(flujo => {
    const coincideBusqueda =
      busqueda === '' ||
      flujo.id_flujo_activo.toString().includes(busqueda) ||
      flujo.solicitud_id.toString().includes(busqueda);
    const coincideEstado = filtroEstado === 'todos' || flujo.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  }) : [];

  // Si hay un flujo seleccionado, mostrar vista de diagrama
  if (flujoSeleccionado !== null && Array.isArray(flujosActivos)) {
    const flujo = flujosActivos.find(f => f.id_flujo_activo === flujoSeleccionado);
    if (flujo) {
      return (
        <VistaDiagramaFlujo
          flujo={flujo}
          onVolverALista={handleVolverALista}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Gestión de Flujos
          </h1>
          <p className="text-muted-foreground">
            Seguimiento y control de flujos activos generados desde solicitudes aprobadas
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasFlujos estadisticas={estadisticas} />

      {/* Impersonation (admin-only): toggle + selector */}
      {isAdmin && (
        <div className="max-w-full">
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
                  {usuariosBackend.map(u => (
                    <SelectItem key={u.idUsuario} value={String(u.idUsuario)}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Controles de filtrado y búsqueda */}
      <Card className="shadow-soft animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground/90">
              <Filter className="w-5 h-5 text-primary" />
              Filtros y Búsqueda
            </CardTitle>
            
            {/* Toggle de vista */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={vistaLayout === 'lista' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVistaLayout('lista')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4 mr-1" />
                Lista
              </Button>
              <Button
                variant={vistaLayout === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVistaLayout('grid')}
                className="h-8 px-3"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Cuadros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Buscar por ID de flujo o solicitud..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:ring-primary/50 hover:border-primary/50"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={(value: EstadoFlujo | 'todos') => setFiltroEstado(value)}>
              <SelectTrigger className="w-48 transition-all duration-300 focus:ring-primary/50 hover:border-primary/50 hover:shadow-soft">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="todos" className="hover:bg-primary/10 transition-colors">Todos los estados</SelectItem>
                <SelectItem value="encurso" className="hover:bg-primary/10 transition-colors">En Curso</SelectItem>
                <SelectItem value="finalizado" className="hover:bg-primary/10 transition-colors">Finalizados</SelectItem>
                <SelectItem value="cancelado" className="hover:bg-primary/10 transition-colors">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline" className="border-primary/30 text-primary/80 hover:bg-primary/10 transition-colors">
                {flujosFiltrados.length} resultado{flujosFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {/* Filtros de fecha */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Fecha Inicio</label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="transition-all duration-300 focus:ring-primary/50 hover:border-primary/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Fecha Fin</label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="transition-all duration-300 focus:ring-primary/50 hover:border-primary/50"
              />
            </div>
            {(fechaInicio || fechaFin) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFechaInicio('');
                    setFechaFin('');
                  }}
                  className="h-10"
                >
                  Limpiar fechas
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de flujos */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {flujosFiltrados.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileX className="w-12 h-12 text-muted-foreground/50 mb-4 animate-bounce-subtle" />
              <h3 className="text-lg font-semibold mb-2">No hay flujos</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {flujosActivos.length === 0
                  ? 'Aún no se han creado flujos. Los flujos se generan automáticamente cuando se aprueban solicitudes.'
                  : 'No se encontraron flujos que coincidan con los filtros aplicados.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {vistaLayout === 'lista' ? (
              // Vista de Lista (filas)
              <div className="space-y-3">
                {flujosFiltrados.map((flujo, index) => (
                  <div
                    key={flujo.id_flujo_activo}
                    className="animate-scale-in"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <TarjetaFlujo
                      flujo={flujo}
                      onVerDiagrama={handleVerDiagrama}
                      onActualizarEstado={() => {}}
                      vista="lista"
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Vista de Grid (cuadros)
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flujosFiltrados.map((flujo, index) => (
                  <div
                    key={flujo.id_flujo_activo}
                    className="animate-scale-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <TarjetaFlujo
                      flujo={flujo}
                      onVerDiagrama={handleVerDiagrama}
                      onActualizarEstado={() => {}}
                      vista="grid"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};