import { useState, useEffect } from "react"

import type { User } from "@/types/auth"
import DepartmentsHeader from "@/components/equipos/department/DepartmentsHeader"
import UsersList from "@/components/equipos/department/UsersList"
import DepartmentsList from "@/components/equipos/department/DepartmentsList"
import { useUsers } from "@/hooks/users/useUsers"
import { useDepartments } from "@/hooks/equipos/useDepartments"

export default function DepartmentsPage() {
  const { users, loading: usersLoading } = useUsers()
  const {
    departments,
    loading: departmentsLoading,
    error,
    refetch,
  } = useDepartments()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)

  useEffect(() => {
    console.log('API Users Data in DepartmentPage:', users)
    console.log('Users Loading:', usersLoading)
  }, [users, usersLoading])

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


      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user department:', error)
      setDraggedUser(null)
    }
  }

  const getUsersByDepartment = (departmentId: number): User[] => {
    const department = departments.find(d => d.idDepartamento === departmentId)
    if (!department || !department.usuarios) return []
    return department.usuarios
  }

  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = departments.flatMap(dept => dept.usuarios || []).map(user => user.oid)
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

  if (error) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <DepartmentsHeader />
        <div className="text-red-500 text-center mt-8">
          <p>Error al cargar departamentos: {error}</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reintentar
          </button>
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
