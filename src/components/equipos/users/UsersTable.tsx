import { Edit, Trash2, Eye } from "lucide-react"
import type { User } from "@/types/auth"

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users }: UsersTableProps) {

  const getRoleBadgeColor = (rol: User["rolNombre"]) => {
    switch (rol) {
      case "Administrador":
        return "bg-green-100 text-green-800"
      case "Miembro":
        return "bg-blue-100 text-blue-800"
      case "Visualizador":
        return "bg-purple-100 text-purple-800"
      case "Visualizador Departamental":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="w-full">
      <table className="w-full table-fixed divide-y divide-[#dbe7f3]">
        <thead className="bg-[#f6fafd]">
          <tr>
            <th className="w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Nombre</th>
            <th className="w-[260px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Email</th>
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Departamento</th>
            <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Rol</th>
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Cargo</th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7a90]">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaf3fa] bg-white">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.oid} className="hover:bg-[#f6fafd] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#eaf3fa] flex items-center justify-center text-[#1a4e8a] font-bold border border-[#dbe7f3]">
                      {user.nombre.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-[#1a4e8a]">{user.nombre}</div>
                      <div className="text-xs text-[#6b7a90]">OID: {user.oid.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[#6b7a90]">{user.email}</td>
                <td className="px-4 py-4 text-sm text-[#6b7a90]">{user.departamentoNombre}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${getRoleBadgeColor(user.rolNombre)}`}
                  >
                    {user.rolNombre}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-[#6b7a90]">{user.cargoNombre}</td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button className="rounded-full p-2 text-[#6b7a90] hover:bg-[#eaf3fa] hover:text-[#1a4e8a] transition-colors" title="Ver">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-full p-2 text-[#6b7a90] hover:bg-[#eaf3fa] hover:text-[#1a4e8a] transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="rounded-full p-2 text-[#6b7a90] hover:bg-[#ffeaea] hover:text-[#d32f2f] transition-colors" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-sm text-[#6b7a90]">
                No se encontraron usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
