import React, { useState } from 'react';
import { INPUT_TEMPLATES, CamposDinamicos } from '@/types/bpm/inputs';
import { CampoDinamico } from './CampoDinamico';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings } from 'lucide-react';

interface Props {
  camposDinamicos: CamposDinamicos;
  onChange: (campos: CamposDinamicos) => void;
}

export const SelectorCamposDinamicos: React.FC<Props> = ({ camposDinamicos, onChange }) => {
  const [inputSeleccionado, setInputSeleccionado] = useState<string>('');

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

  const camposActivos = Object.keys(camposDinamicos).map(id => parseInt(id));

  return (
    <Card className="shadow-soft border-request-primary/20">
      <CardHeader className="bg-gradient-card">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Campos Dinámicos
          <Badge variant="secondary" className="ml-auto">
            {camposActivos.length} campo{camposActivos.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Selector para agregar campos */}
        <div className="flex gap-2">
          <Select value={inputSeleccionado} onValueChange={setInputSeleccionado}>
            <SelectTrigger className="flex-1 transition-smooth focus:ring-request-primary/50">
              <SelectValue placeholder="Selecciona un tipo de campo" />
            </SelectTrigger>
            <SelectContent>
              {camposDisponibles.map((input) => (
                <SelectItem key={input.id_input} value={input.id_input.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {input.tipo_input}
                    </Badge>
                    {input.etiqueta}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={agregarCampo}
            disabled={!inputSeleccionado}
            variant="gradient"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Campos dinámicos activos */}
        {camposActivos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay campos dinámicos configurados</p>
            <p className="text-sm">Agrega campos para personalizar la información de la solicitud</p>
          </div>
        ) : (
          <div className="space-y-4">
            {camposActivos.map((inputId) => {
              const input = INPUT_TEMPLATES.find(i => i.id_input === inputId);
              const campo = camposDinamicos[inputId];
              
              if (!input || !campo) return null;

              return (
                <CampoDinamico
                  key={inputId}
                  input={input}
                  valor={campo.valor}
                  requerido={campo.requerido}
                  onChange={(valor, requerido) => actualizarCampo(inputId, valor, requerido)}
                  onRemove={() => eliminarCampo(inputId)}
                  showRequiredToggle={true}
                />
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        {camposActivos.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Los campos marcados como &quot;Requerido&quot; serán obligatorios para completar la solicitud.
              Puedes reordenar o eliminar campos usando los controles de cada campo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};