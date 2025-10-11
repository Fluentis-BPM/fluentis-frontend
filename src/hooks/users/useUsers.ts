import { useState, useEffect } from 'react';
import api from '@/services/api';
import { User } from '@/types/auth';
import { AxiosError } from 'axios';
import { UseUsersReturn } from '@/types/equipos/users';

interface UsuarioDtoApi {
  idUsuario: number;
  nombre: string;
  email: string;
  oid: string;
  departamentoId?: number | null;
  departamentoNombre?: string | null;
  rolId?: number | null;
  rolNombre?: string | null;
  cargoId?: number | null;
  cargoNombre?: string | null;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mapRolNombre = (nombre?: string | null): User['rolNombre'] => {
    switch (nombre) {
      case 'Administrador':
      case 'Visualizador':
      case 'Visualizador Departamental':
        return nombre;
      case 'Visualizadordepartamental':
        return 'Visualizador Departamental';
      default:
        return 'Miembro';
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<UsuarioDtoApi[]>('/api/usuarios');
      const mapped: User[] = response.data.map(u => ({
        idUsuario: u.idUsuario,
        oid: u.idUsuario, // usar idUsuario como oid para evitar confusiones en selects existentes
        originalOid: u.oid,
        email: u.email,
        nombre: u.nombre,
        cargoNombre: u.cargoNombre || '',
        departamentoNombre: u.departamentoNombre || '',
        rolNombre: mapRolNombre(u.rolNombre),
        // legacy normalizados
        departamento: u.departamentoNombre || '',
        rol: ((): User['rol'] => {
          const r = mapRolNombre(u.rolNombre);
            if (r === 'Visualizador Departamental') return 'Visualizadordepartamental';
            return r;
        })(),
        cargo: u.cargoNombre || '',
        name: u.nombre
      }));
      setUsers(mapped);
      console.log('API Users Data (mapped):', mapped);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refetch,
  };
};
