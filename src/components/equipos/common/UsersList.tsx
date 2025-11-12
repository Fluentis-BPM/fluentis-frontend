
import { Search } from 'lucide-react'
import { useMemo, useState } from "react"
import UserCard from "./UserCard"
import { UsersListProps } from '@/types/equipos/department'
import Paginator from './Paginator'


export default function UsersList({ users, onDragStart, onDragEnd, onDropToUnassign }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isDragOver, setIsDragOver] = useState(false)

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.departamento?.toLowerCase() || '').includes(term) ||
        (user.cargo?.toLowerCase() || '').includes(term),
    )
  }, [users, searchTerm])

  const total = filteredUsers.length
  const startIndex = (page - 1) * pageSize
  const pageItems = filteredUsers.slice(startIndex, startIndex + pageSize)

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setPage(1)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDropToUnassign) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!onDropToUnassign) return
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!onDropToUnassign) return
    e.preventDefault()
    setIsDragOver(false)
    onDropToUnassign()
  }

  return (
    <div
      className={`flex flex-col flex-1 min-h-0 ${isDragOver ? 'bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {pageItems.length > 0 ? (
          pageItems.map((user) => (
            <UserCard key={user.oid} user={user} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron usuarios sin asignar</p>
            <p className="text-sm mt-1">Todos los usuarios están asignados a departamentos</p>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 px-4">
        <Paginator
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </div>
    </div>
  )
}
