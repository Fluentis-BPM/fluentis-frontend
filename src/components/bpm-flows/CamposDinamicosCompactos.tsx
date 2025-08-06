import React, { useState } from 'react';
import { CamposDinamicos, INPUT_TEMPLATES } from '@/types/inputs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Trash2,
  Type,
  Hash,
  Mail,
  Calendar,
  Clock,
  ToggleLeft,
  List,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  camposDinamicos: CamposDinamicos;
  onChange: (campos: CamposDinamicos) => void;
}

const getIconForInputType = (tipo: string) => {
  switch (tipo) {
    case 'textocorto': return <Type className="w-4 h-4" />;
    case 'textolargo': return <FileText className="w-4 h-4" />;
    case 'number': return <Hash className="w-4 h-4" />;
    case 'date': return <Calendar className="w-4 h-4" />;
    case 'combobox': return <List className="w-4 h-4" />;
    case 'multiplecheckbox': return <ToggleLeft className="w-4 h-4" />;
    case 'archivo': return <FileText className="w-4 h-4" />;
    default: return <Type className="w-4 h-4" />;
  }
};

export const CamposDinamicosCompactos: React.FC<Props> = ({ camposDinamicos, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputSeleccionado, setInputSeleccionado] = useState<string>('');

  const camposActivos = Object.keys(camposDinamicos).map(id => parseInt(id));

  const agregarCampo = () => {
    if (!inputSeleccionado) return;

    const inputId = parseInt(inputSeleccionado);
    const nuevaRelacion = {
      valor: '',
      requerido: false
    };

    onChange({
      ...camposDinamicos,
      [inputId]: nuevaRelacion
    });

    setInputSeleccionado('');
  };

  const actualizarCampo = (inputId: number, valor: string, requerido: boolean) => {
    onChange({
      ...camposDinamicos,
      [inputId]: { valor, requerido }
    });
  };

  const eliminarCampo = (inputId: number) => {
    const nuevosCampos = { ...camposDinamicos };
    delete nuevosCampos[inputId];
    onChange(nuevosCampos);
  };

  const camposDisponibles = INPUT_TEMPLATES.filter(
    input => !camposDinamicos[input.id_input]
  );

  return (
    <Card className="border-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Campos del Paso
                <Badge variant="secondary" className="text-xs">
                  {camposActivos.length}
                </Badge>
              </CardTitle>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Agregar nuevo campo */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2">
                <Select value={inputSeleccionado} onValueChange={setInputSeleccionado}>
                  <SelectTrigger className="flex-1 text-xs">
                    <SelectValue placeholder="Seleccionar tipo de campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {camposDisponibles.map((input) => (
                      <SelectItem key={input.id_input} value={input.id_input.toString()}>
                        <div className="flex items-center gap-2">
                          {getIconForInputType(input.tipo_input)}
                          <span className="text-xs">{input.etiqueta}</span>
                          <Badge variant="outline" className="text-xs">
                            {input.tipo_input}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  onClick={agregarCampo}
                  disabled={!inputSeleccionado}
                  className="h-8 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Campos existentes */}
            {camposActivos.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">No hay campos configurados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {camposActivos.map((inputId) => {
                  const input = INPUT_TEMPLATES.find(i => i.id_input === inputId);
                  const campo = camposDinamicos[inputId];
                  
                  if (!input || !campo) return null;

                  return (
                    <div key={inputId} className="p-2 border rounded-lg bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getIconForInputType(input.tipo_input)}
                          <span className="text-xs font-medium">{input.etiqueta}</span>
                          <Badge variant="outline" className="text-xs">
                            {input.tipo_input}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarCampo(inputId)}
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {/* Campo de valor según tipo */}
                        {input.tipo_input === 'textolargo' ? (
                          <Textarea
                            value={campo.valor}
                            onChange={(e) => actualizarCampo(inputId, e.target.value, campo.requerido)}
                            placeholder={input.placeholder || "Valor por defecto"}
                            className="text-xs min-h-[60px]"
                          />
                        ) : input.tipo_input === 'combobox' && input.opciones ? (
                          <Select
                            value={campo.valor}
                            onValueChange={(value) => actualizarCampo(inputId, value, campo.requerido)}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Seleccionar opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {input.opciones.map((opcion) => (
                                <SelectItem key={opcion} value={opcion} className="text-xs">
                                  {opcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={input.tipo_input === 'number' ? 'number' : 
                                  input.tipo_input === 'date' ? 'date' : 'text'}
                            value={campo.valor}
                            onChange={(e) => actualizarCampo(inputId, e.target.value, campo.requerido)}
                            placeholder={input.placeholder || "Valor por defecto"}
                            className="text-xs"
                          />
                        )}

                        {/* Toggle requerido */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={campo.requerido}
                            onCheckedChange={(checked) => 
                              actualizarCampo(inputId, campo.valor, checked)
                            }
                          />
                          <Label className="text-xs text-muted-foreground">Campo requerido</Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {camposActivos.length > 0 && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
                💡 Estos campos estarán disponibles durante la ejecución del paso.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};