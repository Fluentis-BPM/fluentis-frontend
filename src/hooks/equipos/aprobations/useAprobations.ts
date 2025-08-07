import { useState, useEffect } from 'react';
import api from '@/services/api';
import { GrupoAprobacion, UseAprobationsReturn } from '@/types/equipos/aprobations';
import { AxiosError } from 'axios';

export const useAprobations = (): UseAprobationsReturn => {
  const [grupos, setGrupos] = useState<GrupoAprobacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Por ahora usamos datos de ejemplo ya que el endpoint de grupos no existe aún
      const mockData: GrupoAprobacion[] = [
        {
          id_grupo: 1,
          nombre: "Grupo de Aprobación Financiera",
          fecha: "2024-01-15T10:00:00Z",
          es_global: false,
          usuarios: []
        },
        {
          id_grupo: 2,
          nombre: "Grupo de Aprobación IT",
          fecha: "2024-01-15T10:00:00Z",
          es_global: true,
          usuarios: []
        },
        {
          id_grupo: 3,
          nombre: "Grupo de Aprobación RRHH",
          fecha: "2024-01-15T10:00:00Z",
          es_global: false,
          usuarios: []
        }
      ];
      
      console.log('Mock Grupos Data:', mockData);
      setGrupos(mockData);
      
      // Cuando el backend esté listo, descomentar:
      // const response = await api.get<GrupoAprobacion[]>('/api/GrupoAprobacion');
      // console.log('API Grupos Data:', response.data);
      // setGrupos(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar grupos de aprobación');
      console.error('Error fetching grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const refetch = () => {
    fetchGrupos();
  };

  return {
    grupos,
    loading,
    error,
    refetch,
  };
}; 