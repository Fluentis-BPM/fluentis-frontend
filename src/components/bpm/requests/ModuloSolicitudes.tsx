import React, { useState } from 'react';
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
import { CrearSolicitudInput } from '@/types/bpm/request';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstadoSolicitud } from '@/types/bpm/request';
import { Search, Filter, SortDesc, FileX, Layers, Users, Plus, ArrowRight, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';

export const ModuloSolicitudes: React.FC<{
  solicitudesData: ReturnType<typeof useSolicitudes>;
  onNavigateToFlujos: () => void;
}> = ({ solicitudesData, onNavigateToFlujos }) => {
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
    registrarDecision,
    verificarAprobacionCompleta,
    verificarRechazo,
    obtenerEstadisticasAprobacion,
    // Funcionalidades de flujos
    obtenerFlujoPorSolicitud
  } = solicitudesData;

  const { toast } = useToast();
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleCrearSolicitud = (input: CrearSolicitudInput, grupoAprobacionId?: number) => {
    try {
      const nuevaSolicitud = crearSolicitud(input);
      
      // Asignar grupo de aprobación si se seleccionó uno
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
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const descRaw = solicitud.datos_adicionales?.descripcion;
    const descStr = typeof descRaw === 'string' ? descRaw : '';
    const coincideBusqueda = busqueda === '' || 
      solicitud.id_solicitud.toString().includes(busqueda) ||
      solicitud.solicitante_id.toString().includes(busqueda) ||
      descStr.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'todos' || solicitud.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

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
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-gradient-primary hover:opacity-90 hover:scale-105 transition-smooth shadow-elegant"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {mostrarFormulario ? 'Ocultar' : 'Nueva Solicitud'}
          </Button>
        </div>

        {/* Estadísticas compactas */}
        <EstadisticasSolicitudes estadisticas={estadisticas} />

        {/* Pestañas principales */}
        <Tabs defaultValue="solicitudes" className="space-y-4">
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

          <TabsContent value="solicitudes" className="space-y-4">
            {/* Formulario de creación */}
            {mostrarFormulario && (
              <div className="max-w-4xl mx-auto">
                <FormularioSolicitud 
                  onCrearSolicitud={handleCrearSolicitud}
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
                  {solicitudesFiltradas.map((solicitud) => (
                    <div key={solicitud.id_solicitud} className="space-y-3">
                       <TarjetaSolicitud
                         solicitud={solicitud}
                         onActualizarEstado={handleActualizarEstado}
                         onEliminar={handleEliminar}
                       />
                       
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
                         const grupo = obtenerGrupoPorSolicitud(solicitud.id_solicitud);
                         const miembrosReales = grupo?.miembros || [];
                         const relacion = relacionesGrupo.find(r => r.solicitud_id === solicitud.id_solicitud);
                         
                         console.log('Solicitud:', solicitud.id_solicitud, 'Grupo:', grupo, 'Miembros:', miembrosReales);
                         
                         // Solo mostrar si hay grupo y miembros asignados
                         if (miembrosReales.length === 0) {
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
                              registrarDecision={registrarDecision}
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
                              usuarioActualId={0}
                            />
                          );
                       })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="grupos">
            <div className="max-w-4xl mx-auto">
              <GestionGruposAprobacion />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};