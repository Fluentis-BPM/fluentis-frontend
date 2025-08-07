import { AprobationsListProps } from "@/types/equipos/aprobations"
import AprobationGroupCard from "./AprobationGroupCard"

export default function AprobationsList({
  grupos,
  getUsersByGroup,
  onDrop,
  draggedUser,
}: AprobationsListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {grupos.map((grupo) => (
        <AprobationGroupCard
          key={grupo.id_grupo}
          grupo={grupo}
          users={getUsersByGroup(grupo.id_grupo)}
          onDrop={onDrop}
          draggedUser={draggedUser}
        />
      ))}
    </div>
  )
} 