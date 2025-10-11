import { useState } from "react"
import { motion } from "motion/react"
import { Briefcase, Users } from 'lucide-react'
import UserCard from "../common/UserCard"
import { CargoCardProps } from "@/types/equipos/cargo"

export default function CargoCard({ cargo, users, onDrop, draggedUser }: CargoCardProps) {
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
    onDrop(cargo.idCargo)
  }

  const getCargoColor = (id: number) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
      "bg-pink-500", "bg-indigo-500", "bg-gray-500", "bg-yellow-500", 
      "bg-teal-500", "bg-red-500"
    ]
    return colors[(id - 1) % colors.length] || "bg-gray-500"
  }

  // Ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];

  // Get jefeCargo name safely
  const jefeCargoName = cargo.jefeCargo ? cargo.jefeCargo.nombre : 'Sin Jefe';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, scale: isDragOver ? 1.05 : 1.02 }}
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
      {/* Cargo Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getCargoColor(cargo.idCargo)}`}>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{cargo.nombre || 'Sin Nombre'}</h3>
            <p className="text-sm text-gray-500">
              ID: {cargo.idCargo} | Jefe: {jefeCargoName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{safeUsers.length}</span>
        </div>
      </div>

      {/* Drop Zone Message */}
      {isDragOver && (
        <div className="text-center py-4 text-primary font-medium">
          Suelta aquí para mover a {cargo.nombre || 'este cargo'}
        </div>
      )}

      {/* Users in Cargo */}
      <div className="space-y-2">
        {safeUsers.length > 0 ? (
          safeUsers.map((user) => (
            <UserCard
              key={user.oid}
              user={user}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              isDragging={draggedUser?.oid === user.oid}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay usuarios en este cargo</p>
            <p className="text-xs">Arrastra usuarios aquí para asignarlos</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}