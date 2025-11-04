import { useState } from "react"
import { Shield, Users, Globe } from 'lucide-react'
import UserCard from "../common/UserCard"
import { AprobationGroupCardProps } from "@/types/equipos/aprobations"

export default function AprobationGroupCard({ grupo, users, onDrop, draggedUser, onUserDragStart, onUserDragEnd, onUserDragStartFromGroup }: AprobationGroupCardProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(grupo.id_grupo)
  }

  const getGroupColor = (id: number) => {
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
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
        isDragOver
          ? "border-primary bg-primary/5 scale-105"
          : draggedUser
            ? "border-gray-300 bg-gray-50"
            : "border-gray-200 bg-white"
      }`}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getGroupColor(grupo.id_grupo)}`}>
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{grupo.nombre}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>ID: {grupo.id_grupo}</span>
              {grupo.es_global && (
                <div className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Global</span>
                </div>
              )}
            </div>
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
          Suelta aquí para mover a {grupo.nombre}
        </div>
      )}

      {/* Users in Group */}
      <div className="space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.oid}
              user={user}
              onDragStart={() => {
                if (onUserDragStart) onUserDragStart(user)
                if (onUserDragStartFromGroup) onUserDragStartFromGroup(user, grupo.id_grupo)
              }}
              onDragEnd={onUserDragEnd || (() => {})}
              isDragging={draggedUser?.oid === user.oid}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay usuarios en este grupo</p>
            <p className="text-xs">Arrastra usuarios aquí para asignarlos</p>
          </div>
        )}
      </div>
    </div>
  )
} 