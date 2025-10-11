import React from 'react';
import { RelacionInput } from '@/types/bpm/inputs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EditorCamposDinamicosProps {
  camposDinamicos: RelacionInput[];
  erroresValidacion: string[];
  onCambioCampo: (inputId: number, valor: string) => void;
  onToggleRequerido: (inputId: number, requerido: boolean) => void;
  esInicial: boolean;
}

export const EditorCamposDinamicos: React.FC<EditorCamposDinamicosProps> = ({
  camposDinamicos,
  erroresValidacion,
  onCambioCampo,
  onToggleRequerido,
  esInicial
}) => {
  if (!esInicial) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Los campos dinámicos solo están disponibles en el paso inicial</p>
        <p className="text-sm">Este paso hereda los datos procesados del flujo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con información */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-primary">Campos Dinámicos de la Solicitud</h3>
            <p className="text-sm text-muted-foreground">
              Edita los campos dinámicos heredados de la solicitud original
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {camposDinamicos.length} campos
        </Badge>
      </div>

      {/* Alertas de validación */}
      {erroresValidacion.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Errores de validación</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {erroresValidacion.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de campos dinámicos */}
      <div className="space-y-4">
        {camposDinamicos.length > 0 ? (
          camposDinamicos.map((campo) => (
            <div key={campo.input_id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Label className="font-medium">
                    {campo.input?.etiqueta || `Campo ${campo.input_id}`}
                  </Label>
                  {campo.input?.descripcion && (
                    <p className="text-xs text-muted-foreground">
                      {campo.input.descripcion}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`requerido-${campo.input_id}`}
                      checked={campo.requerido}
                      onCheckedChange={(checked) => onToggleRequerido(campo.input_id, checked)}
                    />
                    <Label htmlFor={`requerido-${campo.input_id}`} className="text-xs">
                      Requerido
                    </Label>
                  </div>
                  <Badge variant={campo.requerido ? "default" : "outline"} className="text-xs">
                    {campo.input?.tipo_input || 'texto'}
                  </Badge>
                </div>
              </div>
              
              {/* Input según el tipo */}
              {campo.input?.tipo_input === 'textolargo' ? (
                <Textarea
                  value={campo.valor}
                  onChange={(e) => onCambioCampo(campo.input_id, e.target.value)}
                  placeholder={campo.input?.placeholder || 'Ingrese el valor...'}
                  className={campo.requerido && !campo.valor ? 'border-destructive' : ''}
                  rows={3}
                />
              ) : campo.input?.tipo_input === 'combobox' ? (
                <Select
                  value={campo.valor}
                  onValueChange={(value) => onCambioCampo(campo.input_id, value)}
                >
                  <SelectTrigger className={campo.requerido && !campo.valor ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccione una opción..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campo.input?.opciones?.map((opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {opcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : campo.input?.tipo_input === 'number' ? (
                <Input
                  type="number"
                  value={campo.valor}
                  onChange={(e) => onCambioCampo(campo.input_id, e.target.value)}
                  placeholder={campo.input?.placeholder || '0'}
                  className={campo.requerido && !campo.valor ? 'border-destructive' : ''}
                  min={campo.input?.validacion?.min}
                  max={campo.input?.validacion?.max}
                />
              ) : campo.input?.tipo_input === 'date' ? (
                <Input
                  type="date"
                  value={campo.valor}
                  onChange={(e) => onCambioCampo(campo.input_id, e.target.value)}
                  className={campo.requerido && !campo.valor ? 'border-destructive' : ''}
                />
              ) : (
                <Input
                  value={campo.valor}
                  onChange={(e) => onCambioCampo(campo.input_id, e.target.value)}
                  placeholder={campo.input?.placeholder || 'Ingrese el valor...'}
                  className={campo.requerido && !campo.valor ? 'border-destructive' : ''}
                  maxLength={campo.input?.validacion?.max}
                />
              )}
              
              {/* Indicadores de validación */}
              {campo.input?.validacion && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {campo.input.validacion.min && (
                    <span>Mín: {campo.input.validacion.min}</span>
                  )}
                  {campo.input.validacion.max && (
                    <span>Máx: {campo.input.validacion.max}</span>
                  )}
                  {campo.input.validacion.required && (
                    <span className="text-destructive">* Requerido</span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay campos dinámicos en este paso inicial</p>
            <p className="text-sm">Los campos se heredan de la solicitud original</p>
          </div>
        )}
      </div>

      {/* Resumen de validación */}
      {camposDinamicos.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {erroresValidacion.length === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Todos los campos son válidos</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {erroresValidacion.length} error(es) de validación
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {camposDinamicos.filter(c => c.requerido).length} campos requeridos
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
