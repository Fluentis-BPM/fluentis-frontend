import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GrupoAprobacion, GrupoAprobacionCompleto } from '@/types/bpm/approval';
import { Users, Plus, Edit, Trash2, UserPlus, X } from 'lucide-react';

interface Props {
  grupos: GrupoAprobacion[];
  miembrosGrupos: { [grupoId: number]: number[] }; // Añadir miembros
  onCrearGrupo: (nombre: string, miembros: number[]) => void;
  onEliminarGrupo?: (id: number) => void;
  onEditarGrupo?: (id: number, nombre: string, miembros: number[]) => void;
}

export const GestionGruposAprobacion: React.FC<Props> = ({
  grupos,
  miembrosGrupos,
  onCrearGrupo,
  onEliminarGrupo,
  onEditarGrupo
}) => {
  console.log('🎯 GESTION GRUPOS - miembrosGrupos recibidos:', miembrosGrupos);
  console.log('🎯 GESTION GRUPOS - grupos recibidos:', grupos);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [miembros, setMiembros] = useState<number[]>([]);
  const [nuevoMiembroId, setNuevoMiembroId] = useState('');
  const [grupoEditando, setGrupoEditando] = useState<number | null>(null);
  // Simulación de usuario logueado
  const usuarioLogueadoId = Number(localStorage.getItem('usuarioLogueadoId') || '1');

  // Simulación de pasos BPM asignados al usuario logueado
  const pasosIniciales = [
    { id: 1, nombre: 'Aprobar solicitud de compra', grupoId: 2 },
    { id: 2, nombre: 'Revisar contrato', grupoId: 1 },
    { id: 3, nombre: 'Validar presupuesto', grupoId: 2 },
  ];

  // Persistencia simulada de aprobaciones/rechazos
  const getEstadoPaso = (id: number) => {
    const estados = JSON.parse(localStorage.getItem('aprobacionesBPM') || '{}');
    return estados[id];
  };

  const setEstadoPaso = (id: number, estado: 'aprobado' | 'rechazado') => {
    const estados = JSON.parse(localStorage.getItem('aprobacionesBPM') || '{}');
    estados[id] = estado;
    localStorage.setItem('aprobacionesBPM', JSON.stringify(estados));
    setPasosAprobacion(prev => prev.map(p => p.id === id ? { ...p } : p)); // Forzar render
  };

  // TEMPORAL: Mostrar todos los pasos simulados para el usuario logueado, sin filtrar por grupo
  const [pasosAprobacion, setPasosAprobacion] = useState(pasosIniciales);

  const resetForm = () => {
    setNombreGrupo('');
    setMiembros([]);
    setNuevoMiembroId('');
    setGrupoEditando(null);
  };

  const handleCrear = () => {
    if (nombreGrupo.trim()) {
      console.log('🚀 CREANDO GRUPO DESDE GESTION:', { nombreGrupo: nombreGrupo.trim(), miembros });
      onCrearGrupo(nombreGrupo.trim(), miembros);
      resetForm();
      setMostrarCrear(false);
    }
  };

  const handleEditar = () => {
    if (grupoEditando && nombreGrupo.trim() && onEditarGrupo) {
      onEditarGrupo(grupoEditando, nombreGrupo.trim(), miembros);
      resetForm();
      setMostrarCrear(false);
    }
  };

  const iniciarEdicion = (grupo: GrupoAprobacion) => {
    setGrupoEditando(grupo.id_grupo);
    setNombreGrupo(grupo.nombre);
    // Cargar miembros reales del grupo
    const miembrosReales = miembrosGrupos[grupo.id_grupo] || [];
    setMiembros(miembrosReales);
    setMostrarCrear(true);
  };

  const agregarMiembro = () => {
    const id = parseInt(nuevoMiembroId);
    if (id && !miembros.includes(id)) {
      setMiembros([...miembros, id]);
      setNuevoMiembroId('');
    }
  };

  const removerMiembro = (id: number) => {
    setMiembros(miembros.filter(m => m !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Grupos de Aprobación</h2>
        </div>
        
        <Dialog open={mostrarCrear} onOpenChange={setMostrarCrear}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary hover:opacity-90 shadow-soft">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-gray-800">
                {grupoEditando ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-medium text-gray-700">Nombre del Grupo</Label>
                <Input
                  id="nombre"
                  value={nombreGrupo}
                  onChange={(e) => setNombreGrupo(e.target.value)}
                  placeholder="Ej: Aprobadores de IT"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Miembros del Grupo</Label>
                <div className="flex gap-2">
                  <Input
                    value={nuevoMiembroId}
                    onChange={(e) => setNuevoMiembroId(e.target.value)}
                    placeholder="ID de usuario"
                    type="number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarMiembro}
                    disabled={!nuevoMiembroId}
                    className="hover:bg-primary hover:text-white transition-smooth"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {miembros.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {miembros.map(id => (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm">
                        Usuario {id}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="p-0 w-4 h-4 hover:bg-red-100 hover:text-red-600 transition-smooth"
                          onClick={() => removerMiembro(id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={grupoEditando ? handleEditar : handleCrear}
                  disabled={!nombreGrupo.trim()}
                  className="flex-1 font-bold shadow-md"
                  style={{ background: '#fff', color: '#111', border: '2px solid #000' }}
                >
                  {grupoEditando ? 'Guardar Cambios' : 'Crear Grupo'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setMostrarCrear(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de grupos */}
      <div className="grid gap-4">
        {grupos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay grupos creados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer grupo de aprobación para comenzar
              </p>
              <Button onClick={() => setMostrarCrear(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Grupo
              </Button>
            </CardContent>
          </Card>
        ) : (
          grupos.map(grupo => (
            <Card key={grupo.id_grupo}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{grupo.nombre}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => iniciarEdicion(grupo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {onEliminarGrupo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEliminarGrupo(grupo.id_grupo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    ID del Grupo: {grupo.id_grupo}
                  </div>
                  {/* Mostrar miembros reales */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Miembros: </span>
                    {(() => {
                      const miembrosDelGrupo = miembrosGrupos[grupo.id_grupo] || [];
                      if (miembrosDelGrupo.length === 0) {
                        return <span className="text-muted-foreground">No hay miembros asignados</span>;
                      }
                      return (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {miembrosDelGrupo.map(id => (
                            <Badge key={id} variant="secondary" className="text-xs">
                              Usuario {id}
                            </Badge>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sección de aprobación/rechazo de pasos BPM asignados al usuario logueado */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4 text-primary">Aprobación de Pasos BPM Asignados</h3>
        {pasosAprobacion.length === 0 ? (
          <div className="text-muted-foreground">No tienes pasos pendientes para aprobar/rechazar.</div>
        ) : (
          <div className="space-y-4">
            {pasosAprobacion.map(paso => {
              const estado = getEstadoPaso(paso.id);
              return (
                <Card key={paso.id} className="border-l-4 border-primary">
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="font-semibold">{paso.nombre}</div>
                    <div className="text-sm text-muted-foreground">Grupo asignado: {paso.grupoId}</div>
                    <div className="flex gap-2 items-center mt-2">
                      {!estado ? (
                        <>
                          <Button size="sm" className="bg-green-600 text-white" onClick={() => setEstadoPaso(paso.id, 'aprobado')}>Aprobar</Button>
                          <Button size="sm" className="bg-red-600 text-white" onClick={() => setEstadoPaso(paso.id, 'rechazado')}>Rechazar</Button>
                        </>
                      ) : (
                        <Badge variant={estado === 'aprobado' ? 'success' : 'destructive'}>
                          {estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};