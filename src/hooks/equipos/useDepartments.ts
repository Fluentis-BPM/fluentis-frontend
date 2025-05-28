import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Departamento, UseDepartmentsReturn } from '@/types/equipos/department';
import { AxiosError } from 'axios';

export const useDepartments = (): UseDepartmentsReturn => {
  const [departments, setDepartments] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Departamento[]>('/api/Departamentos');
      console.log('API Departments Data:', response.data);
      setDepartments(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar departamentos');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const refetch = () => {
    fetchDepartments();
  };

  return {
    departments,
    loading,
    error,
    refetch,
  };
};
