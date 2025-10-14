import React, { useEffect, useState } from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { Input, RelacionInput } from '@/types/bpm/inputs';
import { useBpm } from '@/hooks/bpm/useBpm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input as InputUI } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, Hash, Upload, Trash2, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { selectPasoDraft } from '@/store/bpm/bpmSlice';

interface EditorPasoEjecucionProps {
  paso: PasoSolicitud;
  relacionesInput?: RelacionInput[];
  inputsDisponibles?: Input[];
}

type VisibleRelacion = RelacionInput & { tmpId?: string };

export const EditorPasoEjecucion: React.FC<EditorPasoEjecucionProps> = ({
  paso,
  relacionesInput = [],
  inputsDisponibles = [],
}) => {
  const [inputsPaso, setInputsPaso] = useState<VisibleRelacion[]>([]);
  const [addSelectValue, setAddSelectValue] = useState<string>('');
  const [editOpciones, setEditOpciones] = useState<Record<number, boolean>>({});
  const [opcionesDraft, setOpcionesDraft] = useState<Record<number, string[]>>({});
  const { stageInputAdd, stageInputUpdate, stageInputCreateUpdate, stageInputDelete, pasosPorFlujo, flujoSeleccionado } = useBpm();
  const draft = useSelector((state: RootState) => selectPasoDraft(state, paso.id_paso_solicitud));

  // Cargar datos existentes desde Store (preferido) o props/paso
  useEffect(() => {
    const relacionesDesdeStore = flujoSeleccionado
      ? (pasosPorFlujo[flujoSeleccionado]?.find(p => p.id_paso_solicitud === paso.id_paso_solicitud)?.relacionesInput ?? [])
      : undefined;

    const fuente = relacionesDesdeStore && relacionesDesdeStore.length > 0
      ? relacionesDesdeStore
      : (paso.relacionesInput && paso.relacionesInput.length > 0
          ? paso.relacionesInput
          : (relacionesInput || []));

    // filtrar por paso y aplicar parches del draft (updated)
    let base: VisibleRelacion[] = fuente
      .filter((r) => r.paso_solicitud_id === paso.id_paso_solicitud)
      .map((r) => ({ ...r }));

    if (draft?.inputs?.updated?.length) {
      base = base.map((r) => {
        const upd = draft.inputs.updated.find(u => u.id === r.id_relacion);
        if (!upd) return r;
        const patched = { ...r } as VisibleRelacion;
        if (upd.patch.Nombre !== undefined) patched.nombre = upd.patch.Nombre as string;
        if (upd.patch.PlaceHolder !== undefined) patched.placeholder = upd.patch.PlaceHolder as string;
        if (upd.patch.Requerido !== undefined) patched.requerido = Boolean(upd.patch.Requerido);
        return patched;
      });
    }

    // agregar creados del draft
    const createdDrafts = draft?.inputs?.created ?? [];
    const created: VisibleRelacion[] = createdDrafts.map((c) => ({
      id_relacion: Number.NEGATIVE_INFINITY + Math.floor(Math.random() * 1000000),
      paso_solicitud_id: paso.id_paso_solicitud,
      input_id: c.InputId,
      nombre: c.Nombre,
      placeholder: c.PlaceHolder,
      requerido: Boolean(c.Requerido),
      valor: '',
      tmpId: (c as { _tmpId?: string })._tmpId,
    })) as VisibleRelacion[];

    setInputsPaso([...base, ...created]);
  }, [flujoSeleccionado, pasosPorFlujo, relacionesInput, paso.id_paso_solicitud, paso.relacionesInput, draft]);

  const agregarInput = async (inputId: number) => {
    const input = inputsDisponibles.find(i => i.id_input === inputId);
    if (!input) return;
    const countSame = inputsPaso.filter(r => r.input_id === inputId).length;
    const tmpId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const isOptionsBased = ['combobox','multiplecheckbox','radiogroup'].includes((input.tipo_input || '').toLowerCase());
    stageInputAdd(
      paso.id_paso_solicitud,
      {
        InputId: inputId,
        Nombre: (input.etiqueta || `Campo ${inputId}`) + (countSame > 0 ? ` ${countSame + 1}` : ''),
        PlaceHolder: input.placeholder,
        Requerido: Boolean(input.validacion?.required),
        // No enviar Valor en diseño; se completará en ejecución
        ...(isOptionsBased && Array.isArray(input.opciones) && input.opciones.length > 0 ? { Opciones: input.opciones } : {})
      },
      tmpId
    );
    // reset selector so user can add more
    setAddSelectValue('');
  };

  // Editores de metadatos (Título y Placeholder) por relación
  const actualizarNombre = async (rel: VisibleRelacion, nombre: string) => {
    setInputsPaso((prev) => prev.map((r) => (r === rel ? { ...r, nombre } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { Nombre: nombre });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { Nombre: nombre });
  };

  const actualizarPlaceholder = async (rel: VisibleRelacion, placeholder: string) => {
    setInputsPaso((prev) => prev.map((r) => (r === rel ? { ...r, placeholder } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { PlaceHolder: placeholder });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { PlaceHolder: placeholder });
  };

  const actualizarRequerido = async (rel: VisibleRelacion, requerido: boolean) => {
    setInputsPaso((prev) => prev.map((r) => (r === rel ? { ...r, requerido } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { Requerido: requerido });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { Requerido: requerido });
  };

  // Reordenar visualmente (no hay persistencia conocida en backend)
  const moverArriba = (idx: number) => {
    if (idx <= 0) return;
    setInputsPaso((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };
  const moverAbajo = (idx: number) => {
    setInputsPaso((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const getInputIcon = (tipo: string) => {
    switch (tipo) {
      case 'textocorto':
      case 'textolargo':
        return <FileText className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'multiplecheckbox':
        return <Hash className="w-4 h-4" />;
      case 'archivo':
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Render uses inputsPaso directly

  const getOpcionesPara = (relacion: RelacionInput, input: Input | undefined): string[] => {
    if (!input) return [];
    // Prefer options coming from backend relation's InputValue (normalized by api interceptor)
  const anyRel = relacion as unknown as Record<string, unknown>;
    const iv = (anyRel?.InputValue as unknown) || (anyRel?.inputValue as unknown) || (anyRel?.Valor as unknown); // tolerate various casings
    if (iv && typeof iv === 'object') {
      const ivRec = iv as Record<string, unknown>;
      const opts = (ivRec['Options'] as unknown) || (ivRec['opciones'] as unknown) || (ivRec['options'] as unknown);
      if (Array.isArray(opts)) return (opts as unknown[]).filter((s: unknown) => typeof s === 'string') as string[];
      const optsJson = (ivRec['OptionsJson'] as unknown) || (ivRec['optionsJson'] as unknown) || (ivRec['OpcionesJson'] as unknown);
      if (typeof optsJson === 'string') {
        try {
          const parsed = JSON.parse(optsJson);
          if (Array.isArray(parsed)) return parsed.filter((s: unknown) => typeof s === 'string');
        } catch {
          // ignore parse error
        }
      }
    }
    // Fallback: some older data stored options in placeholder as JSON array
    if (relacion.placeholder) {
      try {
        const parsed = JSON.parse(relacion.placeholder);
        if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === 'string');
      } catch {
        // ignore parse error
      }
    }
    // Finally, fallback to catalog input opciones
    return input.opciones || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paso de Ejecución
          </h3>
          <p className="text-sm text-muted-foreground">
            Configura los campos del formulario. Los ejecutores completarán los valores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {draft && <Badge variant="outline" className="bg-amber-50 text-amber-700">Cambios sin guardar</Badge>}
          <Badge variant="outline" className="bg-blue-50 text-blue-700">Ejecución</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Campos del Paso</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={addSelectValue}
              onValueChange={(value) => {
                setAddSelectValue(value);
                const id = parseInt(value, 10);
                if (!Number.isNaN(id)) agregarInput(id);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Agregar campo…" />
              </SelectTrigger>
              <SelectContent>
                {inputsDisponibles.map((input) => (
                  <SelectItem key={input.id_input} value={input.id_input.toString()}>
                    <div className="flex items-center gap-2">
                      {getInputIcon(input.tipo_input)}
                      <span>{input.etiqueta || `Campo ${input.id_input}`}</span>
                      <Badge variant="outline" className="text-xs">{input.tipo_input}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {inputsPaso.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay campos agregados. Usa &quot;Agregar campo…&quot; para empezar.</p>
          )}

          {inputsPaso.map((relacion, idx) => {
            const input = inputsDisponibles.find((i) => i.id_input === relacion.input_id);
            return (
              <div key={relacion.id_relacion} className="space-y-3 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {getInputIcon(input?.tipo_input || 'textocorto')}
                    {relacion.nombre || input?.etiqueta || `Campo ${relacion.input_id}`}
                    {relacion.requerido && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {input?.tipo_input || 'texto'}
                      {['combobox','multiplecheckbox','radiogroup'].includes((input?.tipo_input||'').toLowerCase()) ? ` · ${(getOpcionesPara(relacion, input) || []).length} opc.` : ''}
                    </Badge>
                    {/* Reordenar */}
                    <Button size="icon" variant="outline" className="h-8 w-8" disabled={idx === 0} onClick={() => moverArriba(idx)} title="Mover arriba">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" disabled={idx === inputsPaso.length - 1} onClick={() => moverAbajo(idx)} title="Mover abajo">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    {(input?.tipo_input === 'combobox' || input?.tipo_input === 'multiplecheckbox' || input?.tipo_input === 'radiogroup') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const current = getOpcionesPara(relacion, input);
                          setOpcionesDraft((prev) => ({ ...prev, [relacion.id_relacion]: [...current] }));
                          setEditOpciones((prev) => ({ ...prev, [relacion.id_relacion]: true }));
                        }}
                      >
                        Editar opciones
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={async () => {
                        if ((relacion as VisibleRelacion).tmpId) {
                          stageInputDelete(paso.id_paso_solicitud, undefined, (relacion as VisibleRelacion).tmpId);
                        } else {
                          stageInputDelete(paso.id_paso_solicitud, relacion.id_relacion);
                        }
                      }}
                      title="Eliminar campo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {input?.descripcion && (
                  <p className="text-xs text-muted-foreground">{input.descripcion}</p>
                )}

                {/* Editores de metadatos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Título</Label>
                    <InputUI
                      value={relacion.nombre ?? ''}
                      placeholder={input?.etiqueta || 'Título del campo'}
                      onChange={(e) =>
                        setInputsPaso((prev) => prev.map((r) => (r === relacion ? { ...r, nombre: e.target.value } : r)))
                      }
                      onBlur={(e) => actualizarNombre(relacion as VisibleRelacion, e.target.value.trim())}
                    />
                  </div>
                  {!(input?.tipo_input === 'combobox' || input?.tipo_input === 'multiplecheckbox') && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Placeholder</Label>
                      <InputUI
                        value={relacion.placeholder ?? ''}
                        placeholder={input?.placeholder || 'Texto de ayuda'}
                        onChange={(e) =>
                          setInputsPaso((prev) => prev.map((r) => (r === relacion ? { ...r, placeholder: e.target.value } : r)))
                        }
                        onBlur={(e) => actualizarPlaceholder(relacion as VisibleRelacion, e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-end">
                    <Label className="text-xs text-muted-foreground">Requerido</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        id={`req-${relacion.id_relacion}`}
                        type="checkbox"
                        checked={!!relacion.requerido}
                        onChange={(e) => actualizarRequerido(relacion as VisibleRelacion, e.target.checked)}
                      />
                      <Label htmlFor={`req-${relacion.id_relacion}`} className="text-sm">Obligatorio</Label>
                    </div>
                  </div>
                </div>

                {(input?.tipo_input === 'combobox' || input?.tipo_input === 'multiplecheckbox' || input?.tipo_input === 'radiogroup') && editOpciones[relacion.id_relacion] && (
                  <div className="p-3 border rounded-md space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Opciones</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditOpciones((prev) => ({ ...prev, [relacion.id_relacion]: false }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {(opcionesDraft[relacion.id_relacion] || []).map((op, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <InputUI
                          value={op}
                          onChange={(e) => {
                            const next = [...(opcionesDraft[relacion.id_relacion] || [])];
                            next[idx] = e.target.value;
                            setOpcionesDraft((prev) => ({ ...prev, [relacion.id_relacion]: next }));
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            const next = [...(opcionesDraft[relacion.id_relacion] || [])];
                            next.splice(idx, 1);
                            setOpcionesDraft((prev) => ({ ...prev, [relacion.id_relacion]: next }));
                          }}
                          title="Eliminar opción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const next = [...(opcionesDraft[relacion.id_relacion] || [])];
                          next.push('');
                          setOpcionesDraft((prev) => ({ ...prev, [relacion.id_relacion]: next }));
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Agregar opción
                      </Button>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={async () => {
                          const cleaned = (opcionesDraft[relacion.id_relacion] || [])
                            .map((s) => s.trim())
                            .filter(Boolean);
                          // Stage proper Opciones field so backend persists to OptionsJson
                          const patch = { Opciones: cleaned } as const;
                          if ((relacion as VisibleRelacion).tmpId) {
                            stageInputCreateUpdate(paso.id_paso_solicitud, (relacion as VisibleRelacion).tmpId!, patch);
                          } else {
                            stageInputUpdate(paso.id_paso_solicitud, relacion.id_relacion, patch);
                          }
                          setEditOpciones((prev) => ({ ...prev, [relacion.id_relacion]: false }));
                        }}
                      >
                        Guardar opciones
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* No footer actions in Campos: solo metadatos; valores los completará el ejecutor */}
    </div>
  );
};