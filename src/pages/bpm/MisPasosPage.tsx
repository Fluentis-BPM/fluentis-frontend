import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-picker';
import { ConfirmActionDialog } from '@/components/bpm/ConfirmActionDialog';
import PasoExecutionDrawer from '@/components/bpm/execution/PasoExecutionDrawer';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { usePasosSolicitud } from '@/hooks/bpm/usePasosSolicitud';
import { useUsers } from '@/hooks/users/useUsers';
import { useDecision } from '@/hooks/bpm/useDecision';
import type { PasoSolicitud, FiltrosPasoSolicitud } from '@/types/bpm/paso';
import type { EstadoPaso, TipoPaso } from '@/types/bpm/flow';
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { fmtDateTime } from '@/lib/utils';

const MisPasosPage: React.FC = () => {
  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario ?? 0);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const roleName = String(currentUser?.rolNombre ?? '');
  // Solo los usuarios con rol exacto "Administrador" pueden ver como otros usuarios
  const isAdmin = roleName.toLowerCase() === 'administrador';
  
  console.log('Current user:', { currentUserId, currentUser, roleName, isAdmin });
  
  // Estados del componente
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId || 1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Actualizar selectedUserId cuando cambie currentUserId
  useEffect(() => {
    if (currentUserId > 0 && selectedUserId !== currentUserId) {
      console.log('Updating selectedUserId from', selectedUserId, 'to', currentUserId);
      setSelectedUserId(currentUserId);
    }
  }, [currentUserId, selectedUserId]);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosPasoSolicitud>({});
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  
  // Estados de acciones
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  // Estados del modal de confirmación
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    paso: PasoSolicitud | null;
    accion: 'aprobar' | 'rechazar' | 'ejecutar';
  }>({ open: false, paso: null, accion: 'aprobar' });
  const [execDrawer, setExecDrawer] = useState<{ open: boolean; pasoId: number | null; nombre?: string }>({ open: false, pasoId: null });
  
  // Hooks
  const { pasos, loading, error, fetchPasos, ejecutarAccion, clearError } = usePasosSolicitud();
  const { users } = useUsers();
  const { executePaso, loading: decisionLoading } = useDecision();
  
  // Actualizar filtros cuando cambien las fechas
  useEffect(() => {
    const toYMD = (d?: Date) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : undefined;
    setFiltros(prev => ({
      ...prev,
      fechaDesde: toYMD(fechaDesde),
      fechaHasta: toYMD(fechaHasta),
    }));
  }, [fechaDesde, fechaHasta]);
  
  // Cargar pasos inicialmente
  useEffect(() => {
    if (selectedUserId > 0) {
      console.log('Loading pasos for user:', selectedUserId, 'with filters:', filtros);
      fetchPasos(selectedUserId, filtros);
    }
  }, [selectedUserId, filtros, fetchPasos]);
  
  // Filtrar pasos por término de búsqueda
  const pasosFiltrados = useMemo(() => {
    console.log('Filtering pasos:', pasos.length, 'with search term:', searchTerm);
    if (!searchTerm.trim()) return pasos;
    
    const term = searchTerm.toLowerCase();
    const filtered = pasos.filter(paso => 
      paso.nombre.toLowerCase().includes(term) ||
      paso.solicitudNombre?.toLowerCase().includes(term) ||
      paso.descripcion?.toLowerCase().includes(term) ||
      paso.solicitanteNombre?.toLowerCase().includes(term)
    );
    console.log('Filtered pasos:', filtered.length);
    return filtered;
  }, [pasos, searchTerm]);
  
  // Manejar cambio de filtros
  const handleFilterChange = (key: keyof FiltrosPasoSolicitud, value: string | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setFiltros({});
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setSearchTerm('');
  };
  
  // Abrir modal de confirmación
  const isTipoEjecucion = (value: string | undefined) => {
    if (!value) return false;
    const v = value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    return v === 'ejecucion';
  };

  // Resuelve el identificador válido del PasoSolicitud para acciones/ejecución.
  // Algunos registros vienen con pasoId=0 (o indefinido) y el id real está en `id`.
  const resolvePasoSolicitudId = (p: PasoSolicitud | null | undefined): number => {
    if (!p) return 0;
    // Priorizar paso.pasoId solo si es un número positivo; de lo contrario usar p.id
    if (typeof p.pasoId === 'number' && p.pasoId > 0) return p.pasoId;
    if (typeof p.id === 'number' && p.id > 0) return p.id;
    return 0;
  };

  const openConfirmDialog = (paso: PasoSolicitud, accion: 'aprobar' | 'rechazar' | 'ejecutar') => {
    const resolvedId = resolvePasoSolicitudId(paso);
    console.log('[MisPasos] Acción solicitada:', accion, 'Paso:', {
      rawTipo: paso.tipoPaso,
      normalizedEjecucion: isTipoEjecucion(paso.tipoPaso),
      pasoId: paso.pasoId,
      id: paso.id,
      resolvedId
    });
    if (accion === 'ejecutar') {
      if (resolvedId <= 0) {
        console.warn('No se pudo abrir ejecución: identificador inválido', paso);
      }
      setExecDrawer({ open: true, pasoId: resolvedId, nombre: paso.nombre });
      return;
    }
    setConfirmDialog({ open: true, paso: { ...paso, pasoId: resolvedId }, accion });
  };
  
  // Ejecutar acción confirmada
  const handleConfirmedAction = async (comentarios?: string) => {
    if (!confirmDialog.paso) return;
    
    try {
      const targetPasoId = resolvePasoSolicitudId(confirmDialog.paso);
      setActionLoading(targetPasoId);
      setActionMessage(null);
      clearError();
      
      // Para pasos de aprobación, usar executePaso con la API correcta
      if (confirmDialog.accion === 'aprobar' || confirmDialog.accion === 'rechazar') {
        const decision = confirmDialog.accion === 'aprobar';
        await executePaso(targetPasoId, {
          IdUsuario: selectedUserId,
          Decision: decision
        });
        setActionMessage(`Paso ${decision ? 'aprobado' : 'rechazado'} correctamente`);
      } else {
        // Para otros tipos de pasos, mantener la lógica anterior
        const response = await ejecutarAccion(targetPasoId, {
          usuarioId: selectedUserId,
          accion: confirmDialog.accion,
          comentarios: comentarios || `${confirmDialog.accion} ejecutado desde Mis Pasos`
        });
        
        if (response.exito) {
          setActionMessage('Paso ejecutado correctamente');
        } else {
          setActionMessage(`Error: ${response.mensaje}`);
        }
      }
      
      // Refrescar lista después de 1 segundo
      setTimeout(() => {
        fetchPasos(selectedUserId, filtros);
      }, 1000);
    } catch (err) {
        setActionMessage(`Error al ${confirmDialog.accion} el paso: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Renderizar badge de estado más llamativo con icono
  const renderEstadoBadge = (estado: EstadoPaso) => {
    const configs = {
      'pendiente': { icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Pendiente' },
      'aprobado': { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobado' },
      'entregado': { icon: CheckCircle, color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Entregado' },
      'rechazado': { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazado' },
      'cancelado': { icon: XCircle, color: 'bg-gray-100 text-gray-800 border-gray-300', text: 'Cancelado' },
      'excepcion': { icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Excepción' },
    };
    
    const config = configs[estado as keyof typeof configs] || configs.pendiente;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} border font-semibold flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };
  
  // Obtener color del badge según el tipo
  const getTipoBadgeColor = (tipo: TipoPaso) => {
    switch (tipo) {
      case 'inicio': return 'outline';
      case 'ejecucion': return 'secondary';
      case 'aprobacion': return 'default';
      case 'fin': return 'destructive';
      default: return 'default';
    }
  };
  
  // Obtener icono según el tipo de paso
  const getTipoIcon = (tipo: TipoPaso) => {
    switch (tipo) {
      case 'inicio': return <Play className="h-4 w-4" />;
      case 'ejecucion': return <Clock className="h-4 w-4" />;
      case 'aprobacion': return <CheckCircle className="h-4 w-4" />;
      case 'fin': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  // Renderizar botones de acción según el tipo
  const renderAccionButtons = (paso: PasoSolicitud) => {
    const isLoading = actionLoading === paso.pasoId || decisionLoading;
    const resolvedId = resolvePasoSolicitudId(paso);
    const noId = resolvedId <= 0;
    
    // Estados finales - no se pueden modificar
    if (paso.estado === 'entregado' || paso.estado === 'cancelado') {
      return (
        <Badge variant="outline" className="text-xs bg-gray-50">
          {paso.estado === 'entregado' ? '✓ Completado' : '✗ Cancelado'}
        </Badge>
      );
    }
    
    // Pasos de aprobación
    if (paso.tipoPaso === 'aprobacion') {
      // Si ya está aprobado o rechazado, no permitir cambios
      if (paso.estado === 'aprobado') {
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-300 border">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ya aprobado
            </Badge>
          </div>
        );
      }
      
      if (paso.estado === 'rechazado') {
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800 border-red-300 border">
              <XCircle className="h-3 w-3 mr-1" />
              Ya rechazado
            </Badge>
          </div>
        );
      }
      
      // Solo si está pendiente, mostrar botones de acción
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => openConfirmDialog(paso, 'aprobar')}
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openConfirmDialog(paso, 'rechazar')}
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
            Rechazar
          </Button>
        </div>
      );
    }
    
    if (isTipoEjecucion(paso.tipoPaso)) {
      return (
        <Button
          size="sm"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => openConfirmDialog(paso, 'ejecutar')}
          disabled={isLoading || noId}
        >
          {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          {noId ? 'Sin ID' : 'Procesar'}
        </Button>
      );
    }
    
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => openConfirmDialog(paso, 'ejecutar')}
        disabled={isLoading || noId}
        title={noId ? 'El paso aún no tiene identificador persistido' : 'Procesar paso'}
      >
        {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
        {noId ? 'Sin ID' : 'Procesar'}
      </Button>
    );
  };
  
  // Renderizar vista de cards
  const renderCardsView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pasosFiltrados.map((paso) => (
  <Card key={`${paso.solicitudId}-${paso.pasoId || paso.id}`} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {getTipoIcon(paso.tipoPaso)}
                {paso.nombre}
              </CardTitle>
              <Badge variant={getTipoBadgeColor(paso.tipoPaso)} className="text-xs">
                {paso.tipoPaso}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                {paso.solicitudNombre || `Solicitud ${paso.solicitudId}`}
              </div>
              {paso.solicitanteNombre && (
                <div className="text-sm text-muted-foreground">
                  Solicitante: {paso.solicitanteNombre}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {fmtDateTime(paso.fechaCreacion)}
              </div>
              {paso.descripcion && (
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {paso.descripcion}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {renderEstadoBadge(paso.estado)}
            </div>
            
            <div className="pt-2">
              {renderAccionButtons(paso)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Renderizar vista de tabla
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Solicitud</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pasosFiltrados.map((paso) => (
          <TableRow key={`${paso.solicitudId}-${paso.pasoId || paso.id}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {getTipoIcon(paso.tipoPaso)}
                {paso.nombre}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getTipoBadgeColor(paso.tipoPaso)} className="text-xs">
                {paso.tipoPaso}
              </Badge>
            </TableCell>
            <TableCell>
              {renderEstadoBadge(paso.estado)}
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{paso.solicitudNombre || `Solicitud ${paso.solicitudId}`}</div>
                {paso.solicitanteNombre && (
                  <div className="text-sm text-muted-foreground">{paso.solicitanteNombre}</div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {fmtDateTime(paso.fechaCreacion)}
            </TableCell>
            <TableCell>
              {renderAccionButtons(paso)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Pasos</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          >
            {viewMode === 'cards' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPasos(selectedUserId, filtros)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Selector de usuario para admins */}
      {isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="user-select" className="whitespace-nowrap">Usuario:</Label>
              <Select
                value={selectedUserId.toString()}
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.idUsuario || user.oid} value={(user.idUsuario || user.oid || 0).toString()}>
                      {user.nombre} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre, solicitud, descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Paso</Label>
                <Select
                  value={filtros.tipoPaso || 'todos'}
                  onValueChange={(value) => handleFilterChange('tipoPaso', value === 'todos' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="inicio">Inicio</SelectItem>
                    <SelectItem value="ejecucion">Ejecución</SelectItem>
                    <SelectItem value="aprobacion">Aprobación</SelectItem>
                    <SelectItem value="fin">Fin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={filtros.estado || 'todos'}
                  onValueChange={(value) => handleFilterChange('estado', value === 'todos' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="excepcion">Excepción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Rango de fechas</Label>
              <DateRangePicker
                dateFrom={fechaDesde}
                dateTo={fechaHasta}
                onDateFromChange={setFechaDesde}
                onDateToChange={setFechaHasta}
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {actionMessage && (
        <Alert>
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Pasos Asignados ({pasosFiltrados.length})
            </CardTitle>
            {loading && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && pasos.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando pasos...</p>
            </div>
          ) : pasosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No se encontraron pasos {searchTerm || Object.keys(filtros).some(key => filtros[key as keyof FiltrosPasoSolicitud]) ? 'que coincidan con los filtros' : 'asignados'}
              </p>
              {!searchTerm && !Object.keys(filtros).some(key => filtros[key as keyof FiltrosPasoSolicitud]) && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Usuario actual: {selectedUserId}</p>
                  <p>Total de pasos cargados: {pasos.length}</p>
                  {error && <p className="text-red-500">Error: {error}</p>}
                </div>
              )}
            </div>
          ) : (
            viewMode === 'cards' ? renderCardsView() : renderTableView()
          )}
        </CardContent>
      </Card>
      
      {/* Modal de confirmación */}
      <ConfirmActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        paso={confirmDialog.paso}
        accion={confirmDialog.accion}
        onConfirm={handleConfirmedAction}
        loading={actionLoading !== null}
      />
      <PasoExecutionDrawer
        open={execDrawer.open}
        pasoId={execDrawer.pasoId}
        pasoNombre={execDrawer.nombre}
        usuarioId={selectedUserId}
        onClose={() => setExecDrawer({ open: false, pasoId: null })}
      />
    </div>
  );
};

export default MisPasosPage;
