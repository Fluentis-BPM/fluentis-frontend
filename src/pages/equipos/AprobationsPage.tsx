import { useMemo, useState, useEffect } from "react"
import { motion } from "motion/react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Users as UsersIcon, Search } from 'lucide-react'

import type { User } from "@/types/auth"
import AprobationsHeader from "@/components/equipos/aprobations/AprobationsHeader"
import UsersList from "@/components/equipos/common/UsersList"
import AprobationsList from "@/components/equipos/aprobations/AprobationsList"
import { useUsers } from "@/hooks/users/useUsers"
import { useAprobations } from "@/hooks/equipos/aprobations/useAprobations"
import { confirmRemoveFromGroups } from "@/lib/confirm"
import Paginator from "@/components/equipos/common/Paginator"

export default function AprobationsPage() {
  const { users, loading: usersLoading } = useUsers()
  const {
    grupos,
    loading: gruposLoading,
    error,
    refetch,
    createGrupo,
    creating,
    createError,
    addUsuarios,
    removeUsuario,
  } = useAprobations()
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [esGlobal, setEsGlobal] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [draggedFromGroupId, setDraggedFromGroupId] = useState<number | null>(null)
  const [openUsersPicker, setOpenUsersPicker] = useState(false)
  const [searchMiembros, setSearchMiembros] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [groupPage, setGroupPage] = useState(1)
  const [groupPageSize, setGroupPageSize] = useState(10)

  useEffect(() => {
    console.log('API Users Data in AprobationsPage:', users)
    console.log('Users Loading:', usersLoading)
  }, [users, usersLoading])

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
    setDraggedFromGroupId(null)
  }

  const handleDrop = async (groupId: number) => {
    if (!draggedUser) return

    try {
      const targetGroup = grupos.find(g => g.id_grupo === groupId)
      if (!targetGroup) return
      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      // Add to target group (users can belong to multiple groups)
      await addUsuarios(groupId, [userId])
      setDraggedUser(null)
      setDraggedFromGroupId(null)
    } catch (error) {
      console.error('Error updating user group:', error)
      setDraggedUser(null)
      setDraggedFromGroupId(null)
    }
  }

  const getUsersByGroup = (groupId: number): User[] => {
    const group = grupos.find(g => g.id_grupo === groupId)
    if (!group || !group.usuarios) return []
    return group.usuarios
  }

  const getUnassignedUsers = (): User[] => {
    // For approval groups, users can belong to multiple groups; show all users in the left list.
    return users
  }

  const handleUnassignDrop = async () => {
    if (!draggedUser) return
    try {
      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      // If we started drag from a specific group, remove only from that group
      if (draggedFromGroupId) {
        const g = grupos.find(x => x.id_grupo === draggedFromGroupId)
        if (!g) { setDraggedUser(null); setDraggedFromGroupId(null); return }
        const confirmed = await confirmRemoveFromGroups({ userName: draggedUser.nombre, count: 1 })
        if (!confirmed) { setDraggedUser(null); setDraggedFromGroupId(null); return }
        await removeUsuario(draggedFromGroupId, userId)
      } else {
        const containing = grupos.filter(g => (g.usuarios || []).some(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === userId))
        if (containing.length === 0) { setDraggedUser(null); return }
        const confirmed = await confirmRemoveFromGroups({ userName: draggedUser.nombre, count: containing.length })
        if (!confirmed) { setDraggedUser(null); return }
        for (const g of containing) {
          await removeUsuario(g.id_grupo, userId)
        }
      }
    } catch (e) {
      console.error('Error unassigning user from group:', e)
    } finally {
      setDraggedUser(null)
    }
  }

  const loading = usersLoading || gruposLoading
  const filteredGrupos = useMemo(() => {
    const term = groupSearch.toLowerCase()
    return grupos.filter(g => g.nombre.toLowerCase().includes(term))
  }, [grupos, groupSearch])
  const totalGroups = filteredGrupos.length
  const startIndex = (groupPage - 1) * groupPageSize
  const pagedGroups = filteredGrupos.slice(startIndex, startIndex + groupPageSize)

  const handleCrearGrupo = async () => {
    if (!nuevoNombre.trim()) return
    await createGrupo({ nombre: nuevoNombre.trim(), esGlobal, usuarioIds: selectedUserIds })
    setNuevoNombre('')
    setEsGlobal(false)
    setSelectedUserIds([])
    setSearchMiembros('')
    setOpenUsersPicker(false)
  }

  const toggleUsuario = (u: User) => {
    const id = u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)));
    if (!id || isNaN(id)) return;
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }

  const usuariosFiltrados = users.filter(u => {
    const term = searchMiembros.toLowerCase();
    return [u.nombre, u.email, u.departamentoNombre || '', u.cargoNombre || '']
      .some(f => f.toLowerCase().includes(term));
  });

  const selectedUsersObjects = selectedUserIds
    .map(id => users.find(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === id))
    .filter(Boolean) as User[];

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
                onDropToUnassign={handleUnassignDrop}
              />
              <div className="p-4 border-t border-[#eaf3fa] space-y-3">
                <h3 className="text-sm font-semibold text-[#1a4e8a]">Nuevo Grupo</h3>
                <input
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Nombre del grupo"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 text-xs text-[#1a4e8a]">
                  <input type="checkbox" checked={esGlobal} onChange={e => setEsGlobal(e.target.checked)} />
                  Es global
                </label>
                {/* Selector de miembros */}
                <div className="space-y-2">
                  <p className="text-xs text-[#6b7a90]">Miembros del grupo</p>
                  <Popover open={openUsersPicker} onOpenChange={setOpenUsersPicker}>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full flex items-center justify-between rounded border px-2 py-2 text-xs hover:border-primary/60">
                        <span className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-[#1a4e8a]" />
                          {selectedUserIds.length === 0 ? 'Seleccionar usuarios' : `${selectedUserIds.length} usuario(s) seleccionados`}
                        </span>
                        <span className="text-[10px] text-[#6b7a90]">{openUsersPicker ? 'Cerrar' : 'Abrir'}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3 space-y-3" align="start">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={searchMiembros}
                          onChange={e => setSearchMiembros(e.target.value)}
                          placeholder="Buscar..."
                          className="pl-8 h-8 text-xs"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto rounded border bg-white divide-y">
                        {usuariosFiltrados.map(u => {
                          const idNum = typeof u.oid === 'string' ? parseInt(u.oid) : u.oid
                          const checked = selectedUserIds.includes(idNum)
                          return (
                            <button
                              type="button"
                              key={u.oid}
                              onClick={() => toggleUsuario(u)}
                              className={`w-full flex items-start gap-2 text-left px-3 py-2 text-xs hover:bg-primary/5 ${checked ? 'bg-primary/10' : ''}`}
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={checked}
                                className="mt-0.5 h-3 w-3"
                              />
                              <span className="flex-1">
                                <span className="font-medium text-[#1a4e8a] block">{u.nombre}</span>
                                <span className="text-[10px] text-[#6b7a90] block truncate">{u.email}</span>
                              </span>
                            </button>
                          )
                        })}
                        {usuariosFiltrados.length === 0 && (
                          <div className="text-center py-6 text-[11px] text-gray-400">Sin resultados</div>
                        )}
                      </div>
                      {selectedUsersObjects.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedUsersObjects.map(u => {
                            const idNum = typeof u.oid === 'string' ? parseInt(u.oid) : u.oid
                            return (
                              <span key={u.oid} className="flex items-center gap-1 bg-[#1a4e8a] text-white rounded px-2 py-0.5 text-[10px]">
                                {u.nombre}
                                <button type="button" onClick={() => setSelectedUserIds(prev => prev.filter(id => id !== idNum))} className="hover:text-red-200">✕</button>
                              </span>
                            )
                          })}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t mt-1">
                        <button type="button" onClick={() => { setSelectedUserIds([]) }} className="text-[10px] text-red-500 hover:underline">Limpiar</button>
                        <button type="button" onClick={() => setOpenUsersPicker(false)} className="text-[10px] text-[#1a4e8a] hover:underline">Listo</button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <button
                  onClick={handleCrearGrupo}
                  disabled={creating || !nuevoNombre.trim()}
                  className="w-full bg-[#1a4e8a] text-white rounded py-1 text-sm disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear grupo'}
                </button>
                {createError && <p className="text-xs text-red-500">{createError}</p>}
              </div>
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
            <div className="p-4 border-b border-[#eaf3fa] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1a4e8a]">Grupos de Aprobación</h2>
                <p className="text-sm text-[#6b7a90]">Suelta los usuarios en el grupo de aprobación deseado</p>
              </div>
              <input
                type="text"
                placeholder="Buscar grupo..."
                className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={groupSearch}
                onChange={(e) => { setGroupSearch(e.target.value); setGroupPage(1) }}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <AprobationsList
                grupos={pagedGroups}
                getUsersByGroup={getUsersByGroup}
                onDrop={handleDrop}
                draggedUser={draggedUser}
                onUserDragStart={handleDragStart}
                onUserDragEnd={handleDragEnd}
                onUserDragStartFromGroup={(user, fromGroupId) => { setDraggedUser(user); setDraggedFromGroupId(fromGroupId) }}
              />
            </div>
            <div className="border-t border-[#eaf3fa] px-4">
              <Paginator
                page={groupPage}
                pageSize={groupPageSize}
                total={totalGroups}
                onPageChange={setGroupPage}
                onPageSizeChange={(s) => { setGroupPageSize(s); setGroupPage(1) }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}