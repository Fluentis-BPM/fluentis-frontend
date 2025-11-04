import { RolesListProps } from "@/types/equipos/role"
import RoleCard from "./RoleCard"

export default function RolesList({
  roles,
  getUsersByRole,
  onDrop,
  draggedUser,
  onUserDragStart,
  onUserDragEnd,
}: RolesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {roles.map((role) => (
        <RoleCard
          key={role.idRol}
          role={role}
          users={getUsersByRole(role.idRol)}
          onDrop={onDrop}
          draggedUser={draggedUser}
          onUserDragStart={onUserDragStart}
          onUserDragEnd={onUserDragEnd}
        />
      ))}
    </div>
  )
}