"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import UsersHeader from "@/components/equipos/users/UsersHeader"
import UsersActions from "@/components/equipos/users/UsersActions"
import UsersPagination from "@/components/equipos/users/UsersPagination"
import UsersTable from "@/components/equipos/users/UsersTable"
import { useUsers } from "@/hooks/users/useUsers"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const { users, loading } = useUsers()

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cargo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <UsersHeader />
      <UsersActions searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <UsersTable users={currentUsers} />
            <UsersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              startItem={indexOfFirstItem + 1}
              endItem={Math.min(indexOfLastItem, filteredUsers.length)}
            />
          </>
        )}
      </div>
    </main>
  )
}
