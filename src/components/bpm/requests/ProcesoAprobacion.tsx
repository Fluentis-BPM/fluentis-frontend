import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TipoDecision, GrupoAprobacionCompleto, DecisionConUsuario } from '@/types/bpm/approval';
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
// import { useDecision } from '@/hooks/bpm/useDecision'; // Removed to prevent duplicate API calls

interface EstadisticasAprobacion {
  aprobaciones: number;
  rechazos: number;
  pendientes: number;
  total: number; 
  total_miembros: number;
}

interface Props {
  solicitud_id: number;
  miembrosGrupo: number[]; 
  usuarioActualId: number; 
  relacionGrupoAprobacionId?: number; 
  onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void;
  // Funciones del hook useAprobacion
  obtenerGrupoPorSolicitud: (solicitud_id: number) => GrupoAprobacionCompleto | undefined;
  registrarDecision: (id_usuario: number, relacion_grupo_aprobacion_id: number, decision: TipoDecision, onEstadoCambiado?: (nuevoEstado: 'aprobado' | 'rechazado') => void) => void;
  verificarAprobacionCompleta: (solicitud_id: number, miembrosGrupo: number[]) => boolean;
  verificarRechazo: (solicitud_id: number) => boolean;
  obtenerEstadisticasAprobacion: (solicitud_id: number, miembrosGrupo: number[]) => EstadisticasAprobacion;
}

