import { User } from "../auth"

export interface Departamento {
  idDepartamento: number
  nombre: string
  usuarios?: string[] | null
}

export interface Department {
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

export interface DepartmentsListProps {
  departments: Departamento[]
  getUsersByDepartment: (departmentId: number) => User[]
  onDrop: (departmentId: number) => void
  draggedUser: User | null
}


export interface DepartmentCardProps {
  department: Departamento
  users: User[]
  onDrop: (departmentId: number) => void
  draggedUser: User | null
}
