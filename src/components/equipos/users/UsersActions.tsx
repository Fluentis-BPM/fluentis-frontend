"use client"

import { Search, Filter, UserPlus, Download } from "lucide-react"

interface UsersActionsProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function UsersActions({ searchTerm, setSearchTerm }: UsersActionsProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="w-full rounded-lg border border-gray-300 pl-10 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>
    </div>
  )
}
