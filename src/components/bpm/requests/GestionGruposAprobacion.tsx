import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit } from 'lucide-react';
import { HistorialDecisiones } from './HistorialDecisiones';
import { useDecision } from '@/hooks/bpm/useDecision';
// NUEVOS IMPORTS PARA MULTI-SELECT
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useUsers } from '@/hooks/users/useUsers';
import { useAprobations } from '@/hooks/equipos/aprobations/useAprobations';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { User } from '@/types/auth';

import type { GrupoAprobacion } from '@/types/equipos/aprobations';

type GestionGruposAprobacionProps = {
  visibleGroups?: GrupoAprobacion[];
};

export const GestionGruposAprobacion: React.FC<GestionGruposAprobacionProps> = ({ visibleGroups }) => {
  // Obtener grupos backend
  const { grupos, createGrupo, creating, refetch, deleteGrupo, deleting } = useAprobations();
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  // Reemplaza miembros & nuevoMiembroId por selectedUserIds y UI moderna
  // Usamos string para soportar IDs GUID o numéricos de forma consistente
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  // const [grupoEditando, setGrupoEditando] = useState<number | null>(null); // eliminado: edición aún no implementada
  const [openUsersPicker, setOpenUsersPicker] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // valor mientras el usuario escribe
  const [searchQuery, setSearchQuery] = useState(''); // valor aplicado (debounced)
  const [deptFilter, setDeptFilter] = useState<string>('todos');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [esGlobal, setEsGlobal] = useState(false); // nuevo estado para marcar grupo global
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Hooks para usuarios y backend
  const { users, loading: usersLoading } = useUsers();
  // Determine groups to show: if visibleGroups provided, use it.
  // Dev users see all groups; others see only global groups or groups where they are member.
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const roleName = String(currentUser?.rolNombre ?? '');
  // Consider common role names that imply developer/admin privileges
  const roleMatches = /dev|admin|desarrollad|developer/i.test(roleName);
  // If running in Vite dev mode, treat as developer for visibility (dev-only behavior)
  const isDevEnv = typeof import.meta !== 'undefined' && Boolean(((import.meta as unknown) as { env?: Record<string, string> })?.env?.DEV);
  const isDeveloper = roleMatches || isDevEnv;

  const effectiveGroups = React.useMemo(() => {
    if (visibleGroups) return visibleGroups;
    if (isDeveloper) return grupos;
    return grupos.filter(g => {
      if (g.es_global) return true;
      const miembros = ((g.usuarios || []) as User[]).map((u) => u.idUsuario).filter(Boolean) as number[];
      return miembros.includes(Number(currentUser?.idUsuario ?? 0));
    });
  }, [grupos, visibleGroups, isDeveloper, currentUser]);

  // Hook para ejecutar decisiones contra backend
  const { loading: decisionLoading, executePaso } = useDecision();

  // ---- Pasos BPM simulados (reinsert) ----
  const pasosIniciales = [
    { id: 1, nombre: 'Aprobar solicitud de compra', grupoId: 2 },
    { id: 2, nombre: 'Revisar contrato', grupoId: 1 },
    { id: 3, nombre: 'Validar presupuesto', grupoId: 2 },
  ];
  const [pasosAprobacion, setPasosAprobacion] = useState(pasosIniciales);
  const getEstadoPaso = (id: number) => {
    const estados = JSON.parse(localStorage.getItem('aprobacionesBPM') || '{}');
    return estados[id];
  };
  // Ejecuta la decisión en el backend y actualiza el estado local (demo)
  const handleDecision = async (id: number, decision: boolean) => {
    try {
      const idUsuario = Number(currentUser?.idUsuario ?? 0);
      await executePaso(id, { IdUsuario: idUsuario, Decision: decision });
      const estados = JSON.parse(localStorage.getItem('aprobacionesBPM') || '{}');
      estados[id] = decision ? 'aprobado' : 'rechazado';
      localStorage.setItem('aprobacionesBPM', JSON.stringify(estados));
      setPasosAprobacion(prev => prev.map(p => p.id === id ? { ...p } : p));
    } catch (e) {
      console.error('Error ejecutando decisión en paso', id, e);
      // No romper la UX: informar por consola y dejar el estado sin cambios
    }
  };

  // Devuelve siempre la representación string del ID original
  const getUserIdStr = (u: User) => String(u.idUsuario ?? u.oid);
  const getUserIdNum = (u: User) => {
    const base = u.idUsuario ?? (typeof u.oid === 'number' ? u.oid : parseInt(String(u.oid), 10));
    return isNaN(Number(base)) ? null : Number(base);
  };

  // Normalizar texto (remover acentos y convertir a lower)
  const normalize = (s?: string) => (s || '')
    .toLowerCase()
    .normalize('NFD')
    // Quitar acentos (sin \p{Diacritic} por compatibilidad amplia)
    .replace(/[\u0300-\u036f]/g, '');

  // Debounce de búsqueda
  useEffect(() => {
    const h = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => clearTimeout(h);
  }, [searchInput]);

  // Conjuntos para filtros
  const departamentos = useMemo(() => Array.from(new Set(users.map(u => u.departamentoNombre).filter(Boolean))), [users]);
  const roles = useMemo(() => Array.from(new Set(users.map(u => u.rolNombre).filter(Boolean))), [users]);

  const usuariosFiltrados = useMemo(() => {
    const q = normalize(searchQuery);
    return users
      .filter(u => {
        if (showOnlySelected && !selectedUserIds.includes(getUserIdStr(u))) return false;
        if (deptFilter !== 'todos' && u.departamentoNombre !== deptFilter) return false;
        if (roleFilter !== 'todos' && u.rolNombre !== roleFilter) return false;
        if (!q) return true;
        const target = [u.nombre, u.email, u.departamentoNombre, u.cargoNombre, u.rolNombre].map(normalize).join(' ');
        return target.includes(q);
      })
      .sort((a, b) => {
        const aSel = selectedUserIds.includes(getUserIdStr(a)) ? -1 : 1;
        const bSel = selectedUserIds.includes(getUserIdStr(b)) ? -1 : 1;
        if (aSel !== bSel) return aSel - bSel; // seleccionados primero
        return a.nombre.localeCompare(b.nombre);
      });
  }, [users, searchQuery, deptFilter, roleFilter, selectedUserIds, showOnlySelected]);

  const selectedUsersObjects = selectedUserIds
    .map(idStr => users.find(u => getUserIdStr(u) === idStr))
    .filter(Boolean) as User[];

  const toggleUsuario = (idStr: string) => {
    setSelectedUserIds(prev => prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  };

  const resetForm = () => {
    setNombreGrupo('');
    setSelectedUserIds([]);
    // setGrupoEditando(null); // eliminado
    setSearchInput('');
    setSearchQuery('');
    setDeptFilter('todos');
    setRoleFilter('todos');
    setShowOnlySelected(false);
    setEsGlobal(false); // reset
  };

  const handleCrear = async () => {
    if (!nombreGrupo.trim()) return;
    try {
      const numericIds = selectedUsersObjects
        .map(getUserIdNum)
        .filter((v): v is number => v !== null);
      if (numericIds.length === 0) {
        console.warn('Debe seleccionar al menos un usuario (idUsuario)');
        return;
      }
      await createGrupo({ nombre: nombreGrupo.trim(), esGlobal, usuarioIds: numericIds }); // usar estado esGlobal
      resetForm();
      setMostrarCrear(false);
      refetch();
    } catch (e) {
      console.error('Error creando grupo de aprobación BPM:', e);
    }
  };

  // Eliminado iniciarEdicion hasta implementar PUT backend
  return (
    <div className="space-y-6">
      {/* Header + Modal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Grupos de Aprobación</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMostrarHistorial(true)}>Historial</Button>
          <Dialog open={mostrarCrear} onOpenChange={(o) => { if(!o) resetForm(); setMostrarCrear(o); }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-gray-800">
                Crear Nuevo Grupo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-medium text-gray-700">Nombre del Grupo</Label>
                <Input id="nombre" value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} placeholder="Ej: Aprobadores de IT" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input id="esGlobal" type="checkbox" checked={esGlobal} onChange={e => setEsGlobal(e.target.checked)} className="h-4 w-4 accent-primary" />
                <Label htmlFor="esGlobal" className="text-sm text-gray-700 select-none">Grupo Global (visible para todos)</Label>
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Miembros del Grupo</Label>
                {/* Selector avanzado de usuarios */}
                <Popover open={openUsersPicker} onOpenChange={setOpenUsersPicker}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between text-sm">
                      {selectedUserIds.length === 0 ? 'Seleccionar usuarios' : `${selectedUserIds.length} usuario(s) seleccionados`}
                      <span className="text-[10px] text-muted-foreground">{openUsersPicker ? 'Cerrar' : 'Abrir'}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[520px] p-3 space-y-3">
                    <div className="flex flex-col gap-2">
                      <Input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Buscar (nombre, email, depto, cargo, rol)" className="text-xs" autoFocus />
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="border rounded px-2 py-1 bg-background">
                          <option value="todos">Depto: Todos</option>
                          {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-2 py-1 bg-background">
                          <option value="todos">Rol: Todos</option>
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <label className="flex items-center gap-1 cursor-pointer select-none">
                          <input type="checkbox" className="accent-primary" checked={showOnlySelected} onChange={e => setShowOnlySelected(e.target.checked)} />
                          Solo seleccionados
                        </label>
                        <button type="button" onClick={() => { setSelectedUserIds([]); }} className="underline text-red-500">Limpiar</button>
                        <button type="button" onClick={() => { setSelectedUserIds(users.map(getUserIdStr)); }} className="underline text-primary">Todos</button>
                        <button type="button" onClick={() => setOpenUsersPicker(false)} className="underline text-muted-foreground ml-auto">Cerrar</button>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground -mt-1">
                      {searchQuery && `Filtrando por: "${searchQuery}"`} {creating && 'Guardando...'}
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-1 space-y-1 border rounded p-1">
                      {usersLoading && <div className="text-xs text-muted-foreground px-1">Cargando usuarios...</div>}
                      {!usersLoading && usuariosFiltrados.length === 0 && (
                        <div className="text-xs text-muted-foreground px-1">Sin resultados</div>
                      )}
                      {usuariosFiltrados.map(u => {
                        const idStr = getUserIdStr(u);
                        const checked = selectedUserIds.includes(idStr);
                        return (
                          <label key={idStr} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${checked ? 'bg-primary/10' : 'hover:bg-accent'}`}>
                            <Checkbox checked={checked} onCheckedChange={() => toggleUsuario(idStr)} />
                             <div className="flex flex-col leading-tight">
                               <span className="font-medium">{u.nombre}</span>
                               <span className="text-[10px] text-muted-foreground">{u.email}</span>
                             </div>
                            <div className="ml-auto flex flex-col items-end text-[10px] text-muted-foreground text-right">
                              {u.departamentoNombre && <span>{u.departamentoNombre}</span>}
                              <span>{u.rolNombre}</span>
                              {u.cargoNombre && <span className="opacity-70">{u.cargoNombre}</span>}
                            </div>
                           </label>
                         );
                       })}
                     </div>
                     {selectedUsersObjects.length > 0 && (
                       <div className="flex flex-wrap gap-1 border-t pt-2">
                         {selectedUsersObjects.map(u => {
                           const idStr = getUserIdStr(u);
                           return (
                             <span key={idStr} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                               {u.nombre}
                               <button type="button" onClick={() => toggleUsuario(idStr)} className="hover:text-red-500">✕</button>
                             </span>
                           );
                         })}
                        <button type="button" onClick={() => setSelectedUserIds([])} className="text-[10px] text-red-500 hover:underline">Limpiar</button>
                        <button type="button" onClick={() => setOpenUsersPicker(false)} className="text-[10px] text-primary hover:underline">Listo</button>
                       </div>
                     )}
                   </PopoverContent>
                 </Popover>
                {selectedUsersObjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 p-2 border rounded bg-muted/30 max-h-32 overflow-y-auto">
                    {selectedUsersObjects.map(u => {
                      const idStr = getUserIdStr(u);
                      return (
                        <span key={idStr} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] flex items-center gap-1">
                          {u.nombre}
                          <button type="button" onClick={() => toggleUsuario(idStr)} className="hover:text-red-500">✕</button>
                        </span>
                      );
                    })}
                  </div>
                )}
               </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCrear} disabled={!nombreGrupo.trim() || creating} className="flex-1 font-bold shadow-md" style={{ background: '#fff', color: '#111', border: '2px solid #000' }}>
                  {creating ? 'Creando...' : 'Crear Grupo'}
                </Button>
                <Button variant="outline" onClick={() => { resetForm(); setMostrarCrear(false); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>

      <Dialog open={mostrarHistorial} onOpenChange={setMostrarHistorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de Decisiones</DialogTitle>
          </DialogHeader>
          <HistorialDecisiones onClose={() => setMostrarHistorial(false)} />
        </DialogContent>
      </Dialog>
      </div>

      {/* Lista de grupos */}
      <div className="grid gap-4">
    {effectiveGroups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay grupos creados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer grupo de aprobación para comenzar
              </p>
              <Button onClick={() => setMostrarCrear(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Grupo
              </Button>
            </CardContent>
          </Card>
          ) : (
            effectiveGroups.map((grupo) => (
            <Card key={(grupo as GrupoAprobacion).id_grupo}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">{grupo.nombre}{grupo.es_global && <Badge variant="outline" className="text-[10px]">Global</Badge>}</CardTitle>
                  <div className="flex gap-2">
                    {/* Botón de edición deshabilitado temporalmente */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Edición aún no disponible"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                      onClick={() => deleteGrupo(grupo.id_grupo)}
                      title="Eliminar grupo"
                    >
                      {deleting ? '...' : 'Eliminar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    ID del Grupo: {grupo.id_grupo}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Miembros: </span>
                    {(!grupo.usuarios || grupo.usuarios.length === 0) ? (
                      <span className="text-muted-foreground">No hay miembros</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(((grupo as GrupoAprobacion).usuarios || []) as User[]).map(u => (
                          <Badge key={u.idUsuario ?? (u as unknown as { oid?: number }).oid} variant="secondary" className="text-xs">
                            {u.nombre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sección de aprobación/rechazo de pasos BPM asignados al usuario logueado */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4 text-primary">Aprobación de Pasos BPM Asignados</h3>
        {pasosAprobacion.length === 0 ? (
          <div className="text-muted-foreground">No tienes pasos pendientes para aprobar/rechazar.</div>
        ) : (
          <div className="space-y-4">
            {pasosAprobacion.map(paso => {
              const estado = getEstadoPaso(paso.id);
              return (
                <Card key={paso.id} className="border-l-4 border-primary">
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="font-semibold">{paso.nombre}</div>
                    <div className="text-sm text-muted-foreground">Grupo asignado: {paso.grupoId}</div>
                    <div className="flex gap-2 items-center mt-2">
                      {!estado ? (
                        <>
                          <Button size="sm" className="bg-green-600 text-white" onClick={() => handleDecision(paso.id, true)} disabled={decisionLoading}>Aprobar</Button>
                          <Button size="sm" className="bg-red-600 text-white" onClick={() => handleDecision(paso.id, false)} disabled={decisionLoading}>Rechazar</Button>
                        </>
                      ) : (
                        <Badge variant={estado === 'aprobado' ? 'success' : 'destructive'}>
                          {estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};