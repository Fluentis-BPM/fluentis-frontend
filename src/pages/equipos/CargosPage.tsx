import { useState, useEffect } from "react"

import type { User } from "@/types/auth"
import CargosHeader from "@/components/equipos/cargo/CargosHeader"
import UsersList from "@/components/equipos/common/UsersList"
import CargosList from "@/components/equipos/cargo/CargosList"
import { useUsers } from "@/hooks/users/useUsers"
import { useCargos } from "@/hooks/equipos/useCargos"

export default function CargosPage() {
  const { users, loading: usersLoading } = useUsers()
  const {
    cargos,
    loading: cargosLoading,
    error,
    refetch,
  } = useCargos()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)

  useEffect(() => {
    console.log('API Users Data in CargosPage:', users)
    console.log('API Cargos Data:', cargos)
    console.log('Users Loading:', usersLoading)
  }, [users, cargos, usersLoading])

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
  }

  const handleDrop = async (cargoId: number) => {
    if (!draggedUser) return

    try {
      const targetCargo = cargos.find(c => c.idCargo === cargoId)
      if (!targetCargo) return

      // TODO: Implement API call to assign user to cargo
      // Example: await api.patch(`/api/Cargos/${cargoId}/assignUser`, { userId: draggedUser.oid })

      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user cargo:', error)
      setDraggedUser(null)
    }
  }

  const getUsersByCargo = (cargoId: number): User[] => {
    const cargo = cargos.find(c => c.idCargo === cargoId)
    return cargo && Array.isArray(cargo.usuarios) ? cargo.usuarios : []
  }

  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = cargos.flatMap(cargo => Array.isArray(cargo.usuarios) ? cargo.usuarios.map(user => user.oid) : [])
    return users.filter(user => !assignedUserIds.includes(user.oid))
  }

  const loading = usersLoading || cargosLoading

  if (loading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <CargosHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando cargos y usuarios...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <CargosHeader />
        <div className="text-red-500 text-center mt-8">
          <p>Error al cargar cargos: {error}</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <CargosHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Disponibles</h2>
            <p className="text-sm text-gray-500">Arrastra los usuarios a los cargos correspondientes</p>
          </div>
          <UsersList 
            users={getUnassignedUsers()} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd} 
          />
        </div>

        {/* Cargos List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cargos</h2>
            <p className="text-sm text-gray-500">Suelta los usuarios en el cargo deseado</p>
          </div>
          <CargosList
            cargos={cargos}
            getUsersByCargo={getUsersByCargo}
            onDrop={handleDrop}
            draggedUser={draggedUser}
          />
        </div>
      </div>
    </main>
  )
}