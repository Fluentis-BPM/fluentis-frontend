
import { Search } from 'lucide-react'
import { useState } from "react"
import UserCard from "./UserCard"
import { UsersListProps } from '@/types/equipos/department'


export default function UsersList({ users, onDragStart, onDragEnd }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cargo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard key={user.oid} user={user} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron usuarios sin asignar</p>
            <p className="text-sm mt-1">Todos los usuarios están asignados a departamentos</p>
          </div>
        )}
      </div>
    </div>
  )
}
