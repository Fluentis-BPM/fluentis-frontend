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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a90]" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="w-full rounded-xl border border-[#dbe7f3] pl-10 py-2 focus:border-[#1a4e8a] focus:outline-none focus:ring-1 focus:ring-[#1a4e8a] bg-[#f6fafd] text-[#1a4e8a]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 rounded-xl border border-[#dbe7f3] bg-[#f6fafd] px-4 py-2 text-sm font-medium text-[#1a4e8a] hover:bg-[#eaf3fa]">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-[#dbe7f3] bg-[#f6fafd] px-4 py-2 text-sm font-medium text-[#1a4e8a] hover:bg-[#eaf3fa]">
          <Download className="h-4 w-4" />
          Exportar
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-[#1a4e8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#163e6c]">
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>
    </div>
  )
}
