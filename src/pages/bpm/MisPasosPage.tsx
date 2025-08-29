import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useSolicitudes } from '@/hooks/bpm/useSolicitudes';
import type { Solicitud } from '@/types/bpm/request';
import { useAprobations } from '@/hooks/equipos/aprobations/useAprobations';
import { useDecision } from '@/hooks/bpm/useDecision';
import { setImpersonateUserId, clearImpersonation } from '@/services/api';

const MisPasosPage: React.FC = () => {
  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario ?? 0);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const roleName = String(currentUser?.rolNombre ?? '');
  const roleMatches = /dev|admin|desarrollad|developer/i.test(roleName);
  const isDevEnv = typeof import.meta !== 'undefined' && Boolean(((import.meta as unknown) as { env?: Record<string, string> })?.env?.DEV);
  const isDeveloper = roleMatches || isDevEnv;
  const solicitudesHook = useSolicitudes();
  const { grupos } = useAprobations();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const { loading: decisionLoading, executePaso } = useDecision();
  useEffect(() => { solicitudesHook.cargarSolicitudes(); }, []);

  type AssignedRow = { pasoId: number; solicitudId: number; solicitudNombre?: string; grupoId: number; grupoName?: string; decisiones?: unknown[]; flujoId?: number; flujoDescripcion?: string };
  type GrupoRelacion = { paso_solicitud_id?: number; PasoSolicitudId?: number; grupo_aprobacion_id?: number; GrupoAprobacionId?: number; grupoId?: number; decisiones?: unknown[] };

  const assigned = useMemo(() => {
    const list: AssignedRow[] = [];
    for (const s of solicitudesHook.solicitudes || []) {
  const gruposRel = (((s as unknown) as { grupos_aprobacion?: unknown[]; gruposAprobacion?: unknown[] }).grupos_aprobacion) || (((s as unknown) as { grupos_aprobacion?: unknown[]; gruposAprobacion?: unknown[] }).gruposAprobacion) || [];
      for (const gr of gruposRel) {
  const grTyped = gr as GrupoRelacion;
  const pasoId = grTyped.paso_solicitud_id ?? grTyped.PasoSolicitudId ?? null;
  if (!pasoId) continue;
  const grupoId = grTyped.grupo_aprobacion_id ?? grTyped.GrupoAprobacionId ?? grTyped.grupoId ?? 0;
  type GrupoBackend = { id_grupo?: number; id?: number; usuarios?: unknown[]; nombre?: string };
  const grupoObj = (grupos || []).find((g) => Number(((g as unknown) as GrupoBackend).id_grupo ?? ((g as unknown) as GrupoBackend).id) === Number(grupoId)) as GrupoBackend | undefined;
        const miembros = ((grupoObj?.usuarios || []) as unknown[]).map(u => Number(((u as unknown) as { idUsuario?: number; oid?: number; id?: number }).idUsuario ?? ((u as unknown) as { idUsuario?: number; oid?: number; id?: number }).oid ?? ((u as unknown) as { idUsuario?: number; oid?: number; id?: number }).id)).filter(Boolean) as number[];
        if (miembros.includes(Number(currentUserId))) {
          const sol = s as unknown as Solicitud;
          list.push({ pasoId: Number(pasoId), solicitudId: sol.id_solicitud, solicitudNombre: sol.nombre, grupoId: Number(grupoId), grupoName: grupoObj?.nombre, decisiones: grTyped.decisiones });
        }
      }
    }
    return list;
  }, [solicitudesHook.solicitudes, grupos, currentUserId]);

  // Toggle para ver como usuario final (Juan Pérez) — visible para developers
  const JUAN_PEREZ_ID = 99999;
  const persisted = typeof window !== 'undefined' ? window.localStorage.getItem('impersonatedUserId') : null;
  const [showAsJuan, setShowAsJuan] = useState<boolean>(() => persisted === String(JUAN_PEREZ_ID));

  // Mock realistic data for Juan Pérez (independent of current user)
  const mockStepsForJuan = useMemo(() => {
    const now = new Date();
    return [
      {
        pasoId: 1001,
        solicitudId: 501,
        solicitudNombre: 'Solicitud de Compra - Laptops',
          flujoId: 201,
          flujoDescripcion: 'Flujo de compras para equipos de oficina (prioridad media)',
        grupoId: 2,
        grupoName: 'Aprobadores IT',
        decisiones: [
          { decisionId: 9001, id_usuario: 11111, usuarioNombre: 'Usuario Mock A', decision: true, fecha: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString() },
          { decisionId: 9002, id_usuario: 11112, usuarioNombre: 'Usuario Mock B', decision: true, fecha: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString() }
        ]
      },
      {
        pasoId: 1002,
        solicitudId: 502,
        solicitudNombre: 'Solicitud de Servicio - Contrato',
          flujoId: 202,
          flujoDescripcion: 'Revisión contractual para servicios externos',
        grupoId: 3,
        grupoName: 'Aprobadores Jurídicos',
        decisiones: [
          { decisionId: 9010, id_usuario: 11120, usuarioNombre: 'Revisor Legal', decision: false, fecha: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString() }
        ]
      }
    ];
  }, []);

  // Si el usuario es developer, ver todos los pasos; de lo contrario, solo los asignados.
  const assignedEffective = useMemo(() => {
    if (isDeveloper) {
      // Devs ven todos los pasos descubiertos en las solicitudes
      return assigned;
    }
    return assigned;
  }, [assigned, isDeveloper]);

  // Si se activa el modo 'Ver como Juan Pérez', mostramos los mocks en lugar de la lista normal
  const assignedToRender = showAsJuan ? mockStepsForJuan : assignedEffective;

  const handleDecision = async (pasoId: number, decision: boolean) => {
    try {
      const idUsuario = showAsJuan ? JUAN_PEREZ_ID : Number(currentUserId ?? 0);
      setActionMsg(null);
      await executePaso(pasoId, { IdUsuario: Number(idUsuario), Decision: decision });
      setActionMsg(decision ? 'Paso aprobado' : 'Paso rechazado');
      // update local UX state: mark in localStorage similar to other components
      try {
        const estados = JSON.parse(localStorage.getItem('aprobacionesBPM') || '{}');
        estados[pasoId] = decision ? 'aprobado' : 'rechazado';
        localStorage.setItem('aprobacionesBPM', JSON.stringify(estados));
      } catch (err) {
         
        console.warn('Failed to update local aprobacionesBPM', err);
      }
    } catch (err) {
       
      console.error('Error registrando decisión', err);
      setActionMsg('Error al registrar la decisión');
    }
  };

  // Persist impersonation and set API header for dev-only impersonation
  useEffect(() => {
    try {
      if (showAsJuan) {
        window.localStorage.setItem('impersonatedUserId', String(JUAN_PEREZ_ID));
        setImpersonateUserId(JUAN_PEREZ_ID);
      } else {
        window.localStorage.removeItem('impersonatedUserId');
        clearImpersonation();
      }
    } catch (err) {
       
      console.warn('Failed to persist impersonation', err);
    }
  }, [showAsJuan]);

  // React to impersonation changes made elsewhere in the app (storage events)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'impersonatedUserId') {
        const v = e.newValue;
        setShowAsJuan(v === String(JUAN_PEREZ_ID));
      }
    };
    window.addEventListener('storage', onStorage);
    const onCustom = (e: Event) => {
      try {
        const id = (e as CustomEvent).detail?.id;
        setShowAsJuan(id === JUAN_PEREZ_ID);
      } catch (err) { /* noop */ }
    };
    window.addEventListener('impersonation-changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('impersonation-changed', onCustom as EventListener);
    };
  }, []);
  useEffect(() => {
    const onCustom = (e: Event) => {
      try { const id = (e as CustomEvent).detail?.id; setShowAsJuan(id === JUAN_PEREZ_ID); } catch (err) { /* noop */ }
    };
    window.addEventListener('impersonation-changed', onCustom as EventListener);
    return () => window.removeEventListener('impersonation-changed', onCustom as EventListener);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mis Pasos</h2>
      <div className="flex items-center gap-2">
        <Button size="sm" variant={showAsJuan ? 'default' : 'outline'} onClick={() => {
          const next = !showAsJuan;
          setShowAsJuan(next);
          try {
            if (next) {
              window.localStorage.setItem('impersonatedUserId', String(JUAN_PEREZ_ID));
              setImpersonateUserId(JUAN_PEREZ_ID);
            } else {
              window.localStorage.removeItem('impersonatedUserId');
              clearImpersonation();
            }
            window.dispatchEvent(new CustomEvent('impersonation-changed', { detail: { id: next ? JUAN_PEREZ_ID : null } }));
          } catch (err) { /* noop */ }
           
          console.log('MisPasos: toggled showAsJuan ->', next);
        }}>
          {showAsJuan ? 'Volver a vista desarrollador' : 'Ver como Juan Pérez (usuario final)'}
        </Button>
        {showAsJuan ? (
          <div className="text-sm text-muted-foreground">Mostrando pasos mock de Juan Pérez</div>
        ) : (
          <div className="text-sm text-muted-foreground">Modo demo (dev)</div>
        )}
      </div>
      {(assignedToRender || []).length === 0 ? (
        <div className="text-muted-foreground">No tienes pasos asignados actualmente.</div>
      ) : (
        <div className="grid gap-3">
          {(assignedToRender as AssignedRow[]).map((a) => (
            <Card key={`${a.solicitudId}-${a.pasoId}`}>
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">{a.solicitudNombre || `Solicitud ${a.solicitudId}`}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Paso ID: {a.pasoId}</div>
                  <div className="text-sm text-muted-foreground">Grupo: {a.grupoName || a.grupoId}</div>
                  {a.flujoDescripcion && (
                    <div className="text-sm text-muted-foreground">Flujo: {a.flujoDescripcion} {a.flujoId ? `(ID ${a.flujoId})` : ''}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-green-600 text-white" onClick={() => handleDecision(a.pasoId, true)} disabled={decisionLoading}>Aprobar</Button>
                  <Button size="sm" className="bg-red-600 text-white" onClick={() => handleDecision(a.pasoId, false)} disabled={decisionLoading}>Rechazar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {actionMsg && <Badge variant="secondary">{actionMsg}</Badge>}
    </div>
  );
};

export default MisPasosPage;
