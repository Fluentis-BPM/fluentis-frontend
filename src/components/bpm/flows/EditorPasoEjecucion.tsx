import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PasoSolicitud } from '@/types/bpm/flow';
import { Input as InputType, RelacionInput, normalizeTipoInput } from '@/types/bpm/inputs';
import { useBpm } from '@/hooks/bpm/useBpm';
import type { RootState } from '@/store';
import { selectPasoDraft } from '@/store/bpm/bpmSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input as InputUI } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Calendar, Hash, Upload, Trash2 } from 'lucide-react';

interface EditorPasoEjecucionProps {
  paso: PasoSolicitud;
  relacionesInput?: RelacionInput[];
  inputsDisponibles?: InputType[];
  // When true, render a read-only view (for paso inicial)
  readOnly?: boolean;
}

type VisibleRelacion = RelacionInput & { tmpId?: string };

export const EditorPasoEjecucion: React.FC<EditorPasoEjecucionProps> = ({
  paso,
  relacionesInput = [],
  inputsDisponibles = [],
  readOnly = false,
}) => {
  const { stageInputAdd, stageInputCreateUpdate, stageInputUpdate, stageInputDelete } = useBpm();
  const draft = useSelector((state: RootState) => selectPasoDraft(state, paso.id_paso_solicitud));

  const baseRelaciones = useMemo<RelacionInput[]>(() => {
    const fuente = (relacionesInput && relacionesInput.length > 0)
      ? relacionesInput
      : (paso.relacionesInput || []);
    return Array.isArray(fuente) ? fuente.filter(r => r.paso_solicitud_id === paso.id_paso_solicitud) : [];
  }, [relacionesInput, paso.relacionesInput, paso.id_paso_solicitud]);

  const visibleRelaciones = useMemo<VisibleRelacion[]>(() => {
    let list: VisibleRelacion[] = baseRelaciones.map(r => ({ ...r }));
    // Apply deletions
    if (draft?.inputs?.deleted?.length) {
      const deleted = new Set(draft.inputs.deleted);
      list = list.filter(r => !deleted.has(r.id_relacion));
    }
    // Apply updates
    if (draft?.inputs?.updated?.length) {
      list = list.map(r => {
        const upd = draft.inputs.updated.find(u => u.id === r.id_relacion);
        if (!upd) return r;
        const patched = { ...r } as VisibleRelacion;
        if (upd.patch.Nombre !== undefined) patched.nombre = upd.patch.Nombre as string;
        if (upd.patch.PlaceHolder !== undefined) patched.placeholder = upd.patch.PlaceHolder as string;
        if (upd.patch.Requerido !== undefined) patched.requerido = Boolean(upd.patch.Requerido);
        return patched;
      });
    }
    // Append created
    if (draft?.inputs?.created?.length) {
      const created: VisibleRelacion[] = draft.inputs.created.map((c) => ({
        id_relacion: Number.MIN_SAFE_INTEGER + Math.floor(Math.random() * 1000000),
        paso_solicitud_id: paso.id_paso_solicitud,
        input_id: c.InputId,
        nombre: c.Nombre,
        placeholder: c.PlaceHolder,
        requerido: Boolean(c.Requerido),
        valor: '',
        tmpId: (c as { _tmpId?: string })._tmpId,
      }));
      list = [...list, ...created];
    }
    return list;
  }, [baseRelaciones, draft, paso.id_paso_solicitud]);

  const [listaEditable, setListaEditable] = useState<VisibleRelacion[]>(visibleRelaciones);
  const [addSelectValue, setAddSelectValue] = useState('');

  useEffect(() => {
    setListaEditable(visibleRelaciones);
  }, [visibleRelaciones]);

  const getInputIcon = (tipo?: string) => {
    const t = (tipo || '').toString().toLowerCase();
    switch (t) {
      case 'textocorto':
      case 'textolargo':
        return <FileText className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'radiogroup':
      case 'multiplecheckbox':
        return <Hash className="w-4 h-4" />;
      case 'archivo':
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const agregarInput = (inputId: number) => {
    const input = inputsDisponibles.find(i => i.id_input === inputId);
    if (!input) return;
    const countSame = listaEditable.filter(r => r.input_id === inputId).length;
    const nombre = (input.etiqueta || `Campo ${inputId}`) + (countSame > 0 ? ` ${countSame + 1}` : '');
    stageInputAdd(paso.id_paso_solicitud, {
      InputId: inputId,
      Nombre: nombre,
      PlaceHolder: input.placeholder,
      Requerido: Boolean(input.validacion?.required),
    });
    setAddSelectValue('');
  };

  const actualizarNombre = (rel: VisibleRelacion, nombre: string) => {
    setListaEditable(prev => prev.map(r => (r === rel ? { ...r, nombre } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { Nombre: nombre });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { Nombre: nombre });
  };
  const actualizarPlaceholder = (rel: VisibleRelacion, placeholder: string) => {
    setListaEditable(prev => prev.map(r => (r === rel ? { ...r, placeholder } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { PlaceHolder: placeholder });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { PlaceHolder: placeholder });
  };
  const actualizarRequerido = (rel: VisibleRelacion, requerido: boolean) => {
    setListaEditable(prev => prev.map(r => (r === rel ? { ...r, requerido } : r)));
    if (rel.tmpId) stageInputCreateUpdate(paso.id_paso_solicitud, rel.tmpId, { Requerido: requerido });
    else stageInputUpdate(paso.id_paso_solicitud, rel.id_relacion, { Requerido: requerido });
  };
  const eliminarRelacion = (rel: VisibleRelacion) => {
    setListaEditable(prev => prev.filter(r => r !== rel));
    if (rel.tmpId) stageInputDelete(paso.id_paso_solicitud, undefined, rel.tmpId);
    else stageInputDelete(paso.id_paso_solicitud, rel.id_relacion);
  };

  const parseValor = (valor: string | undefined) => {
    if (!valor) return '';
    try {
      const v = JSON.parse(valor);
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') {
        if (Array.isArray(v)) return v.join(', ');
        if ('RawValue' in v) return String((v as Record<string, unknown>)['RawValue'] ?? '');
        return JSON.stringify(v);
      }
      return String(v);
    } catch {
      return valor;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Campos del Paso</CardTitle>
        {!readOnly && (
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
                      <Badge variant="outline" className="text-xs">{normalizeTipoInput(input.tipo_input)}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {listaEditable.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay campos agregados. Usa &quot;Agregar campo…&quot; para empezar.</p>
        )}

        {listaEditable.map((rel) => {
          const meta = inputsDisponibles.find(i => i.id_input === rel.input_id);
          const tipo = normalizeTipoInput(meta?.tipo_input || 'textocorto');
          return (
            <div key={`${rel.id_relacion}-${rel.tmpId || 'x'}`} className="space-y-3 p-3 border rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInputIcon(tipo)}
                  <Badge variant="outline" className="text-xs capitalize">{tipo}</Badge>
                </div>
                {!readOnly && (
                  <Button variant="ghost" size="icon" onClick={() => eliminarRelacion(rel)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Título</Label>
                  {readOnly ? (
                    <div className="text-sm">{rel.nombre || '—'}</div>
                  ) : (
                    <InputUI value={rel.nombre || ''} onChange={(e) => actualizarNombre(rel, e.target.value)} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  {readOnly ? (
                    <div className="text-sm text-muted-foreground">{rel.placeholder || '—'}</div>
                  ) : (
                    <InputUI value={rel.placeholder || ''} onChange={(e) => actualizarPlaceholder(rel, e.target.value)} />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm">Requerido</Label>
                {readOnly ? (
                  <Badge variant="outline" className="text-xs">{rel.requerido ? 'Sí' : 'No'}</Badge>
                ) : (
                  <Checkbox checked={!!rel.requerido} onCheckedChange={(v) => actualizarRequerido(rel, Boolean(v))} />
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Valor inicial</Label>
                <div className="text-sm text-muted-foreground">
                  {parseValor(rel.valor)}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
