"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
}

export default function UsersPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startItem,
  endItem,
}: UsersPaginationProps) {

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 10

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
   
      pageNumbers.push(1)

  
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

 
      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      if (startPage > 2) {
        pageNumbers.push("...")
      }

   
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

 
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }


      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-between border-t border-[#dbe7f3] bg-white px-4 py-3 sm:px-6 rounded-b-xl">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7a90]">
            Mostrando <span className="font-bold text-[#1a4e8a]">{startItem}</span> a <span className="font-bold text-[#1a4e8a]">{endItem}</span>{" "}
            de <span className="font-bold text-[#1a4e8a]">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-[#6b7a90] ring-1 ring-inset ring-[#dbe7f3] bg-[#f6fafd] hover:bg-[#eaf3fa] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {pageNumbers.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#6b7a90] ring-1 ring-inset ring-[#dbe7f3] bg-[#f6fafd]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page as number)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    currentPage === page
                      ? "bg-[#1a4e8a] text-white focus-visible:outline-[#1a4e8a]"
                      : "text-[#1a4e8a] ring-1 ring-inset ring-[#dbe7f3] bg-[#f6fafd] hover:bg-[#eaf3fa]"
                  } focus:z-20 focus:outline-offset-0`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-[#6b7a90] ring-1 ring-inset ring-[#dbe7f3] bg-[#f6fafd] hover:bg-[#eaf3fa] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
