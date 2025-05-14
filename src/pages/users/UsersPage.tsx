"use client"

import { useState } from "react"

import UsersHeader from "@/components/users/UsersHeader"
import UsersActions from "@/components/users/UsersActions"

import UsersPagination from "@/components/users/UsersPagination"
import { mockUsers } from "@/components/data"
import UsersTable from "@/components/users/UsersTable"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)


  const filteredUsers = mockUsers.filter(
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
      </div>
    </main>
  )
}