export const ProcesoAprobacion: React.FC<Props> = ({ 
  solicitud_id,
  miembrosGrupo,
  usuarioActualId,
  relacionGrupoAprobacionId,
  onEstadoCambiado,
  obtenerGrupoPorSolicitud,
  registrarDecision,
  verificarAprobacionCompleta,
  verificarRechazo,
  obtenerEstadisticasAprobacion
}) => {
  // Obtener el rol del usuario actual desde Redux
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.rolNombre || '');
  const isAdmin = currentUserRole.toLowerCase() === 'administrador';

  // Estado local para simular persistencia
  const [usuarioActual, setUsuarioActual] = useState<number>(miembrosGrupo[0] || usuarioActualId);
  const [decisionSeleccionada, setDecisionSeleccionada] = useState<TipoDecision>('si');
  const [decisionesLocal, setDecisionesLocal] = useState<Record<string, TipoDecision>>(() => {
    // Cargar decisiones desde localStorage
    const key = `aprobacion_${solicitud_id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  });

  // Ejemplo: si estamos viendo como Juan Pérez, añadir miembros mock para la demo
  const JUAN_PEREZ_ID = 99999;
  const MOCK_MEMBER_IDS = [11111, 11112];
  const MOCK_MEMBER_NAMES: Record<number, string> = {
    11111: 'Usuario Mock A',
    11112: 'Usuario Mock B'
  };

  const displayMiembros = (usuarioActualId === JUAN_PEREZ_ID) ? [JUAN_PEREZ_ID, ...MOCK_MEMBER_IDS] : miembrosGrupo;

  // Forzar usuarioActual a Juan Pérez cuando se está impersonando
  React.useEffect(() => {
    if (usuarioActualId === JUAN_PEREZ_ID) {
      setUsuarioActual(JUAN_PEREZ_ID);
    } else if (!isAdmin) {
      // Si NO es admin, forzar a que solo pueda aprobar como su propio usuario
      setUsuarioActual(usuarioActualId);
    } else {
      setUsuarioActual(miembrosGrupo[0] || usuarioActualId);
    }
  }, [usuarioActualId, miembrosGrupo, isAdmin]);

  // Demo: prefijar una decisión para uno de los mock members para ejemplificar UI
  React.useEffect(() => {
    if (usuarioActualId === JUAN_PEREZ_ID) {
      const key = `aprobacion_${solicitud_id}`;
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : {};
      // Si no existe decisión para MOCK_MEMBER_IDS[0], marcar como aprobado (demo)
      if (!parsed[MOCK_MEMBER_IDS[0]]) {
        const nuevas = { ...parsed, [MOCK_MEMBER_IDS[0]]: 'si' };
        localStorage.setItem(key, JSON.stringify(nuevas));
        setDecisionesLocal(nuevas);
      }
    }
  }, [usuarioActualId, solicitud_id]);



  const grupo = obtenerGrupoPorSolicitud(solicitud_id);
  const estadisticas = obtenerEstadisticasAprobacion(solicitud_id, miembrosGrupo);
  const estaAprobada = verificarAprobacionCompleta(solicitud_id, miembrosGrupo);
  const estaRechazada = verificarRechazo(solicitud_id);

  // Verificar si el usuario actual puede votar
  const puedeVotar = React.useMemo(() => {
    console.log('Verificando permisos de voto:', {
      isAdmin,
      usuarioActualId,
      miembrosGrupo,
      includes: miembrosGrupo.includes(usuarioActualId),
      grupo: grupo
    });
    
    // Si no es admin, solo puede votar si está en el grupo
    if (!isAdmin) {
      // Si miembrosGrupo está vacío o no está poblado correctamente, permitir votar
      // (la validación real se hace en el backend)
      if (miembrosGrupo.length === 0) {
        console.warn('miembrosGrupo está vacío, permitiendo voto (validación en backend)');
        return true;
      }
      return miembrosGrupo.includes(usuarioActualId);
    }
    // Si es admin, puede votar como cualquier usuario del grupo
    return true;
  }, [isAdmin, miembrosGrupo, usuarioActualId, grupo]);

  // Función auxiliar para obtener el nombre del usuario desde las decisiones del backend
  const obtenerNombreUsuario = React.useCallback((idUsuario: number): string | null => {
    // Intentar obtener el nombre desde grupo.usuarios (si está disponible)
    if (grupo?.usuarios) {
      const usuario = grupo.usuarios.find(u => u.idUsuario === idUsuario);
      if (usuario?.nombre) return usuario.nombre;
    }
    
    // Intentar obtener el nombre desde las decisiones del backend
    // Las decisiones vienen con un objeto usuario: {idUsuario, nombre, email}
    if (grupo?.decisiones) {
      const decision = grupo.decisiones.find((d: DecisionConUsuario | { idUsuario?: number; usuario?: { nombre?: string }; nombre_usuario?: string }) => 
        (d as DecisionConUsuario).id_usuario === idUsuario || (d as { idUsuario?: number }).idUsuario === idUsuario
      );
      if (decision) {
        // Intentar diferentes estructuras de datos
        const decisionExtended = decision as { usuario?: { nombre?: string }; nombre_usuario?: string };
        if (decisionExtended.usuario?.nombre) return decisionExtended.usuario.nombre;
        if (decisionExtended.nombre_usuario) return decisionExtended.nombre_usuario;
      }
    }
    
    // Fallback para usuarios mock
    if (MOCK_MEMBER_NAMES[idUsuario]) return MOCK_MEMBER_NAMES[idUsuario];
    
    return null;
  }, [grupo, MOCK_MEMBER_NAMES]);

  const handleRegistrarDecision = async () => {
    if (!usuarioActual) {
      console.log('Error: No hay usuario actual');
      return;
    }

    // Guardar en localStorage para la UX local (demo)
    const key = `aprobacion_${solicitud_id}`;
    const nuevasDecisiones = { ...decisionesLocal, [usuarioActual]: decisionSeleccionada };
    localStorage.setItem(key, JSON.stringify(nuevasDecisiones));
    setDecisionesLocal(nuevasDecisiones);

    try {
      // Solo usar registrarDecision que ya maneja el backend, evitar executeSolicitud para prevenir duplicados
      if (registrarDecision) {
        let relacionId = relacionGrupoAprobacionId;
        if (!relacionId) {
          relacionId = solicitud_id * 1000 + (grupo?.id_grupo || 1);
        }
        registrarDecision(usuarioActual, relacionId, decisionSeleccionada, onEstadoCambiado);
      }
    } catch (e) {
      console.error('Error registrando decisión en backend', e);
      // No romper la UX: mantener estado local sin cambios adicionales
    }
  };

  const obtenerDecisionUsuario = (idUsuario: number): TipoDecision | null => {
    // Primero buscar en localStorage
    if (decisionesLocal[idUsuario]) return decisionesLocal[idUsuario];
  // Algunas APIs usan 'decisiones' o 'decisions' en mock; soportar ambas
  const decisionsList = (grupo?.decisiones || ((grupo as unknown) as { decisions?: DecisionConUsuario[] })?.decisions || []) as DecisionConUsuario[];
  const decision = decisionsList.find((d) => d.id_usuario === idUsuario);
  return decision?.decision ?? null;
  };

  const getEstadoIcon = () => {
    if (estaAprobada) return <CheckCircle className="w-5 h-5 text-success" />;
    if (estaRechazada) return <XCircle className="w-5 h-5 text-destructive" />;
    return <Clock className="w-5 h-5 text-warning" />;
  };

  const getEstadoTexto = () => {
    if (estaAprobada) return 'Aprobada';
    if (estaRechazada) return 'Rechazada';
    return 'Pendiente de Aprobación';
  };

  const getEstadoBadge = () => {
    if (estaAprobada) return <Badge variant="success">Aprobada</Badge>;
    if (estaRechazada) return <Badge variant="destructive">Rechazada</Badge>;
    return <Badge variant="warning">Pendiente</Badge>;
  };

  return (
    <Card className="shadow-soft border-request-primary/20">
      <CardHeader className="bg-gradient-secondary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Proceso de Aprobación
          {getEstadoIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Estado General */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{getEstadoTexto()}</h3>
            <p className="text-muted-foreground text-sm">
              {grupo?.nombre || 'Grupo de Aprobación'}
            </p>
          </div>
          {getEstadoBadge()}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{estadisticas.total_miembros}</div>
            <div className="text-xs text-muted-foreground">Total Miembros</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">{estadisticas.aprobaciones}</div>
            <div className="text-xs text-muted-foreground">Aprobaciones</div>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{estadisticas.rechazos}</div>
            <div className="text-xs text-muted-foreground">Rechazos</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{estadisticas.pendientes}</div>
            <div className="text-xs text-muted-foreground">Pendientes</div>
          </div>
        </div>

        <Separator />

        {/* Lista de Miembros y sus Decisiones */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Decisiones por Miembro
          </h4>
          <div className="space-y-2">
            {miembrosGrupo.map(idUsuario => {
              const decision = obtenerDecisionUsuario(idUsuario);
              const nombreReal = obtenerNombreUsuario(idUsuario);
              const usuarioEnGrupo = grupo?.usuarios?.find(u => u.idUsuario === idUsuario);
              
              return (
                <div 
                  key={idUsuario} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{nombreReal || `Usuario ${idUsuario}`}</span>
                    {usuarioEnGrupo?.email && (
                      <span className="text-xs text-muted-foreground">{usuarioEnGrupo.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {decision === 'si' && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Aprobó
                      </Badge>
                    )}
                    {decision === 'no' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <UserX className="w-3 h-3" />
                        Rechazó
                      </Badge>
                    )}
                    {!decision && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario para Registrar Decisión */}
        {!estaAprobada && !estaRechazada && (
          <>
            <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Registrar Tu Decisión</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            {/* Si NO es admin, mostrar solo el nombre del usuario logueado (sin selector) */}
                            {!isAdmin ? (
                              <div>
                                <Label>Votando como</Label>
                                <div className="px-3 py-2 border rounded bg-muted/20 font-medium">
                                  {obtenerNombreUsuario(usuarioActualId) || `Usuario ${usuarioActualId}`}
                                </div>
                              </div>
                            ) : usuarioActualId === JUAN_PEREZ_ID ? (
                              /* Si se está impersonando a Juan Pérez (admin mode), no mostrar selector: votar sólo como Juan */
                              <div>
                                <Label>Votando como</Label>
                                <div className="px-3 py-2 border rounded bg-muted/20">Juan Pérez</div>
                              </div>
                            ) : (
                              /* Si es admin y no está impersonando, mostrar selector completo */
                              <>
                                <Label htmlFor="usuario">Selecciona Usuario</Label>
                                <select
                                  id="usuario"
                                  value={usuarioActual}
                                  onChange={(e) => setUsuarioActual(parseInt(e.target.value))}
                                  className="w-full p-2 border rounded-md bg-background"
                                >
                                  {displayMiembros.map(id => (
                                    <option key={id} value={id}>
                                      {obtenerNombreUsuario(id) || `Usuario ${id}`} {obtenerDecisionUsuario(id) && '(Ya votó)'}
                                    </option>
                                  ))}
                                </select>
                                {!displayMiembros.includes(usuarioActual) && (
                                  <p className="text-xs text-destructive">
                                    Solo los miembros del grupo pueden votar
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                  <div className="space-y-2">
                    <Label>Decisión</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={decisionSeleccionada === 'si' ? 'gradient' : 'outline'}
                        onClick={() => setDecisionSeleccionada('si')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        variant={decisionSeleccionada === 'no' ? 'destructive' : 'outline'}
                        onClick={() => setDecisionSeleccionada('no')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleRegistrarDecision}
                      disabled={!puedeVotar}
                      variant="gradient"
                      className="w-full"
                    >
                      Registrar Decisión
                    </Button>
                    {!puedeVotar && (
                      <p className="text-xs text-destructive text-center">
                        No eres miembro de este grupo de aprobación
                      </p>
                    )}
                  </div>
                </div>
              </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};