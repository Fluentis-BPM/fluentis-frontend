import React, { useEffect, useMemo, useState } from 'react';
import { CampoDinamicoCrear } from '@/types/bpm/request';
import { CampoDinamico } from './CampoDinamico';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Plus, Settings, Trash2 } from 'lucide-react';
import { fetchInputsCatalog } from '@/services/inputs';
import { normalizeTipoInput, type TipoInput, type Input as InputType } from '@/types/bpm/inputs';
import { Input as InputUI } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  camposDinamicos: CampoDinamicoCrear[];
  onChange: (campos: CampoDinamicoCrear[]) => void;
}

export const SelectorCamposDinamicos: React.FC<Props> = ({ camposDinamicos, onChange }) => {
  const [addTipo, setAddTipo] = useState<string>('');
  const [catalogByTipo, setCatalogByTipo] = useState<Record<TipoInput, { idInput: number; label: string }>>({} as Record<TipoInput, { idInput: number; label: string }>);

  // Load backend inputs catalog (deduped by tipo)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchInputsCatalog();
  const map: Record<TipoInput, { idInput: number; label: string }> = {} as Record<TipoInput, { idInput: number; label: string }>;
        for (const it of items) {
          const tipo = normalizeTipoInput(it.tipoInput) as TipoInput;
          if (!map[tipo]) map[tipo] = { idInput: it.idInput, label: it.label || tipo };
        }
        if (mounted) setCatalogByTipo(map);
      } catch {
        // silent
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tiposDisponibles = useMemo(() => Object.entries(catalogByTipo) as Array<[TipoInput, { idInput: number; label: string }]>, [catalogByTipo]);

  const agregarCampo = () => {
    if (!addTipo) return;
    const tipo = normalizeTipoInput(addTipo) as TipoInput;
    const cat = catalogByTipo[tipo];
    if (!cat) return;
    const next: CampoDinamicoCrear[] = [...(camposDinamicos || [])];
    next.push({
      input_id: cat.idInput,
      nombre: cat.label,
      valor: '',
      requerido: true,
      orden: next.length,
      // opciones se editarán en UI si aplica
    });
    onChange(next);
    setAddTipo('');
  };

  const actualizarValor = (index: number, valor: string, requerido: boolean) => {
    const next = [...camposDinamicos];
    const item = { ...next[index], valor, requerido };
    next[index] = item;
    onChange(next);
  };

  const actualizarNombre = (index: number, nombre: string) => {
    const next = [...camposDinamicos];
    next[index] = { ...next[index], nombre };
    onChange(next);
  };

  const setOpciones = (index: number, opciones: string[]) => {
    const next = [...camposDinamicos];
    next[index] = { ...next[index], opciones };
    onChange(next);
  };

  const eliminarCampo = (index: number) => {
    const next = [...camposDinamicos];
    next.splice(index, 1);
    // reindex orden
    onChange(next.map((it, i) => ({ ...it, orden: i })));
  };

  const moverArriba = (index: number) => {
    if (index <= 0) return;
    const next = [...camposDinamicos];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((it, i) => ({ ...it, orden: i })));
  };

  const moverAbajo = (index: number) => {
    const next = [...camposDinamicos];
    if (index >= next.length - 1) return;
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    onChange(next.map((it, i) => ({ ...it, orden: i })));
  };

  const buildInputMetaForRender = (item: CampoDinamicoCrear): InputType => {
    // Find tipo by reverse-lookup in catalog
    const tipo = (Object.keys(catalogByTipo) as TipoInput[]).find((t) => catalogByTipo[t]?.idInput === item.input_id) as TipoInput | undefined;
    const tipoInput = tipo || 'textocorto';
    const meta: InputType = {
      id_input: item.input_id,
      tipo_input: tipoInput,
      etiqueta: item.nombre,
      // Sanitize options for rendering components that can't accept empty values
      opciones: (item.opciones || []).filter((op) => typeof op === 'string' && op.trim() !== ''),
    };
    return meta;
  };

  return (
    <Card className="shadow-soft border-request-primary/20">
      <CardHeader className="bg-gradient-card">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Campos Dinámicos
          <Badge variant="secondary" className="ml-auto">
            {(camposDinamicos?.length || 0)} campo{(camposDinamicos?.length || 0) !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Selector para agregar campos */}
        <div className="flex gap-2">
          <Select value={addTipo} onValueChange={setAddTipo}>
            <SelectTrigger className="flex-1 transition-smooth focus:ring-request-primary/50">
              <SelectValue placeholder="Selecciona un tipo de campo" />
            </SelectTrigger>
            <SelectContent>
              {tiposDisponibles.map(([tipo, meta]) => (
                <SelectItem key={tipo} value={tipo}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{tipo}</Badge>
                    {meta.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={agregarCampo}
            disabled={!addTipo}
            variant="gradient"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Campos dinámicos activos */}
        {(camposDinamicos?.length || 0) === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay campos dinámicos configurados</p>
            <p className="text-sm">Agrega campos para personalizar la información de la solicitud</p>
          </div>
        ) : (
          <div className="space-y-4">
            {camposDinamicos.map((item, index) => {
              const inputMeta = buildInputMetaForRender(item);
              const tipo = normalizeTipoInput(inputMeta.tipo_input);
              const isOptionsType = ['combobox','multiplecheckbox','radiogroup'].includes(tipo);
              return (
                <div key={`campo-${index}`} className="space-y-3 p-3 border rounded-md">
                  {/* Meta editores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Título</Label>
                      <InputUI
                        value={item.nombre ?? ''}
                        placeholder={inputMeta.etiqueta || 'Título del campo'}
                        onChange={(e) => actualizarNombre(index, e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button size="icon" variant="outline" className="h-9 w-9" disabled={index === 0} onClick={() => moverArriba(index)} title="Mover arriba">
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-9 w-9" disabled={index === camposDinamicos.length - 1} onClick={() => moverAbajo(index)} title="Mover abajo">
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-9 w-9 border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => eliminarCampo(index)} title="Eliminar campo">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* Opciones editor toggle-less (inline) */}
                    {isOptionsType && (
                      <div className="md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Opciones</Label>
                        {(item.opciones || []).map((op, i) => (
                          <div key={`op-${i}`} className="flex items-center gap-2 mt-1">
                            <InputUI
                              value={op}
                              onChange={(e) => {
                                const next = [...(item.opciones || [])];
                                next[i] = e.target.value;
                                setOpciones(index, next);
                              }}
                            />
                            <Button size="icon" variant="ghost" onClick={() => {
                              const next = [...(item.opciones || [])];
                              next.splice(i, 1);
                              setOpciones(index, next);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const current = item.opciones || [];
                              const nextLabel = `Opción ${current.length + 1}`;
                              setOpciones(index, [...current, nextLabel]);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Agregar opción
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valor inmediato */}
                  <CampoDinamico
                    input={inputMeta}
                    valor={item.valor}
                    requerido={item.requerido}
                    onChange={(valor, requerido) => actualizarValor(index, valor, requerido)}
                    onRemove={() => eliminarCampo(index)}
                    showRequiredToggle={true}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        {(camposDinamicos?.length || 0) > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Los campos agregados son obligatorios por defecto (puedes alternar &quot;Requerido&quot;). Puedes reordenar y eliminar campos con los controles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};