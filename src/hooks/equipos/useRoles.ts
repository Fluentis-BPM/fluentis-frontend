import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Rol, UseRolesReturn } from '@/types/equipos/role';
import { AxiosError } from 'axios';

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Rol[]>('/api/Rols');
      console.log('API Roles Data:', response.data);
      setRoles(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const refetch = () => {
    fetchRoles();
  };

  return {
    roles,
    loading,
    error,
    refetch,
  };
};