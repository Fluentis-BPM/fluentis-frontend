import { User } from "../auth"

// Modelo que viene del backend
export interface Rol {
  idRol: number
  nombre: string
  usuarios?: User[] | null
}

// Modelo adaptado para UI
export interface RoleUI {
  id: string
  nombre: string
  descripcion: string
  color: string
  manager: string
}

export interface UsersListProps {
  users: User[]
  onDragStart: (user: User) => void
  onDragEnd: () => void
}

export interface UserCardProps {
  user: User
  onDragStart: (user: User) => void
  onDragEnd: () => void
  isDragging?: boolean
}

export interface RolesListProps {
  roles: Rol[]
  getUsersByRole: (roleId: number) => User[]
  onDrop: (roleId: number) => void
  draggedUser: User | null
}

export interface RoleCardProps {
  role: Rol
  users: User[]
  onDrop: (roleId: number) => void
  draggedUser: User | null
}

export interface UseRolesReturn {
  roles: Rol[]
  loading: boolean
  error: string | null
  refetch: () => void
}