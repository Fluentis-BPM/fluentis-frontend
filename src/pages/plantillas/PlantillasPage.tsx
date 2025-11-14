import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Loader2, Trash2, Edit3, Play, RefreshCcw, MoveUp, MoveDown, Info, X, Calendar as CalendarIcon } from 'lucide-react';
import { fetchPlantillas, createPlantillaThunk, deletePlantillaThunk, updatePlantillaThunk } from '@/store/templates/templatesSlice';
import type { PlantillaSolicitudCreateDto, PlantillaSolicitudDto } from '@/types/bpm/templates';
import { fetchInputsCatalog } from '@/services/inputs';
import { useToast } from '@/components/ui/use-toast';
import { fetchGrupos } from '@/store/approvalGroups/approvalGroupsSlice';
import { useNavigate } from 'react-router-dom';
import { CampoDinamico } from '@/components/bpm/requests/CampoDinamico';
import type { Input as InputType } from '@/types/bpm/inputs';
import { normalizeTipoInput as normTipo } from '@/types/bpm/inputs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select as UiSelect, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue, SelectContent as UiSelectContent, SelectItem as UiSelectItem } from '@/components/ui/select';
import { Badge as UiBadge } from '@/components/ui/badge';

export default function PlantillasPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, loading, creating, updating, deleting } = useSelector((s: RootState) => s.templates);
  const grupos = useSelector((s: RootState) => s.approvalGroups.grupos);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'inputs'>('recent');
  const [catalog, setCatalog] = useState<{ idInput: number; tipoInput: string; esJson: boolean; label?: string }[]>([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [editTarget, setEditTarget] = useState<PlantillaSolicitudDto | null>(null);
  const [form, setForm] = useState<PlantillaSolicitudCreateDto>({ Nombre: '', Descripcion: '', Inputs: [] });
  // Config local por input (para opciones de combo/multiple y ayuda de previsualización)
  const [inputConfig, setInputConfig] = useState<Record<number, { options: string[] }>>({});
  // Borrador de opción por fila
  const [optionDrafts, setOptionDrafts] = useState<Record<number, string>>({});

  useEffect(() => { dispatch(fetchPlantillas()); }, [dispatch]);
  useEffect(() => { fetchInputsCatalog().then(setCatalog).catch(() => {}); }, []);
  useEffect(() => { if (!grupos || grupos.length === 0) { dispatch(fetchGrupos()); } }, [dispatch, grupos?.length]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = items.filter((p) => p.nombre.toLowerCase().includes(q));
    return [...base].sort((a, b) => {
      if (sortBy === 'name') return a.nombre.localeCompare(b.nombre);
      if (sortBy === 'inputs') return (b.inputs?.length || 0) - (a.inputs?.length || 0);
      // recent: fechaCreacion desc si existe, luego id desc
      const da = a.fechaCreacion ? Date.parse(a.fechaCreacion) : 0;
      const db = b.fechaCreacion ? Date.parse(b.fechaCreacion) : 0;
      if (db !== da) return db - da;
      return (b.idPlantilla || 0) - (a.idPlantilla || 0);
    });
  }, [items, search, sortBy]);
  const gruposById = useMemo(() => Object.fromEntries((grupos || []).map((g) => [g.id_grupo, g.nombre])), [grupos]);

  const resetForm = () => { setForm({ Nombre: '', Descripcion: '', Inputs: [] }); setEditTarget(null); };

  const openCreate = () => { resetForm(); setOpenEditor(true); };
  const openEdit = (tpl: PlantillaSolicitudDto) => {
    setEditTarget(tpl);
    setForm({
      Nombre: tpl.nombre,
      Descripcion: tpl.descripcion ?? '',
      GrupoAprobacionId: tpl.grupoAprobacionId ?? null,
      Inputs: (tpl.inputs || []).map((i) => ({ InputId: i.inputId, Nombre: i.nombre, PlaceHolder: i.placeHolder ?? null, Requerido: i.requerido, ValorPorDefecto: i.valorPorDefecto ?? null })),
    });
  // Cargar opciones existentes por índice
  const cfg: Record<number, { options: string[] }> = {};
  (tpl.inputs || []).forEach((i, idx) => {
    if (i.opciones && Array.isArray(i.opciones) && i.opciones.length > 0) {
      cfg[idx] = { options: i.opciones.filter(o => !!o) };
    }
  });
  setInputConfig(cfg);
    setOpenEditor(true);
  };

  const isValid = useMemo(() => {
    if ((form.Nombre?.trim().length ?? 0) === 0) return false;
    for (const [idx, inp] of (form.Inputs || []).entries()) {
      const nombre = (inp.Nombre || '').trim();
      if (!nombre) return false;
      const tipo = normTipo(catalog.find(c => c.idInput === inp.InputId)?.tipoInput || 'textocorto');
      const needsOptions = ['combobox', 'multiplecheckbox', 'radiogroup'].includes(tipo);
      if (needsOptions) {
        const opts = inputConfig[idx]?.options || [];
        if (opts.length === 0) return false;
        if (inp.ValorPorDefecto) {
          if (tipo === 'multiplecheckbox') {
            try {
              const arr = JSON.parse(String(inp.ValorPorDefecto));
              if (!Array.isArray(arr) || arr.some(v => !opts.includes(String(v)))) return false;
            } catch { return false; }
          } else if (!opts.includes(String(inp.ValorPorDefecto))) {
            return false;
          }
        }
      }
    }
    return true;
  }, [form, catalog, inputConfig]);

  const submit = async () => {
    try {
      if (!form.Nombre || form.Nombre.trim().length === 0) {
        toast({ title: 'Nombre requerido', description: 'La plantilla debe tener un nombre.' });
        return;
      }
      const inputs = (form.Inputs || []).map((inp, idx) => {
        const tipo = normTipo(catalog.find(c => c.idInput === inp.InputId)?.tipoInput || 'textocorto');
        const needsOptions = ['combobox', 'multiplecheckbox', 'radiogroup'].includes(tipo);
        const options = needsOptions ? (inputConfig[idx]?.options || []) : [];
        return {
          InputId: inp.InputId,
          Nombre: (inp.Nombre || '').trim(),
          PlaceHolder: inp.PlaceHolder?.trim() || null,
          Requerido: !!inp.Requerido,
          ValorPorDefecto: inp.ValorPorDefecto ?? null,
          ...(options.length > 0 ? { Opciones: options } : {})
        };
      });
      const payloadApi: PlantillaSolicitudCreateDto = {
        Nombre: form.Nombre.trim(),
        Descripcion: form.Descripcion?.trim() || null,
        GrupoAprobacionId: form.GrupoAprobacionId ?? null,
        Inputs: inputs
      };
      if (editTarget) {
        await dispatch(updatePlantillaThunk({ id: editTarget.idPlantilla, body: payloadApi })).unwrap();
        toast({ title: 'Plantilla actualizada' });
      } else {
        await dispatch(createPlantillaThunk(payloadApi)).unwrap();
        toast({ title: 'Plantilla creada' });
      }
      setOpenEditor(false);
      resetForm();
      dispatch(fetchPlantillas());
    } catch (e) {
      const err = e as Error;
      const msg = err.message || 'Operación fallida';
      toast({ title: 'Error', description: msg });
    }
  };

  const remove = async (tpl: PlantillaSolicitudDto) => {
    try {
      await dispatch(deletePlantillaThunk({ id: tpl.idPlantilla })).unwrap();
      toast({ title: 'Plantilla eliminada' });
      dispatch(fetchPlantillas());
    } catch (e) {
      toast({ title: 'Error eliminando', description: (e as Error).message });
    }
  };

  const addInput = () => setForm((f) => ({ ...f, Inputs: [...(f.Inputs || []), { InputId: catalog[0]?.idInput || 1, Requerido: false, Nombre: '' }] }));
  const updateInput = (idx: number, patch: Partial<NonNullable<PlantillaSolicitudCreateDto['Inputs']>[number]>) => setForm((f) => ({ ...f, Inputs: (f.Inputs || []).map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));
  const removeInput = (idx: number) => setForm((f) => ({ ...f, Inputs: (f.Inputs || []).filter((_, i) => i !== idx) }));
  const moveInput = (idx: number, dir: 'up' | 'down') => setForm((f) => {
    const arr = [...(f.Inputs || [])]
    const j = dir === 'up' ? idx - 1 : idx + 1
    if (j < 0 || j >= arr.length) return f
    ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    return { ...f, Inputs: arr }
  })

  // Helpers para editores especiales
  const setOptionsFor = (idx: number, options: string[]) => setInputConfig((s) => ({ ...s, [idx]: { options } }));
  const addOption = (idx: number, value: string) => {
    const cur = inputConfig[idx]?.options || [];
    const v = value.trim();
    if (!v) return;
    if (cur.includes(v)) return;
    setOptionsFor(idx, [...cur, v]);
  };
  const removeOption = (idx: number, value: string) => {
    const cur = inputConfig[idx]?.options || [];
    setOptionsFor(idx, cur.filter(o => o !== value));
  };
  const parseMultiDefault = (s?: string | null): string[] => {
    if (!s) return [];
    try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
  };
  const setMultiDefault = (idx: number, next: string[]) => updateInput(idx, { ValorPorDefecto: JSON.stringify(next) });

  // (Deprecated simple isValid replaced by memo logic above)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas de Solicitud</h1>
          <p className="text-sm text-muted-foreground">Define campos preestablecidos y acelera la creación de solicitudes.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <Input placeholder="Buscar plantillas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
            <Select value={sortBy} onValueChange={(v: 'recent' | 'name' | 'inputs') => setSortBy(v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="name">Nombre (A-Z)</SelectItem>
                <SelectItem value="inputs">Más campos</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="ml-1">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => dispatch(fetchPlantillas())} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />Refrescar
            </Button>
            <Button onClick={openCreate} variant="gradient">
              <Plus className="h-4 w-4 mr-2" />Nueva plantilla
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Plantillas</CardTitle>
          <div className="w-64">
            <Input placeholder="Buscar plantillas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-base font-medium">No hay resultados</p>
              <p className="text-sm text-muted-foreground">Ajusta la búsqueda o crea tu primera plantilla.</p>
              <div className="mt-4">
                <Button onClick={openCreate} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />Nueva plantilla
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((tpl) => (
                <Card key={tpl.idPlantilla} className="group border hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-tight truncate">{tpl.nombre}</CardTitle>
                      <div className="flex items-center gap-2">
                        {(tpl.inputs?.length ?? 0) > 0 && (
                          <Badge variant="secondary" className="shrink-0">{tpl.inputs?.length} campos</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{tpl.descripcion || 'Sin descripción'}</p>
                    <div className="flex flex-wrap gap-1">
                      {(tpl.inputs || []).slice(0, 4).map((i, idx) => (
                        <Badge key={idx} variant="outline" className="max-w-full truncate">
                          #{i.inputId} {i.nombre || ''}
                        </Badge>
                      ))}
                      {(tpl.inputs || []).length > 4 && (
                        <Badge variant="secondary">+{(tpl.inputs || []).length - 4}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {tpl.grupoAprobacionId ? (
                        <Badge variant="outline">Grupo: {gruposById[tpl.grupoAprobacionId] || `#${tpl.grupoAprobacionId}`}</Badge>
                      ) : null}
                    </div>
                    <div className="flex justify-between pt-1">
                      <div className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(tpl)}>
                          <Edit3 className="h-4 w-4 mr-2" />Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(tpl)} disabled={deleting}>
                          <Trash2 className="h-4 w-4 mr-2" />{deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/flujos/plantillas/${tpl.idPlantilla}/usar`)} variant="gradient">
                        <Play className="h-4 w-4 mr-2" />Usar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openEditor} onOpenChange={setOpenEditor}>
        <DialogContent className="max-w-6xl max-h-[85vh] rounded-xl border shadow-xl flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editTarget ? 'Editar plantilla' : 'Nueva plantilla'}</DialogTitle>
          </DialogHeader>
          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="space-y-4 lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={form.Nombre} onChange={(e) => setForm((f) => ({ ...f, Nombre: e.target.value }))} placeholder="Nombre de la plantilla" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Descripción</Label>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3.5 w-3.5" />Opcional</span>
                  </div>
                  <Input value={form.Descripcion ?? ''} onChange={(e) => setForm((f) => ({ ...f, Descripcion: e.target.value }))} placeholder="Breve descripción (opcional)" />
                </div>
              </div>
              <Tabs defaultValue="inputs">
              <TabsList>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="opciones">Opciones</TabsTrigger>
              </TabsList>
              <TabsContent value="inputs" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Campos</h3>
                  <Button size="sm" onClick={addInput} variant="gradient">
                    <Plus className="h-4 w-4 mr-2" />Agregar campo
                  </Button>
                </div>
                <div className="space-y-3">
                  {(form.Inputs || []).map((inp, idx) => {
                    const tipo = normTipo(catalog.find(c => c.idInput === inp.InputId)?.tipoInput || 'textocorto');
                    const opts = inputConfig[idx]?.options || [];
                    const nombreVacio = !(inp.Nombre || '').trim();
                    const needsOptions = ['combobox','multiplecheckbox','radiogroup'].includes(tipo);
                    const faltanOpciones = needsOptions && opts.length === 0;
                    return (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-12 gap-3 items-start rounded-lg p-4 border bg-muted/30 transition-colors ${nombreVacio || faltanOpciones ? 'border-red-400/70 hover:border-red-500' : 'border-border/60 hover:border-primary/30'}`}> 
                      <div className="md:col-span-3">
                        <Label>Catálogo</Label>
                        <Select value={String(inp.InputId)} onValueChange={(v) => updateInput(idx, { InputId: Number(v) })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione input" />
                          </SelectTrigger>
                          <SelectContent>
                            {catalog.map((it) => (
                              <SelectItem key={it.idInput} value={String(it.idInput)}>
                                <span className="flex flex-col text-left">
                                  <span>{it.label || it.tipoInput}</span>
                                  <span className="text-[10px] text-muted-foreground">{it.tipoInput} • ID #{it.idInput}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3">
                        <Label>Nombre</Label>
                        <Input value={inp.Nombre ?? ''} onChange={(e) => updateInput(idx, { Nombre: e.target.value })} placeholder="Nombre visible" className={nombreVacio ? 'border-red-400 focus-visible:ring-red-500' : ''} />
                        {nombreVacio && <p className="text-[10px] mt-1 text-red-500">Requerido</p>}
                      </div>
                      <div className="md:col-span-3">
                        <Label>Placeholder</Label>
                        <Input value={inp.PlaceHolder ?? ''} onChange={(e) => updateInput(idx, { PlaceHolder: e.target.value })} placeholder="Placeholder" />
                      </div>
                      {/* Valor por defecto con editor especial por tipo */}
                      <div className="md:col-span-2">
                        <Label>Valor por defecto</Label>
                        {tipo === 'textolargo' ? (
                          <Textarea value={inp.ValorPorDefecto ?? ''} onChange={(e) => updateInput(idx, { ValorPorDefecto: e.target.value })} placeholder="Texto largo..." rows={1} />
                        ) : tipo === 'number' ? (
                          <Input type="number" value={inp.ValorPorDefecto ?? ''} onChange={(e) => updateInput(idx, { ValorPorDefecto: e.target.value })} placeholder="0" />
                        ) : tipo === 'date' ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {inp.ValorPorDefecto ? new Date(inp.ValorPorDefecto).toLocaleDateString() : 'Selecciona fecha'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={inp.ValorPorDefecto ? new Date(inp.ValorPorDefecto) : undefined}
                                onSelect={(d: Date | { from?: Date; to?: Date } | undefined) => {
                                  let picked: Date | undefined;
                                  if (!d) picked = undefined;
                                  else if (d instanceof Date) picked = d;
                                  else picked = (d as { from?: Date }).from;
                                  updateInput(idx, { ValorPorDefecto: picked ? picked.toISOString() : '' });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        ) : tipo === 'combobox' || tipo === 'radiogroup' ? (
                          <UiSelect value={String(inp.ValorPorDefecto ?? '')} onValueChange={(v) => updateInput(idx, { ValorPorDefecto: v })}>
                            <UiSelectTrigger>
                              <UiSelectValue placeholder="Selecciona opción" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                              {opts.map((o) => (
                                <UiSelectItem key={o} value={o}>{o}</UiSelectItem>
                              ))}
                            </UiSelectContent>
                          </UiSelect>
                        ) : tipo === 'multiplecheckbox' ? (
                          <div className="flex flex-wrap gap-2">
                            {opts.map((o) => {
                              const selected = parseMultiDefault(inp.ValorPorDefecto).includes(o);
                              return (
                                <Button key={o} type="button" variant={selected ? 'default' : 'outline'} size="sm" onClick={() => {
                                  const cur = parseMultiDefault(inp.ValorPorDefecto);
                                  const next = selected ? cur.filter(x => x !== o) : [...cur, o];
                                  setMultiDefault(idx, next);
                                }}>
                                  {o}
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <Input value={inp.ValorPorDefecto ?? ''} onChange={(e) => updateInput(idx, { ValorPorDefecto: e.target.value })} placeholder="Valor" />
                        )}
                      </div>
                      <div className="md:col-span-1 flex flex-col justify-end">
                        <Label className="mb-1">Requerido</Label>
                        <Switch checked={Boolean(inp.Requerido)} onCheckedChange={(v) => updateInput(idx, { Requerido: v })} />
                      </div>
                      <div className="md:col-span-1 flex items-end gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => moveInput(idx, 'up')} disabled={idx === 0}>
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => moveInput(idx, 'down')} disabled={idx === (form.Inputs?.length || 0) - 1}>
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => removeInput(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Editor especial por tipo: opciones para combo / multiple */}
                      {(tipo === 'combobox' || tipo === 'multiplecheckbox' || tipo === 'radiogroup') && (
                        <div className="md:col-span-12 grid grid-cols-1 gap-2">
                          <div>
                            <Label>Opciones ({opts.length})</Label>
                            <div className="flex gap-2 mt-1">
                              {/* Control de entrada dedicado para evitar hacks con document.activeElement */}
                              <Input
                                placeholder="Nueva opción"
                                value={optionDrafts[idx] ?? ''}
                                onChange={(e) => setOptionDrafts((d) => ({ ...d, [idx]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = optionDrafts[idx] ?? '';
                                    addOption(idx, val);
                                    setOptionDrafts((d) => ({ ...d, [idx]: '' }));
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const val = optionDrafts[idx] ?? '';
                                  addOption(idx, val);
                                  setOptionDrafts((d) => ({ ...d, [idx]: '' }));
                                }}
                              >Agregar</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {opts.map((o) => (
                                <UiBadge key={o} variant="secondary" className="gap-1">
                                  {o}
                                  <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => removeOption(idx, o)}>
                                    <X className="h-3 w-3" />
                                  </button>
                                </UiBadge>
                              ))}
                              {opts.length === 0 && (
                                <span className="text-xs ${faltanOpciones ? 'text-red-500' : 'text-muted-foreground'}">Agrega opciones para habilitar selección por defecto</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </TabsContent>
              <TabsContent value="opciones">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Grupo aprobador (opcional)</Label>
                    <Select value={form.GrupoAprobacionId ? String(form.GrupoAprobacionId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, GrupoAprobacionId: v ? Number(v) : null }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((g) => (
                          <SelectItem key={g.id_grupo} value={String(g.id_grupo)}>
                            {g.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              </Tabs>
            </div>
            <div className="space-y-3 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Previsualización</h3>
                <span className="text-xs text-muted-foreground">Así verá el usuario el formulario</span>
              </div>
              <Card className="border border-border/60 bg-white/60 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm font-medium">{form.Nombre || 'Nombre de la plantilla'}</p>
                    <p className="text-xs text-muted-foreground">{form.Descripcion || 'Descripción breve'}</p>
                  </div>
                  <div className="space-y-2">
                    {(form.Inputs || []).length === 0 && (
                      <p className="text-xs text-muted-foreground">Aún no agregas campos.</p>
                    )}
                    {(form.Inputs || []).map((inp, i) => {
                      const tipo = normTipo(catalog.find(c => c.idInput === inp.InputId)?.tipoInput || 'textocorto');
                      const inputObj: InputType = {
                        id_input: inp.InputId,
                        tipo_input: tipo,
                        etiqueta: inp.Nombre || `Campo #${i + 1}`,
                        placeholder: inp.PlaceHolder || undefined,
                        opciones: inputConfig[i]?.options || [],
                      };
                      return (
                        <div key={i} className="space-y-1">
                          <CampoDinamico
                            input={inputObj}
                            valor={String(inp.ValorPorDefecto ?? '')}
                            requerido={Boolean(inp.Requerido)}
                            onChange={() => { /* solo preview */ }}
                            showRequiredToggle={false}
                          />
                          <div className="flex items-center gap-2">
                            <UiBadge variant="outline">Input #{inp.InputId}</UiBadge>
                            {inp.ValorPorDefecto && (
                              <UiBadge variant="secondary">Defecto: {String(inp.ValorPorDefecto)}</UiBadge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="ghost" onClick={() => setOpenEditor(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={!isValid || creating || updating}>
              {(creating || updating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editTarget ? 'Guardar cambios' : 'Crear plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
