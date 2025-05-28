import { useState, useEffect } from "react"

import type { User } from "@/types/auth"
import { Departamento } from "@/types/equipos/department"
import DepartmentsHeader from "@/components/equipos/department/DepartmentsHeader"
import UsersList from "@/components/equipos/department/UsersList"
import DepartmentsList from "@/components/equipos/department/DepartmentsList"
import { useUsers } from "@/hooks/users/useUsers"


export default function DepartmentsPage() {
  const { users, loading: usersLoading } = useUsers()
  const [departments, setDepartments] = useState<Departamento[]>([])
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [departmentsLoading, setDepartmentsLoading] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const mockDepartments: Departamento[] = [
          {
            idDepartamento: 1,
            nombre: "Recursos Humanos",
            usuarios: ["oid-123456-abcdef-1", "oid-123456-abcdef-4", "oid-123456-abcdef-14"]
          },
          {
            idDepartamento: 2,
            nombre: "Finanzas",
            usuarios: ["oid-123456-abcdef-2", "oid-123456-abcdef-10"]
          },
          {
            idDepartamento: 3,
            nombre: "Tecnología",
            usuarios: ["oid-123456-abcdef-3", "oid-123456-abcdef-7", "oid-123456-abcdef-15"]
          },
          {
            idDepartamento: 4,
            nombre: "Ventas",
            usuarios: ["oid-123456-abcdef-5"]
          },
          {
            idDepartamento: 5,
            nombre: "Marketing",
            usuarios: ["oid-123456-abcdef-6"]
          },
          {
            idDepartamento: 6,
            nombre: "Operaciones",
            usuarios: ["oid-123456-abcdef-8"]
          },
          {
            idDepartamento: 7,
            nombre: "Legal",
            usuarios: ["oid-123456-abcdef-9"]
          },
          {
            idDepartamento: 8,
            nombre: "Producción",
            usuarios: ["oid-123456-abcdef-11"]
          },
          {
            idDepartamento: 9,
            nombre: "Calidad",
            usuarios: ["oid-123456-abcdef-12"]
          },
          {
            idDepartamento: 10,
            nombre: "Investigación",
            usuarios: ["oid-123456-abcdef-13"]
          }
        ]
        
        setDepartments(mockDepartments)
        setDepartmentsLoading(false)
      } catch (error) {
        console.error('Error fetching departments:', error)
        setDepartmentsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
  }

  const handleDrop = async (departmentId: number) => {
    if (!draggedUser) return

    try {
   
      const targetDepartment = departments.find(d => d.idDepartamento === departmentId)
      if (!targetDepartment) return


      const updatedDepartments = departments.map(dept => ({
        ...dept,
        usuarios: dept.usuarios?.filter(userId => userId !== draggedUser.oid) || []
      }))

      const finalDepartments = updatedDepartments.map(dept => 
        dept.idDepartamento === departmentId
          ? { ...dept, usuarios: [...(dept.usuarios || []), draggedUser.oid] }
          : dept
      )


      setDepartments(finalDepartments)


      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user department:', error)
      setDraggedUser(null)
    }
  }


  const getUsersByDepartment = (departmentId: number): User[] => {
    const department = departments.find(d => d.idDepartamento === departmentId)
    if (!department || !department.usuarios) return []
    
    return users.filter(user => department.usuarios?.includes(user.oid))
  }


  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = departments.flatMap(dept => dept.usuarios || [])
    return users.filter(user => !assignedUserIds.includes(user.oid))
  }

  const loading = usersLoading || departmentsLoading

  if (loading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <DepartmentsHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando departamentos y usuarios...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <DepartmentsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Disponibles</h2>
            <p className="text-sm text-gray-500">Arrastra los usuarios a los departamentos correspondientes</p>
          </div>
          <UsersList 
            users={getUnassignedUsers()} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd} 
          />
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Departamentos</h2>
            <p className="text-sm text-gray-500">Suelta los usuarios en el departamento deseado</p>
          </div>
          <DepartmentsList
            departments={departments}
            getUsersByDepartment={getUsersByDepartment}
            onDrop={handleDrop}
            draggedUser={draggedUser}
          />
        </div>
      </div>
    </main>
  )
}
