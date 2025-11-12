
import { GripVertical } from 'lucide-react'
import { UserCardProps } from '@/types/equipos/department'


export default function UserCard({ user, onDragStart, onDragEnd, isDragging = false }: UserCardProps) {
  // Badge fijo para unificar la estética
  const badgeClass = "bg-[#eaf3fa] text-[#1a4e8a] px-3 py-1 rounded-full";

  return (
    <div
      draggable
      onDragStart={(e) => {
        // Mejora UX: usar imagen de arrastre transparente para evitar ghost flicker
        try {
          const img = new Image();
          img.src =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxcHgnIGhlaWdodD0nMXB4Jz48L3N2Zz4=';
          e.dataTransfer?.setDragImage(img, 0, 0);
          e.dataTransfer!.effectAllowed = 'move';
          e.dataTransfer!.dropEffect = 'move';
  } catch { /* ignore drag image errors */ }
        onDragStart(user);
      }}
      onDragEnd={onDragEnd}
      className={`flex items-center p-3 bg-white border border-[#dbe7f3] rounded-xl cursor-move hover:shadow-lg transition-all duration-200 ${
        isDragging ? "opacity-60" : "hover:border-[#1a4e8a]"
      }`}
    >
      <GripVertical className="h-4 w-4 text-[#6b7a90] mr-3 flex-shrink-0" />

      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#eaf3fa] flex items-center justify-center text-[#1a4e8a] font-bold text-base mr-3 border border-[#dbe7f3]">
        {user.nombre.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a4e8a] truncate">{user.nombre}</p>
            <p className="text-xs text-[#6b7a90] truncate">{user.email}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`inline-flex text-xs font-semibold ${badgeClass}`}>{user.rol}</span>
          </div>
        </div>
        <p className="text-xs text-[#6b7a90] mt-1">{user.cargo}</p>
      </div>
    </div>
  )
}
