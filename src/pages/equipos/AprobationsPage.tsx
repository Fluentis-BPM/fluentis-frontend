import { useState, useEffect } from "react"
import { motion } from "motion/react"

import type { User } from "@/types/auth"
import AprobationsHeader from "@/components/equipos/aprobations/AprobationsHeader"
import UsersList from "@/components/equipos/common/UsersList"
import AprobationsList from "@/components/equipos/aprobations/AprobationsList"
import { useUsers } from "@/hooks/users/useUsers"
import { useAprobations } from "@/hooks/equipos/aprobations/useAprobations"

export default function AprobationsPage() {
  const { users, loading: usersLoading } = useUsers()
  const {
    grupos,
    loading: gruposLoading,
    error,
    refetch,
  } = useAprobations()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)

  useEffect(() => {
    console.log('API Users Data in AprobationsPage:', users)
    console.log('Users Loading:', usersLoading)
  }, [users, usersLoading])

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
  }

  const handleDrop = async (groupId: number) => {
    if (!draggedUser) return

    try {
      const targetGroup = grupos.find(g => g.id_grupo === groupId)
      if (!targetGroup) return

      // Aquí se implementaría la lógica para asignar el usuario al grupo
      // Por ahora solo limpiamos el estado
      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user group:', error)
      setDraggedUser(null)
    }
  }

  const getUsersByGroup = (groupId: number): User[] => {
    const group = grupos.find(g => g.id_grupo === groupId)
    if (!group || !group.usuarios) return []
    return group.usuarios
  }

  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = grupos.flatMap(group => group.usuarios || []).map(user => user.oid)
    return users.filter(user => !assignedUserIds.includes(user.oid))
  }

  const loading = usersLoading || gruposLoading

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
        <div className="max-w-5xl mx-auto pt-8">
          <AprobationsHeader />
          <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center h-64"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4e8a] mx-auto"></div>
                <p className="mt-2 text-[#6b7a90]">Cargando grupos de aprobación y usuarios...</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
        <div className="max-w-5xl mx-auto pt-8">
          <AprobationsHeader />
          <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-red-500 text-center mt-8"
            >
              <p>Error al cargar grupos de aprobación: {error}</p>
              <button onClick={refetch} className="mt-4 px-4 py-2 bg-[#1a4e8a] text-white rounded hover:bg-[#163e6c]">
                Reintentar
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
      <div className="max-w-5xl mx-auto pt-8">
        <AprobationsHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0 flex flex-col"
            style={{ maxHeight: '600px' }}
          >
            <div className="p-4 border-b border-[#eaf3fa]">
              <h2 className="text-lg font-semibold text-[#1a4e8a]">Usuarios Disponibles</h2>
              <p className="text-sm text-[#6b7a90]">Arrastra los usuarios a los grupos de aprobación correspondientes</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <UsersList 
                users={getUnassignedUsers()} 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd} 
              />
            </div>
          </motion.div>

          {/* Groups List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0 flex flex-col"
            style={{ maxHeight: '600px' }}
          >
            <div className="p-4 border-b border-[#eaf3fa]">
              <h2 className="text-lg font-semibold text-[#1a4e8a]">Grupos de Aprobación</h2>
              <p className="text-sm text-[#6b7a90]">Suelta los usuarios en el grupo de aprobación deseado</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AprobationsList
                grupos={grupos}
                getUsersByGroup={getUsersByGroup}
                onDrop={handleDrop}
                draggedUser={draggedUser}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
} 