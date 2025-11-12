import { useState } from "react"
import { Building2, Users } from 'lucide-react'
import UserCard from "../common/UserCard"
import { RoleCardProps } from "@/types/equipos/role"

import { useRef } from "react"

export default function RoleCard({ role, users, onDrop, draggedUser, onUserDragStart, onUserDragEnd }: RoleCardProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragEnterCounter = useRef(0)

  const handleDragOver = (e: React.DragEvent) => {
    // Necesario para permitir drop
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCounter.current += 1
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCounter.current -= 1
    if (dragEnterCounter.current <= 0) {
      dragEnterCounter.current = 0
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCounter.current = 0
    setIsDragOver(false)
    onDrop(role.idRol)
  }

  const getRoleColor = (id: number) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
      "bg-pink-500", "bg-indigo-500", "bg-gray-500", "bg-yellow-500", 
      "bg-teal-500", "bg-red-500"
    ]
    return colors[(id - 1) % colors.length] || "bg-gray-500"
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 transition-colors duration-150 ${
        isDragOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : draggedUser
            ? "border-gray-300 bg-gray-50"
            : "border-gray-200 bg-white"
      }`}
    >
      {/* Role Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getRoleColor(role.idRol)}`}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{role.nombre}</h3>
            <p className="text-sm text-gray-500">ID: {role.idRol}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{users.length}</span>
        </div>
      </div>

      {/* Drop Zone Message */}
      {isDragOver && (
        <div className="text-center py-4 text-primary font-medium">
          Suelta aquí para mover a {role.nombre}
        </div>
      )}

      {/* Users in Role */}
      <div className="space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.oid}
              user={user}
              onDragStart={onUserDragStart || (() => {})}
              onDragEnd={onUserDragEnd || (() => {})}
              isDragging={draggedUser?.oid === user.oid}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay usuarios en este rol</p>
            <p className="text-xs">Arrastra usuarios aquí para asignarlos</p>
          </div>
        )}
      </div>
    </div>
  )
}