import { User } from "../auth"

// Modelo que viene del backend
export interface Departamento {
  idDepartamento: number
  nombre: string
  usuarios?: User[] | null
}

// Modelo adaptado para UI
export interface DepartmentUI {
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
  onDropToUnassign?: () => void
}

export interface UserCardProps {
  user: User
  onDragStart: (user: User) => void
  onDragEnd: () => void
  isDragging?: boolean
}

export interface DepartmentsListProps {
  departments: Departamento[]
  getUsersByDepartment: (departmentId: number) => User[]
  onDrop: (departmentId: number) => void
  draggedUser: User | null
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
}


export interface DepartmentCardProps {
  department: Departamento
  users: User[]
  onDrop: (departmentId: number) => void
  draggedUser: User | null
  onUserDragStart?: (user: User) => void
  onUserDragEnd?: () => void
}

export interface UseDepartmentsReturn {
  departments: Departamento[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
