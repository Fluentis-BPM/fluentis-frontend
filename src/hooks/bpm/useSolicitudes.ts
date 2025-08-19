import { useCallback, useMemo } from 'react';
import { Solicitud, CrearSolicitudInput, EstadoSolicitud } from '@/types/bpm/request';
import { RelacionInput } from '@/types/bpm/inputs';
import { TipoDecision } from '@/types/bpm/approval';
import { useAprobacion } from './useAprobacion';
import { useFlujos } from './useFlujos';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchSolicitudes as fetchSolicitudesThunk,
  createSolicitud as createSolicitudThunk,
  updateSolicitudEstado as updateSolicitudEstadoThunk,
  addGrupoAprobacion as addGrupoAprobacionThunk,
  addDecision as addDecisionThunk,
  type EstadoSolicitudApi,
  type SolicitudCreateDto,
  fetchSolicitudGrupo,
} from '@/store/solicitudes/solicitudesSlice';
import { useEffect } from 'react';
import { solicitudesLocalRemove } from '@/store/solicitudes/solicitudesSlice';

/**
 * Hook personalizado para manejar el estado de las solicitudes
 * Proporciona funcionalidades CRUD y lógica de negocio
 */
export const useSolicitudes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, creating, updating, mutating } = useSelector((s: RootState) => s.solicitudes);
  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario);
  type RelacionInputLocal = RelacionInput & { solicitud_id: number };
  const aprobacion = useAprobacion();
  const flujos = useFlujos();

  // Generar ID único para nuevas solicitudes y relaciones
  // Helpers not needed here (handled in slice)

  // Cargar solicitudes desde backend
  const cargarSolicitudes = useCallback(async () => {
    const res = await dispatch(fetchSolicitudesThunk()).unwrap();
    // Sync backend grupo_aprobacion_id into local approval relations
    if (Array.isArray(res)) {
      res.forEach((s) => {
        const sid = (s as Solicitud).id_solicitud;
        const gid = (s as Solicitud).grupo_aprobacion_id as number | undefined;
        if (sid && gid && !aprobacion.relacionesGrupo.some(r => r.solicitud_id === sid)) {
          aprobacion.asociarGrupoASolicitud(gid, sid);
        }
      });
    }
  }, [dispatch]);

  // Auto-cargar si la lista está vacía
  // Auto-cargar al montar o cuando el token/usuario estén listos
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  useEffect(() => {
    if ((!items || items.length === 0) && isAuthenticated) {
      dispatch(fetchSolicitudesThunk());
    }
  }, [dispatch, items?.length, isAuthenticated]);

  // Ensure local approval relations exist for all solicitudes with a backend group id
  useEffect(() => {
    if (!items || items.length === 0) return;
    items.forEach((s) => {
      const sid = s.id_solicitud;
      const gid = (s as Solicitud).grupo_aprobacion_id as number | undefined;
      if (sid && gid && !aprobacion.relacionesGrupo.some(r => r.solicitud_id === sid)) {
        aprobacion.asociarGrupoASolicitud(gid, sid);
      } else if (sid && !gid) {
        // try fetching group's assignment if not included in the base list
        dispatch(fetchSolicitudGrupo({ id: sid }))
          .unwrap()
          .then(({ grupoAprobacionId }) => {
            if (!aprobacion.relacionesGrupo.some(r => r.solicitud_id === sid)) {
              aprobacion.asociarGrupoASolicitud(grupoAprobacionId, sid);
            }
          })
          .catch(() => {});
      }
    });
  }, [items, aprobacion.relacionesGrupo, dispatch]);

  // Crear nueva solicitud (backend)
  const crearSolicitud = useCallback(async (input: CrearSolicitudInput): Promise<Solicitud> => {
    // Preparar DTO
    const nombreDesdeCampos = input.campos_dinamicos?.[1]?.valor?.toString()?.trim();
    const nombre: string = (nombreDesdeCampos && nombreDesdeCampos.length > 0)
      ? nombreDesdeCampos.substring(0, 255)
      : `Solicitud ${new Date().toLocaleString()}`;

    const solicitanteId = (currentUserId && currentUserId > 0) ? currentUserId : input.solicitante_id;
    if (!solicitanteId || solicitanteId <= 0) {
      throw new Error('Solicitante inválido: no se encontró un usuario autenticado ni un solicitante válido.');
    }

    const dto: SolicitudCreateDto = {
      SolicitanteId: solicitanteId,
      FlujoBaseId: input.flujo_base_id ?? null,
      Nombre: nombre,
      Descripcion: (input.datos_adicionales && typeof input.datos_adicionales['descripcion'] === 'string')
        ? String(input.datos_adicionales['descripcion'])
        : undefined,
      Inputs: input.campos_dinamicos
        ? Object.entries(input.campos_dinamicos).map(([key, campo]) => ({
            InputId: Number(key),
            Valor: { RawValue: campo.valor },
            Requerido: campo.requerido,
          }))
        : undefined,
    };
    const created = await dispatch(createSolicitudThunk(dto)).unwrap();
    return created as Solicitud;
  }, [currentUserId, dispatch]);

  // Actualizar estado de solicitud
  const actualizarEstado = useCallback((id_solicitud: number, nuevoEstado: EstadoSolicitud) => {
    // Crear flujo si se aprueba
    if (nuevoEstado === 'aprobado') {
      const solicitud = items.find(s => s.id_solicitud === id_solicitud);
      const relacionesSolicitud: RelacionInput[] = solicitud?.campos_dinamicos || [];
      flujos.crearFlujoDesde(
        id_solicitud,
        (solicitud?.datos_adicionales as unknown) as Record<string, string | number | boolean | undefined>,
        relacionesSolicitud,
        solicitud?.flujo_base_id
      );
    }
    const apiEstado: EstadoSolicitudApi = nuevoEstado === 'aprobado' ? 'Aprobado' : nuevoEstado === 'rechazado' ? 'Rechazado' : 'Pendiente';
    dispatch(updateSolicitudEstadoThunk({ id: id_solicitud, estado: apiEstado }));
  }, [dispatch, items, flujos]);

  // Asignar grupo de aprobación a solicitud
  const asignarGrupoAprobacion = useCallback((solicitud_id: number, grupo_id: number) => {
    // Mantener compatibilidad con lógica local de aprobaciones
    const relacion = aprobacion.asociarGrupoASolicitud(grupo_id, solicitud_id);
    // Persistir en backend
    dispatch(addGrupoAprobacionThunk({ id: solicitud_id, grupoAprobacionId: grupo_id }))
      .unwrap()
      .catch(err => console.error('Error asociando grupo en backend:', err));
    return relacion;
  }, [aprobacion, dispatch]);

  // Registrar decisión en backend y reflejar estado cuando todos votan
  const registrarDecisionSolicitud = useCallback((
    solicitud_id: number,
    id_usuario: number,
    decision: TipoDecision,
    onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void
  ) => {
    // 1) Actualizar estado local (UI) usando hook de aprobación existente
    const relacion = aprobacion.relacionesGrupo.find(r => r.solicitud_id === solicitud_id);
    const relacionId = relacion?.id_relacion ?? (solicitud_id * 1000);
    aprobacion.registrarDecision(id_usuario, relacionId, decision, onEstadoCambiado);

    // 2) Persistir en backend y, si todos votaron, actualizar estado real
    dispatch(addDecisionThunk({ id: solicitud_id, usuarioId: id_usuario, decision: decision === 'si' }))
      .unwrap()
      .then((res) => {
        if (!res) return;
        const estadoUi: EstadoSolicitud = res.EstadoActual === 'Aprobado' ? 'aprobado' : res.EstadoActual === 'Rechazado' ? 'rechazado' : 'pendiente';
        if (res.TodosVotaron && (estadoUi === 'aprobado' || estadoUi === 'rechazado')) {
          actualizarEstado(solicitud_id, estadoUi);
        }
      })
      .catch(err => console.error('Error registrando decisión en backend:', err));
  }, [aprobacion, dispatch, actualizarEstado]);

  // Obtener solicitud por ID
  const obtenerSolicitud = useCallback((id_solicitud: number): Solicitud | undefined => {
    return items.find(s => s.id_solicitud === id_solicitud);
  }, [items]);

  // Filtrar solicitudes por estado
  const filtrarPorEstado = useCallback((estado: EstadoSolicitud): Solicitud[] => {
    return items.filter(s => s.estado === estado);
  }, [items]);

  // Eliminar solicitud y sus relaciones
  const eliminarSolicitud = useCallback((id_solicitud: number) => {
    // No hay endpoint de borrado aún: actualizar estado local para feedback de UI
    dispatch(solicitudesLocalRemove({ id: id_solicitud }));
  }, [dispatch]);

  // Obtener relaciones de input por solicitud
  const obtenerRelacionesPorSolicitud = useCallback((solicitud_id: number): RelacionInput[] => {
    const s = items.find(x => x.id_solicitud === solicitud_id);
    return s?.campos_dinamicos || [];
  }, [items]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => ({
    total: items.length,
    aprobadas: items.filter(s => s.estado === 'aprobado').length,
    rechazadas: items.filter(s => s.estado === 'rechazado').length,
    pendientes: items.filter(s => s.estado === 'pendiente').length,
  }), [items]);

  return {
  solicitudes: items,
  relacionesInput: useMemo<RelacionInputLocal[]>(() => items.flatMap(s => (s.campos_dinamicos || []).map(r => ({ ...r, solicitud_id: s.id_solicitud }))), [items]),
  isLoading: loading || creating || updating || mutating,
  cargarSolicitudes,
    crearSolicitud,
    actualizarEstado,
    obtenerSolicitud,
    filtrarPorEstado,
    eliminarSolicitud,
    obtenerRelacionesPorSolicitud,
    asignarGrupoAprobacion,
  registrarDecisionSolicitud,
    estadisticas,
    // Exponer funcionalidades de aprobación
    ...aprobacion,
    // Exponer funcionalidades de flujos
    ...flujos
  };
};