import { useState, useEffect } from "react"

import type { User } from "@/types/auth"
import RolesHeader from "@/components/equipos/role/RolesHeader"
import UsersList from "@/components/equipos/common/UsersList"
import RolesList from "@/components/equipos/role/RolesList"
import { useUsers } from "@/hooks/users/useUsers"
import { useRoles } from "@/hooks/equipos/useRoles"

export default function RolesPage() {
  const { users, loading: usersLoading } = useUsers()
  const {
    roles,
    loading: rolesLoading,
    error,
    refetch,
  } = useRoles()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)

  useEffect(() => {
    console.log('API Users Data in RolesPage:', users)
    console.log('Users Loading:', usersLoading)
  }, [users, usersLoading])

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
  }

  const handleDrop = async (roleId: number) => {
    if (!draggedUser) return

    try {
      const targetRole = roles.find(r => r.idRol === roleId)
      if (!targetRole) return

      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
      setDraggedUser(null)
    }
  }

  const getUsersByRole = (roleId: number): User[] => {
    const role = roles.find(r => r.idRol === roleId)
    if (!role || !role.usuarios) return []
    return role.usuarios
  }

  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = roles.flatMap(role => role.usuarios || []).map(user => user.oid)
    return users.filter(user => !assignedUserIds.includes(user.oid))
  }

  const loading = usersLoading || rolesLoading

  if (loading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <RolesHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando roles y usuarios...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <RolesHeader />
        <div className="text-red-500 text-center mt-8">
          <p>Error al cargar roles: {error}</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <RolesHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Disponibles</h2>
            <p className="text-sm text-gray-500">Arrastra los usuarios a los roles correspondientes</p>
          </div>
          <UsersList 
            users={getUnassignedUsers()} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd} 
          />
        </div>

        {/* Roles List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            <p className="text-sm text-gray-500">Suelta los usuarios en el rol deseado</p>
          </div>
          <RolesList
            roles={roles}
            getUsersByRole={getUsersByRole}
            onDrop={handleDrop}
            draggedUser={draggedUser}
          />
        </div>
      </div>
    </main>
  )
}