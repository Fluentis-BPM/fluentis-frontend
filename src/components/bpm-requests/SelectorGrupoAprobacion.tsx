import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GrupoAprobacion } from '@/types/approval';
import { Plus, Users, Trash2, X, UserPlus } from 'lucide-react';

interface Props {
  gruposDisponibles: GrupoAprobacion[];
  grupoSeleccionado?: number;
  onGrupoSeleccionado: (grupoId: number) => void;
  onCrearGrupo: (nombre: string, miembros: number[]) => void;
}

export const SelectorGrupoAprobacion: React.FC<Props> = ({
  gruposDisponibles,
  grupoSeleccionado,
  onGrupoSeleccionado,
  onCrearGrupo
}) => {
  const [nombreNuevoGrupo, setNombreNuevoGrupo] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [miembrosNuevoGrupo, setMiembrosNuevoGrupo] = useState<number[]>([]);
  const [nuevoMiembroId, setNuevoMiembroId] = useState('');

  const handleCrearGrupo = () => {
    if (nombreNuevoGrupo.trim()) {
      onCrearGrupo(nombreNuevoGrupo.trim(), miembrosNuevoGrupo);
      setNombreNuevoGrupo('');
      setMiembrosNuevoGrupo([]);
      setNuevoMiembroId('');
      setMostrarFormulario(false);
    }
  };

  const agregarMiembro = () => {
    const id = parseInt(nuevoMiembroId);
    if (id && !miembrosNuevoGrupo.includes(id)) {
      setMiembrosNuevoGrupo([...miembrosNuevoGrupo, id]);
      setNuevoMiembroId('');
    }
  };

  const removerMiembro = (id: number) => {
    setMiembrosNuevoGrupo(miembrosNuevoGrupo.filter(m => m !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Grupo de Aprobación
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Selector de grupo existente */}
      <Select
        value={grupoSeleccionado?.toString() || ''}
        onValueChange={(value) => onGrupoSeleccionado(parseInt(value))}
      >
        <SelectTrigger className="transition-smooth focus:ring-request-primary/50">
          <SelectValue placeholder="Selecciona un grupo de aprobación" />
        </SelectTrigger>
        <SelectContent>
          {gruposDisponibles.map(grupo => (
            <SelectItem key={grupo.id_grupo} value={grupo.id_grupo.toString()}>
              {grupo.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Formulario para crear nuevo grupo */}
      {mostrarFormulario && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-grupo">Nombre del Grupo</Label>
                <Input
                  id="nombre-grupo"
                  value={nombreNuevoGrupo}
                  onChange={(e) => setNombreNuevoGrupo(e.target.value)}
                  placeholder="Ej: Aprobadores de IT, Gerencia, etc."
                  className="transition-smooth focus:ring-request-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Miembros del Grupo</Label>
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
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {miembrosNuevoGrupo.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md">
                    {miembrosNuevoGrupo.map(id => (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        Usuario {id}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 w-4 h-4"
                          onClick={() => removerMiembro(id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCrearGrupo}
                  disabled={!nombreNuevoGrupo.trim()}
                  className="flex-1"
                >
                  Crear Grupo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNombreNuevoGrupo('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mostrar grupo seleccionado */}
      {grupoSeleccionado && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Grupo seleccionado: {gruposDisponibles.find(g => g.id_grupo === grupoSeleccionado)?.nombre}
            </span>
            <Badge variant="outline" className="ml-auto">
              ID: {grupoSeleccionado}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};