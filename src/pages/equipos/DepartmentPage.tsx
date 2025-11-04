import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"

import type { User } from "@/types/auth"
import DepartmentsHeader from "@/components/equipos/department/DepartmentsHeader"
import UsersList from "@/components/equipos/common/UsersList"
import DepartmentsList from "@/components/equipos/department/DepartmentsList"
import { useUsers } from "@/hooks/users/useUsers"
import { useDepartments } from "@/hooks/equipos/useDepartments"
import Paginator from "@/components/equipos/common/Paginator"
import { setUsuarioDepartamento } from "@/services/api"

export default function DepartmentsPage() {
  const { users, loading: usersLoading, refetch: usersRefetch } = useUsers()
  const {
    departments,
    loading: departmentsLoading,
    error,
    refetch,
  } = useDepartments()

  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [deptSearch, setDeptSearch] = useState("")
  const [deptPage, setDeptPage] = useState(1)
  const [deptPageSize, setDeptPageSize] = useState(10)

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
      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      const currentDept = departments.find(d => (d.usuarios || []).some(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === Number(userId)))
      if (currentDept && currentDept.idDepartamento === departmentId) {
        setDraggedUser(null)
        return
      }
      if (currentDept && currentDept.idDepartamento !== departmentId) {
        const confirmed = window.confirm(`¿Mover a ${draggedUser.nombre} del departamento "${currentDept.nombre}" al departamento "${targetDepartment.nombre}"?`)
        if (!confirmed) { setDraggedUser(null); return }
      }
      await setUsuarioDepartamento(Number(userId), departmentId)
      await Promise.all([refetch(), usersRefetch()])
      setDraggedUser(null)
    } catch (error) {
      console.error('Error updating user department:', error)
      setDraggedUser(null)
    }
  }

  const handleUnassignDrop = async () => {
    if (!draggedUser) return
    try {
      const userId = draggedUser.idUsuario ?? (typeof draggedUser.oid === 'number' ? draggedUser.oid : parseInt(String(draggedUser.oid)))
      if (!userId || isNaN(Number(userId))) return
      const currentDept = departments.find(d => (d.usuarios || []).some(u => (u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid)))) === Number(userId)))
      if (!currentDept) { setDraggedUser(null); return }
      const confirmed = window.confirm(`¿Quitar a ${draggedUser.nombre} del departamento "${currentDept.nombre}"?`)
      if (!confirmed) { setDraggedUser(null); return }
      await setUsuarioDepartamento(Number(userId), null)
      await Promise.all([refetch(), usersRefetch()])
    } catch (e) {
      console.error('Error unassigning user from department:', e)
    } finally {
      setDraggedUser(null)
    }
  }

  const getUsersByDepartment = (departmentId: number): User[] => {
    const department = departments.find(d => d.idDepartamento === departmentId)
    if (!department || !department.usuarios) return []
    return department.usuarios
  }

  const getUnassignedUsers = (): User[] => {
    const assignedIds = departments
      .flatMap(dept => dept.usuarios || [])
      .map(u => u.idUsuario)
      .filter((id): id is number => typeof id === 'number')
    return users.filter(u => typeof u.idUsuario === 'number' && !assignedIds.includes(u.idUsuario))
  }

  const loading = usersLoading || departmentsLoading
  const filteredDepartments = useMemo(() => {
    const term = deptSearch.toLowerCase()
    return departments.filter(d => d.nombre.toLowerCase().includes(term))
  }, [departments, deptSearch])

  const totalDepts = filteredDepartments.length
  const startIndex = (deptPage - 1) * deptPageSize
  const pagedDepartments = filteredDepartments.slice(startIndex, startIndex + deptPageSize)

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
        <div className="max-w-5xl mx-auto pt-8">
          <DepartmentsHeader />
          <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center h-64"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4e8a] mx-auto"></div>
                <p className="mt-2 text-[#6b7a90]">Cargando departamentos y usuarios...</p>
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
          <DepartmentsHeader />
          <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-red-500 text-center mt-8"
            >
              <p>Error al cargar departamentos: {error}</p>
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
        <DepartmentsHeader />
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
              <p className="text-sm text-[#6b7a90]">Arrastra los usuarios a los departamentos correspondientes</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <UsersList 
                users={getUnassignedUsers()} 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd}
                onDropToUnassign={handleUnassignDrop}
              />
            </div>
          </motion.div>

          {/* Departments List */}
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
                <h2 className="text-lg font-semibold text-[#1a4e8a]">Departamentos</h2>
                <p className="text-sm text-[#6b7a90]">Suelta los usuarios en el departamento deseado</p>
              </div>
              <input
                type="text"
                placeholder="Buscar departamento..."
                className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={deptSearch}
                onChange={(e) => { setDeptSearch(e.target.value); setDeptPage(1) }}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <DepartmentsList
                departments={pagedDepartments}
                getUsersByDepartment={getUsersByDepartment}
                onDrop={handleDrop}
                draggedUser={draggedUser}
                onUserDragStart={handleDragStart}
                onUserDragEnd={handleDragEnd}
              />
            </div>
            <div className="border-t border-[#eaf3fa] px-4">
              <Paginator
                page={deptPage}
                pageSize={deptPageSize}
                total={totalDepts}
                onPageChange={setDeptPage}
                onPageSizeChange={(s) => { setDeptPageSize(s); setDeptPage(1) }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
