import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/bpm/use-toast';
import { Eye, Trash2, UserPlus, Loader2, Search, Users } from 'lucide-react';
import api from '@/services/api';
import { useUsers } from '@/hooks/users/useUsers';

interface Visualizador {
  idRelacion: number;
  usuarioId: number;
  nombre: string;
  email: string;
  departamento: string;
  cargo: string;
}

interface GestionVisualizadoresProps {
  isOpen: boolean;
  onClose: () => void;
  flujoActivoId: number;
}

export const GestionVisualizadores: React.FC<GestionVisualizadoresProps> = ({
  isOpen,
  onClose,
  flujoActivoId,
}) => {
  const [visualizadores, setVisualizadores] = useState<Visualizador[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const { toast } = useToast();
  const { users } = useUsers();

  // Cargar visualizadores del flujo
  const cargarVisualizadores = async () => {
    setLoading(true);
    try {
      const response = await api.get<Visualizador[]>(`/api/FlujosActivos/${flujoActivoId}/visualizadores`);
      setVisualizadores(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los visualizadores',
        variant: 'destructive',
      });
      console.error('Error al cargar visualizadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar visualizadores
  const agregarVisualizadores = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'Advertencia',
        description: 'Selecciona al menos un usuario',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAction(true);
    try {
      const response = await api.post<{
        message: string;
        agregados: number[];
        errores: string[] | null;
      }>(`/api/FlujosActivos/${flujoActivoId}/visualizadores`, selectedUserIds);

      toast({
        title: 'Éxito',
        description: response.data.message,
      });

      if (response.data.errores && response.data.errores.length > 0) {
        toast({
          title: 'Advertencia',
          description: `Algunos usuarios no pudieron ser agregados: ${response.data.errores.join(', ')}`,
          variant: 'destructive',
        });
      }

      setSelectedUserIds([]);
      await cargarVisualizadores();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron agregar los visualizadores',
        variant: 'destructive',
      });
      console.error('Error al agregar visualizadores:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Eliminar visualizador
  const eliminarVisualizador = async (usuarioId: number) => {
    setLoadingAction(true);
    try {
      await api.delete(`/api/FlujosActivos/${flujoActivoId}/visualizadores/${usuarioId}`);
      
      toast({
        title: 'Éxito',
        description: 'Visualizador removido exitosamente',
      });

      await cargarVisualizadores();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el visualizador',
        variant: 'destructive',
      });
      console.error('Error al eliminar visualizador:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Cargar visualizadores al abrir el diálogo
  useEffect(() => {
    if (isOpen) {
      cargarVisualizadores();
    }
  }, [isOpen, flujoActivoId]);

  // Filtrar usuarios disponibles (que no sean visualizadores actuales)
  const usuariosDisponibles = users.filter((user) => {
    const yaEsVisualizador = visualizadores.some((v) => v.usuarioId === user.idUsuario);
    const coincideBusqueda = busqueda.trim() === '' || 
      user.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      user.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      user.departamentoNombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    return !yaEsVisualizador && coincideBusqueda;
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="w-6 h-6 text-primary" />
            Gestión de Visualizadores - Flujo #{flujoActivoId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Sección: Visualizadores actuales */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Visualizadores Actuales
              </h3>
              <Badge variant="outline">{visualizadores.length}</Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando visualizadores...</span>
              </div>
            ) : visualizadores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay visualizadores asignados a este flujo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visualizadores.map((visualizador) => (
                  <div
                    key={visualizador.idRelacion}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{visualizador.nombre}</p>
                        <Badge variant="secondary" className="text-xs">
                          {visualizador.cargo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{visualizador.email}</p>
                      <p className="text-xs text-muted-foreground">{visualizador.departamento}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarVisualizador(visualizador.usuarioId)}
                      disabled={loadingAction}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección: Agregar visualizadores */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Agregar Nuevos Visualizadores
            </h3>

            {/* Barra de búsqueda */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre, email o departamento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de usuarios seleccionables */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {usuariosDisponibles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios disponibles</p>
                </div>
              ) : (
                <div className="divide-y">
                  {usuariosDisponibles.map((user) => (
                    <label
                      key={user.idUsuario}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.idUsuario!)}
                        onChange={() => toggleUserSelection(user.idUsuario!)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.nombre || user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.departamentoNombre && (
                          <p className="text-xs text-muted-foreground">{user.departamentoNombre}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Botón para agregar seleccionados */}
            {selectedUserIds.length > 0 && (
              <div className="mt-3 flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUserIds.length} usuario(s) seleccionado(s)
                </span>
                <Button
                  onClick={agregarVisualizadores}
                  disabled={loadingAction}
                  className="gap-2"
                >
                  {loadingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Agregar Visualizadores
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
