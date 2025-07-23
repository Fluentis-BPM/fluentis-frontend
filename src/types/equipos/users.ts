import { User } from "../auth";

export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UsersTableProps {
  users: User[]
}

export interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
}

export interface UsersActionsProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}