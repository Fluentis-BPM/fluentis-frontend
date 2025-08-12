import { useState, useEffect } from 'react';
import api from '@/services/api';
import { GrupoAprobacion, UseAprobationsReturn, CreateGrupoAprobacionInput } from '@/types/equipos/aprobations';
import { AxiosError } from 'axios';

interface ApiUsuario {
  idUsuario: number;
  nombre: string;
  email: string;
  departamento?: { idDepartamento: number; nombre: string } | null;
  rol?: { idRol: number; nombre: string } | null;
  cargo?: { idCargo: number; nombre: string } | null;
}

interface ApiRelacionUsuarioGrupo {
  idRelacion: number;
  grupoAprobacionId: number;
  usuarioId: number;
  usuario: ApiUsuario;
}

interface ApiGrupoAprobacion {
  idGrupo?: number; // PascalCase del backend previo
  idgrupo?: number; // fallback por si acaso
  id_grupo?: number; // legacy local
  nombre: string;
  fecha?: string;
  esGlobal?: boolean; // nuevo camelCase
  esglobal?: boolean; // fallback
  es_global?: boolean; // legacy
  relacionesUsuarioGrupo?: ApiRelacionUsuarioGrupo[]; // camelCase actual
  relacionesusuarioGrupo?: ApiRelacionUsuarioGrupo[]; // tolerancia
  relaciones_usuario_grupo?: ApiRelacionUsuarioGrupo[]; // legacy hypotético
}

// Helper para obtener primera propiedad definida
const pickFirst = <T, K extends keyof T>(obj: T, keys: K[]): T[K] | undefined => {
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
};

interface LooseObject { [key: string]: unknown; }
const normalizeApiGrupo = (raw: unknown): ApiGrupoAprobacion => {
  const obj = raw as LooseObject;
  return {
    idGrupo: pickFirst(obj, ['idGrupo','idgrupo','id_grupo']) as number | undefined,
    nombre: obj['nombre'] as string,
    fecha: obj['fecha'] as string | undefined,
    esGlobal: pickFirst(obj, ['esGlobal','esglobal','es_global']) as boolean | undefined,
    relacionesUsuarioGrupo: pickFirst(obj, ['relacionesUsuarioGrupo','relacionesusuarioGrupo','relaciones_usuario_grupo']) as ApiRelacionUsuarioGrupo[] | undefined
  } as ApiGrupoAprobacion;
};

const mapRolNombre = (nombre?: string): 'Miembro' | 'Administrador' | 'Visualizador' | 'Visualizador Departamental' => {
  switch (nombre) {
    case 'Administrador':
    case 'Visualizador':
    case 'Visualizador Departamental':
      return nombre;
    default:
      return 'Miembro';
  }
};

const mapRolLegacy = (nombre?: string): 'Miembro' | 'Administrador' | 'Visualizador' | 'Visualizadordepartamental' => {
  switch (nombre) {
    case 'Administrador':
    case 'Visualizador':
    case 'Visualizadordepartamental':
      return nombre;
    case 'Visualizador Departamental':
      return 'Visualizadordepartamental';
    default:
      return 'Miembro';
  }
};

const mapFromApi = (apiItemRaw: unknown): GrupoAprobacion => {
  const apiItem = normalizeApiGrupo(apiItemRaw);
  return {
    id_grupo: apiItem.idGrupo!,
    nombre: apiItem.nombre,
    fecha: apiItem.fecha || '',
    es_global: apiItem.esGlobal ?? false,
    usuarios: (apiItem.relacionesUsuarioGrupo || []).map((r) => ({
      idUsuario: r.usuario.idUsuario,
      oid: r.usuario.idUsuario,
      email: r.usuario.email,
      nombre: r.usuario.nombre,
      cargoNombre: r.usuario.cargo?.nombre || '',
      departamentoNombre: r.usuario.departamento?.nombre || '',
      rolNombre: mapRolNombre(r.usuario.rol?.nombre),
      departamento: r.usuario.departamento?.nombre || '',
      rol: mapRolLegacy(r.usuario.rol?.nombre),
      cargo: r.usuario.cargo?.nombre || ''
    }))
  };
};

export const useAprobations = (): UseAprobationsReturn => {
  const [grupos, setGrupos] = useState<GrupoAprobacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [mutatingMembers, setMutatingMembers] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastActionError, setLastActionError] = useState<string | null>(null);

  const fetchGrupos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/GrupoAprobaciones');
      const data: unknown[] = Array.isArray(response.data) ? response.data : [];
      const mapped = data.map(mapFromApi);
      setGrupos(mapped);
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

  const createGrupo = async (input: CreateGrupoAprobacionInput) => {
    setCreating(true);
    setCreateError(null);
    try {
      console.log('POST /api/GrupoAprobaciones payload:', input);
      await api.post('/api/GrupoAprobaciones', {
        nombre: input.nombre,
        esGlobal: input.esGlobal,
        usuarioIds: input.usuarioIds
      });
      await fetchGrupos();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setCreateError(axiosError.response?.data?.message || 'Error al crear grupo de aprobación');
      console.error('Error creating grupo:', err);
    } finally {
      setCreating(false);
    }
  };

  const updateGrupo = async (id: number, data: { nombre?: string; esGlobal?: boolean }) => {
    setUpdating(true);
    setLastActionError(null);
    try {
      await api.put(`/api/GrupoAprobaciones/${id}`, {
        nombre: data.nombre,
        esGlobal: data.esGlobal
      });
      await fetchGrupos();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setLastActionError(axiosError.response?.data?.message || 'Error al actualizar grupo');
      console.error('Error updating grupo:', err);
    } finally {
      setUpdating(false);
    }
  };

  const addUsuarios = async (id: number, usuarioIds: number[]) => {
    setMutatingMembers(true);
    setLastActionError(null);
    try {
      await api.post(`/api/GrupoAprobaciones/${id}/usuarios`, usuarioIds);
      await fetchGrupos();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setLastActionError(axiosError.response?.data?.message || 'Error al agregar usuarios');
      console.error('Error adding usuarios:', err);
    } finally {
      setMutatingMembers(false);
    }
  };

  const removeUsuario = async (id: number, usuarioId: number) => {
    setMutatingMembers(true);
    setLastActionError(null);
    try {
      await api.delete(`/api/GrupoAprobaciones/${id}/usuarios/${usuarioId}`);
      await fetchGrupos();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setLastActionError(axiosError.response?.data?.message || 'Error al remover usuario');
      console.error('Error removing usuario:', err);
    } finally {
      setMutatingMembers(false);
    }
  };

  const deleteGrupo = async (id: number) => {
    setDeleting(true);
    setLastActionError(null);
    try {
      await api.delete(`/api/GrupoAprobaciones/${id}`);
      await fetchGrupos();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setLastActionError(axiosError.response?.data?.message || 'Error al eliminar grupo');
      console.error('Error deleting grupo:', err);
    } finally {
      setDeleting(false);
    }
  };

  return {
    grupos,
    loading,
    error,
    refetch,
    creating,
    createError,
    createGrupo,
    updating,
    updateGrupo,
    mutatingMembers,
    addUsuarios,
    removeUsuario,
    deleting,
    deleteGrupo,
    lastActionError
  };
};