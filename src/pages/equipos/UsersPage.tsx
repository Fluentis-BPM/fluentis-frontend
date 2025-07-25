import { useState } from "react"
import { motion } from "motion/react"
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
      (user.nombre?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.departamentoNombre?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.rolNombre?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.cargoNombre?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
      <div className="max-w-5xl mx-auto pt-8">
        <UsersHeader />
        <UsersActions searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="flex items-center space-x-4"
                >
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
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
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
