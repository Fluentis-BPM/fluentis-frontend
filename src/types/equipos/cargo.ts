import { User } from "../auth"

// Modelo que viene del backend
export interface Cargo {
  idCargo: number
  idJefeCargo: number | null
  jefeCargo: Cargo | null
  nombre: string
  usuarios: User[] | null
}

// Modelo adaptado para UI
export interface CargoUI {
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

export interface CargosListProps {
  cargos: Cargo[]
  getUsersByCargo: (cargoId: number) => User[]
  onDrop: (cargoId: number) => void
  draggedUser: User | null
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
}

export interface CargoCardProps {
  cargo: Cargo
  users: User[]
  onDrop: (cargoId: number) => void
  draggedUser: User | null
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
}

export interface UseCargosReturn {
  cargos: Cargo[]
  loading: boolean
  error: string | null
  refetch: () => void
}