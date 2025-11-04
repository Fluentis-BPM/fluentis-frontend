import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatorProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Paginator({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginatorProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-xs text-gray-600">
        Mostrando {start}-{end} de {total}
      </div>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <select
            className="border rounded px-2 py-1 text-xs"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / página
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            className={`p-1 rounded border ${canPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
            onClick={() => canPrev && onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-700">
            {page} / {totalPages}
          </span>
          <button
            className={`p-1 rounded border ${canNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
            onClick={() => canNext && onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
