import { useMemo, useState, useEffect } from "react"

import type { User } from "@/types/auth"
import CargosHeader from "@/components/equipos/cargo/CargosHeader"
import UsersList from "@/components/equipos/common/UsersList"
import CargosList from "@/components/equipos/cargo/CargosList"
import { useUsers } from "@/hooks/users/useUsers"
import { useCargos } from "@/hooks/equipos/useCargos"
import Paginator from "@/components/equipos/common/Paginator"
import { setUsuarioCargo } from "@/services/api"
import { confirmMove, confirmUnassign } from "@/lib/confirm"

export default function CargosPage() {
  const { users, loading: usersLoading, refetch: usersRefetch } = useUsers()
  const {
    cargos,
    loading: cargosLoading,
    error,
    refetch,
  } = useCargos()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [cargoSearch, setCargoSearch] = useState("")
  const [cargoPage, setCargoPage] = useState(1)
  const [cargoPageSize, setCargoPageSize] = useState(10)

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

      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      const currentCargo = cargos.find(c => (Array.isArray(c.usuarios) ? c.usuarios : []).some(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === Number(userId)))
      if (currentCargo && currentCargo.idCargo === cargoId) { setDraggedUser(null); return }
      if (currentCargo && currentCargo.idCargo !== cargoId) {
        const confirmed = await confirmMove({
          entityLabel: 'cargo',
          userName: draggedUser.nombre,
          fromName: currentCargo.nombre,
          toName: targetCargo.nombre,
        })
        if (!confirmed) { setDraggedUser(null); return }
      }
      await setUsuarioCargo(Number(userId), cargoId)
      await Promise.all([refetch(), usersRefetch()])

      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user cargo:', error)
      setDraggedUser(null)
    }
  }

  const handleUnassignDrop = async () => {
    if (!draggedUser) return
    try {
      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      const currentCargo = cargos.find(c => (Array.isArray(c.usuarios) ? c.usuarios : []).some(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === Number(userId)))
      if (!currentCargo) { setDraggedUser(null); return }
      const confirmed = await confirmUnassign({
        entityLabel: 'cargo',
        userName: draggedUser.nombre,
        fromName: currentCargo.nombre,
      })
      if (!confirmed) { setDraggedUser(null); return }
      await setUsuarioCargo(Number(userId), null)
      await Promise.all([refetch(), usersRefetch()])
    } catch (e) {
      console.error('Error unassigning user from cargo:', e)
    } finally {
      setDraggedUser(null)
    }
  }

  const getUsersByCargo = (cargoId: number): User[] => {
    const cargo = cargos.find(c => c.idCargo === cargoId)
    return cargo && Array.isArray(cargo.usuarios) ? cargo.usuarios : []
  }

  const getUnassignedUsers = (): User[] => {
    const assignedIds = cargos
      .flatMap(cargo => Array.isArray(cargo.usuarios) ? cargo.usuarios : [])
      .map(u => u.idUsuario)
      .filter((id): id is number => typeof id === 'number')
    return users.filter(u => typeof u.idUsuario === 'number' && !assignedIds.includes(u.idUsuario))
  }

  const loading = usersLoading || cargosLoading
  const filteredCargos = useMemo(() => {
    const term = cargoSearch.toLowerCase()
    return cargos.filter(c => (c.nombre || '').toLowerCase().includes(term))
  }, [cargos, cargoSearch])
  const totalCargos = filteredCargos.length
  const startIndex = (cargoPage - 1) * cargoPageSize
  const pagedCargos = filteredCargos.slice(startIndex, startIndex + cargoPageSize)

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
        <div className="bg-white rounded-lg border border-gray-200 shadow flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Disponibles</h2>
            <p className="text-sm text-gray-500">Arrastra los usuarios a los cargos correspondientes</p>
          </div>
          <UsersList 
            users={getUnassignedUsers()} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
            onDropToUnassign={handleUnassignDrop}
          />
        </div>

        {/* Cargos List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cargos</h2>
              <p className="text-sm text-gray-500">Suelta los usuarios en el cargo deseado</p>
            </div>
            <input
              type="text"
              placeholder="Buscar cargo..."
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={cargoSearch}
              onChange={(e) => { setCargoSearch(e.target.value); setCargoPage(1) }}
            />
          </div>
          <CargosList
            cargos={pagedCargos}
            getUsersByCargo={getUsersByCargo}
            onDrop={handleDrop}
            draggedUser={draggedUser}
            onUserDragStart={handleDragStart}
            onUserDragEnd={handleDragEnd}
          />
          <div className="border-t border-gray-200 px-4 mt-auto">
            <Paginator
              page={cargoPage}
              pageSize={cargoPageSize}
              total={totalCargos}
              onPageChange={setCargoPage}
              onPageSizeChange={(s) => { setCargoPageSize(s); setCargoPage(1) }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}