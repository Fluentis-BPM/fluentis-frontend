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
import { Search, Filter, SortDesc, FileX, Settings } from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';

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
  

  // Cargar flujos al montar el componente
  useEffect(() => {
    toast({
      title: 'Cargando flujos...',
      description: 'Por favor, espera mientras se obtienen los flujos activos.',
      duration: 2000,
    });
    loadFlujosActivos();
  }, [loadFlujosActivos, toast]);

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
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 hover:shadow-glow transition-all duration-300"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </Button>
      </div>

      {/* Estadísticas */}
      <EstadisticasFlujos estadisticas={estadisticas} />

      {/* Controles de filtrado y búsqueda */}
      <Card className="shadow-soft animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground/90">
            <Filter className="w-5 h-5 text-primary" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-4">
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
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};