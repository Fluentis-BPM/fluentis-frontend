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
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
  // When dragging a user from inside a group, this provides the source group id
  onUserDragStartFromGroup?: (user: User, fromGroupId: number) => void
}

export interface AprobationGroupCardProps {
  grupo: GrupoAprobacion
  users: User[]
  onDrop: (groupId: number) => void
  draggedUser: User | null
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
  onUserDragStartFromGroup?: (user: User, fromGroupId: number) => void
}

export interface CreateGrupoAprobacionInput {
  nombre: string;
  esGlobal: boolean; // Backend expects camelCase
  usuarioIds: number[]; // IDs de usuarios a asociar
}

export interface UpdateGrupoAprobacionInput {
  nombre?: string;
  esGlobal?: boolean;
}

export interface UseAprobationsReturn {
  grupos: GrupoAprobacion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  creating: boolean;
  createError: string | null;
  createGrupo: (input: CreateGrupoAprobacionInput) => Promise<void>;
  updating: boolean;
  updateGrupo: (id: number, data: UpdateGrupoAprobacionInput) => Promise<void>;
  mutatingMembers: boolean;
  addUsuarios: (id: number, usuarioIds: number[]) => Promise<void>;
  removeUsuario: (id: number, usuarioId: number) => Promise<void>;
  deleting: boolean;
  deleteGrupo: (id: number) => Promise<void>;
  lastActionError: string | null;
}