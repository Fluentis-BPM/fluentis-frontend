import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchGrupos, createGrupoThunk, updateGrupoThunk, addUsuariosThunk, removeUsuarioThunk, deleteGrupoThunk } from '@/store/approvalGroups/approvalGroupsSlice';
import { GrupoAprobacion, UseAprobationsReturn, CreateGrupoAprobacionInput, UpdateGrupoAprobacionInput } from '@/types/equipos/aprobations';

export const useAprobations = (): UseAprobationsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { grupos, loading, error, creating, createError, updating, mutatingMembers, deleting, lastActionError } = useSelector((s: RootState) => s.approvalGroups);

  useEffect(() => { dispatch(fetchGrupos()); }, [dispatch]);

  const refetch = () => { dispatch(fetchGrupos()); };
  const createGrupo = async (input: CreateGrupoAprobacionInput) => { await dispatch(createGrupoThunk(input)); };
  const updateGrupo = async (id: number, data: UpdateGrupoAprobacionInput) => { await dispatch(updateGrupoThunk({ id, data })); };
  const addUsuarios = async (id: number, usuarioIds: number[]) => { await dispatch(addUsuariosThunk({ id, usuarioIds })); };
  const removeUsuario = async (id: number, usuarioId: number) => { await dispatch(removeUsuarioThunk({ id, usuarioId })); };
  const deleteGrupo = async (id: number) => { await dispatch(deleteGrupoThunk({ id })); };

  return { grupos, loading, error, refetch, creating, createError, createGrupo, updating, updateGrupo, mutatingMembers, addUsuarios, removeUsuario, deleting, deleteGrupo, lastActionError };
};