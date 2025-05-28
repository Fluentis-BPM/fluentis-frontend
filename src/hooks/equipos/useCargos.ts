import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Cargo, UseCargosReturn } from '@/types/equipos/cargo';
import { AxiosError } from 'axios';

export const useCargos = (): UseCargosReturn => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCargos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Cargo[]>('/api/Cargos');
      console.log('API Cargos Data:', response.data);
      // Sanitize usuarios to ensure it's always an array
      const sanitizedCargos = response.data.map(cargo => ({
        ...cargo,
        usuarios: Array.isArray(cargo.usuarios) ? cargo.usuarios : [],
      }));
      setCargos(sanitizedCargos);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar cargos');
      console.error('Error fetching cargos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const refetch = () => {
    fetchCargos();
  };

  return {
    cargos,
    loading,
    error,
    refetch,
  };
};