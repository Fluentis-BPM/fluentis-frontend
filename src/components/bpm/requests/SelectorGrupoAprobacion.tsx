import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { GrupoAprobacion } from '@/types/bpm/approval';
import { Users } from 'lucide-react';

interface Props {
  gruposDisponibles: GrupoAprobacion[];
  grupoSeleccionado?: number;
  onGrupoSeleccionado: (grupoId: number) => void;
}

export const SelectorGrupoAprobacion: React.FC<Props> = ({
  gruposDisponibles,
  grupoSeleccionado,
  onGrupoSeleccionado
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Grupo de Aprobación
        </Label>
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