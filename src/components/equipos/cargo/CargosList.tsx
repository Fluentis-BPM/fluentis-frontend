import { CargosListProps } from "@/types/equipos/cargo"
import CargoCard from "./CargoCard"

export default function CargosList({
  cargos,
  getUsersByCargo,
  onDrop,
  draggedUser,
}: CargosListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {cargos.map((cargo) => (
        <CargoCard
          key={cargo.idCargo}
          cargo={cargo}
          users={getUsersByCargo(cargo.idCargo)}
          onDrop={onDrop}
          draggedUser={draggedUser}
        />
      ))}
    </div>
  )
}