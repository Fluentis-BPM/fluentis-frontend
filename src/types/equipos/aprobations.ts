import { User } from "../auth"

// Modelo que viene del backend
export interface GrupoAprobacion {
  id_grupo: number
  nombre: string
  fecha: string
  es_global: boolean
  usuarios?: User[] | null
}

// Modelo adaptado para UI
export interface AprobationGroupUI {
  id: string
  nombre: string
  descripcion: string
  color: string
  manager: string
}

export interface AprobationsListProps {
  grupos: GrupoAprobacion[]
  getUsersByGroup: (groupId: number) => User[]
  onDrop: (groupId: number) => void
  draggedUser: User | null
}

export interface AprobationGroupCardProps {
  grupo: GrupoAprobacion
  users: User[]
  onDrop: (groupId: number) => void
  draggedUser: User | null
}

export interface UseAprobationsReturn {
  grupos: GrupoAprobacion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
} 