import {  DepartmentsListProps } from "@/types/equipos/department"
import DepartmentCard from "./DepartmentCard"


export default function DepartmentsList({
  departments,
  getUsersByDepartment,
  onDrop,
  draggedUser,
}: DepartmentsListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {departments.map((department) => (
        <DepartmentCard
          key={department.idDepartamento}
          department={department}
          users={getUsersByDepartment(department.idDepartamento)}
          onDrop={onDrop}
          draggedUser={draggedUser}
        />
      ))}
    </div>
  )
}
