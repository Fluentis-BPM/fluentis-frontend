
import { GripVertical } from 'lucide-react'
import type { User } from "@/types/auth"
import { UserCardProps } from '@/types/equipos/department'


export default function UserCard({ user, onDragStart, onDragEnd, isDragging = false }: UserCardProps) {
  const getRoleBadgeColor = (rol: User["rol"]) => {
    switch (rol) {
      case "Administrador":
        return "bg-green-100 text-green-800"
      case "Miembro":
        return "bg-blue-100 text-blue-800"
      case "Visualizador":
        return "bg-purple-100 text-purple-800"
      case "Visualizadordepartamental":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(user)}
      onDragEnd={onDragEnd}
      className={`flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:border-primary"
      }`}
    >
      <GripVertical className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />

      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm mr-3">
        {user.nombre.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">{user.nombre}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(user.rol)}`}>
              {user.rol}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{user.cargo}</p>
      </div>
    </div>
  )
}
