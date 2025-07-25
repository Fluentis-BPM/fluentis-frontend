import React, { useState, useEffect } from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { RelacionInput, Input } from '@/types/bpm/inputs';
import { Button } from '@/components/ui/button';
import { Input as InputUI } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, FileText, Calendar, Hash } from 'lucide-react';

interface EditorPasoEjecucionProps {
  paso: PasoSolicitud;
  onUpdatePaso: (paso: PasoSolicitud) => void;
  onMarcarCompletado: () => void;
  relacionesInput?: RelacionInput[];
  inputsDisponibles?: Input[];
}

export const EditorPasoEjecucion: React.FC<EditorPasoEjecucionProps> = ({
  paso,
  onUpdatePaso,
  onMarcarCompletado,
  relacionesInput = [],
  inputsDisponibles = []
}) => {
  const [datosDinamicos, setDatosDinamicos] = useState<Record<number, string>>({});
  const [inputsAdicionales, setInputsAdicionales] = useState<RelacionInput[]>([]);

  // Cargar datos existentes
  useEffect(() => {
    const datosActuales: Record<number, string> = {};
    relacionesInput.forEach(relacion => {
      if (relacion.paso_solicitud_id === paso.id_paso_solicitud) {
        datosActuales[relacion.input_id] = relacion.valor;
      }
    });
    setDatosDinamicos(datosActuales);
  }, [relacionesInput, paso.id_paso_solicitud]);

  const agregarInput = (inputId: number) => {
    const input = inputsDisponibles.find(i => i.id_input === inputId);
    if (input) {
      const nuevaRelacion: RelacionInput = {
        id_relacion: Date.now(),
        input_id: inputId,
        paso_solicitud_id: paso.id_paso_solicitud,
        valor: '',
        requerido: false,
        input
      };
      setInputsAdicionales([...inputsAdicionales, nuevaRelacion]);
    }
  };

  const actualizarValor = (inputId: number, valor: string) => {
    setDatosDinamicos(prev => ({
      ...prev,
      [inputId]: valor
    }));
  };

  const guardarDatos = () => {
    // Actualizar el paso con los nuevos datos
    const pasoActualizado: PasoSolicitud = {
      ...paso,
      campos_dinamicos: datosDinamicos
    };
    onUpdatePaso(pasoActualizado);
  };

  const marcarComoCompletado = () => {
    guardarDatos();
    onMarcarCompletado();
  };

  const renderInput = (relacion: RelacionInput) => {
    const input = relacion.input || inputsDisponibles.find(i => i.id_input === relacion.input_id);
    if (!input) return null;

    const valor = datosDinamicos[relacion.input_id] || relacion.valor || '';

    switch (input.tipo_input) {
      case 'textocorto':
        return (
          <InputUI
            value={valor}
            onChange={(e) => actualizarValor(relacion.input_id, e.target.value)}
            placeholder={input.placeholder}
            className="w-full"
          />
        );

      case 'textolargo':
        return (
          <Textarea
            value={valor}
            onChange={(e) => actualizarValor(relacion.input_id, e.target.value)}
            placeholder={input.placeholder}
            rows={3}
            className="w-full"
          />
        );

      case 'combobox':
        return (
          <Select value={valor} onValueChange={(value) => actualizarValor(relacion.input_id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar opción..." />
            </SelectTrigger>
            <SelectContent>
              {input.opciones?.map((opcion, index) => (
                <SelectItem key={index} value={opcion}>
                  {opcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <InputUI
            type="number"
            value={valor}
            onChange={(e) => actualizarValor(relacion.input_id, e.target.value)}
            placeholder={input.placeholder}
            min={input.validacion?.min}
            max={input.validacion?.max}
          />
        );

      case 'date':
        return (
          <InputUI
            type="date"
            value={valor}
            onChange={(e) => actualizarValor(relacion.input_id, e.target.value)}
          />
        );

      case 'multiplecheckbox':
        const valoresSeleccionados = valor ? valor.split(',') : [];
        return (
          <div className="space-y-2">
            {input.opciones?.map((opcion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${relacion.input_id}-${index}`}
                  checked={valoresSeleccionados.includes(opcion)}
                  onCheckedChange={(checked) => {
                    let nuevosValores = [...valoresSeleccionados];
                    if (checked) {
                      nuevosValores.push(opcion);
                    } else {
                      nuevosValores = nuevosValores.filter(v => v !== opcion);
                    }
                    actualizarValor(relacion.input_id, nuevosValores.join(','));
                  }}
                />
                <Label htmlFor={`${relacion.input_id}-${index}`}>{opcion}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <InputUI
            value={valor}
            onChange={(e) => actualizarValor(relacion.input_id, e.target.value)}
            placeholder="Valor del campo"
          />
        );
    }
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
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const todasLasRelaciones = [...relacionesInput.filter(r => r.paso_solicitud_id === paso.id_paso_solicitud), ...inputsAdicionales];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paso de Ejecución
          </h3>
          <p className="text-sm text-muted-foreground">
            Ingresa los datos requeridos para completar este paso
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Ejecución
        </Badge>
      </div>

      {/* Campos dinámicos existentes */}
      {todasLasRelaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del Paso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todasLasRelaciones.map((relacion) => {
              const input = relacion.input || inputsDisponibles.find(i => i.id_input === relacion.input_id);
              return (
                <div key={relacion.id_relacion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      {getInputIcon(input?.tipo_input || 'textocorto')}
                      {input?.etiqueta || `Campo ${relacion.input_id}`}
                      {relacion.requerido && <span className="text-red-500">*</span>}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {input?.tipo_input || 'texto'}
                    </Badge>
                  </div>
                  {input?.descripcion && (
                    <p className="text-xs text-muted-foreground">{input.descripcion}</p>
                  )}
                  {renderInput(relacion)}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Agregar nuevos campos */}
      {inputsDisponibles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agregar Datos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => agregarInput(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar campo para agregar..." />
              </SelectTrigger>
              <SelectContent>
                {inputsDisponibles
                  .filter(input => !todasLasRelaciones.some(r => r.input_id === input.id_input))
                  .map((input) => (
                    <SelectItem key={input.id_input} value={input.id_input.toString()}>
                      <div className="flex items-center gap-2">
                        {getInputIcon(input.tipo_input)}
                        <span>{input.etiqueta || `Campo ${input.id_input}`}</span>
                        <Badge variant="outline" className="text-xs">
                          {input.tipo_input}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Información del paso */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado: {paso.estado}</p>
              <p className="text-sm text-muted-foreground">
                Responsable ID: {paso.responsable_id || 'No asignado'}
              </p>
            </div>
            <Badge variant={
              paso.estado === 'completado' ? 'default' :
              paso.estado === 'pendiente' ? 'secondary' : 'outline'
            }>
              {paso.estado}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button onClick={guardarDatos} variant="outline" className="flex-1">
          Guardar Datos
        </Button>
        <Button onClick={marcarComoCompletado} className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          Marcar como Completado
        </Button>
      </div>
    </div>
  );
};