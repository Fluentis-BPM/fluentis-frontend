import React, { useState } from 'react';
import { Input as InputType, TipoInput } from '@/types/bpm/inputs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload, X, FileText, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  input: InputType;
  valor: string;
  requerido: boolean;
  onChange: (valor: string, requerido: boolean) => void;
  onRemove?: () => void;
  showRequiredToggle?: boolean;
}

export const CampoDinamico: React.FC<Props> = ({ 
  input, 
  valor, 
  requerido, 
  onChange, 
  onRemove,
  showRequiredToggle = true 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    valor && input.tipo_input === 'date' ? new Date(valor) : undefined
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    valor && input.tipo_input === 'multiplecheckbox' ? JSON.parse(valor || '[]') : []
  );

  const handleValueChange = (newValue: string) => {
    onChange(newValue, requerido);
  };

  const handleRequiredToggle = () => {
    onChange(valor, !requerido);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    handleValueChange(date ? date.toISOString() : '');
  };

  const handleMultipleCheckboxChange = (option: string, checked: boolean) => {
    let newSelected = [...selectedOptions];
    
    if (checked) {
      newSelected.push(option);
    } else {
      newSelected = newSelected.filter(item => item !== option);
    }
    
    setSelectedOptions(newSelected);
    handleValueChange(JSON.stringify(newSelected));
  };

  const renderInput = () => {
    switch (input.tipo_input) {
      case 'textocorto':
        return (
          <Input
            value={valor}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={input.placeholder}
            maxLength={input.validacion?.max}
            required={requerido}
            className="transition-smooth focus:ring-request-primary/50"
          />
        );

      case 'textolargo':
        return (
          <Textarea
            value={valor}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={input.placeholder}
            maxLength={input.validacion?.max}
            required={requerido}
            rows={4}
            className="transition-smooth focus:ring-request-primary/50"
          />
        );

      case 'combobox':
        return (
          <Select value={valor} onValueChange={handleValueChange}>
            <SelectTrigger className="transition-smooth focus:ring-request-primary/50">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {input.opciones?.map((opcion) => (
                <SelectItem key={opcion} value={opcion}>
                  {opcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={valor}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={input.placeholder}
            min={input.validacion?.min}
            max={input.validacion?.max}
            required={requerido}
            className="transition-smooth focus:ring-request-primary/50"
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal transition-smooth",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccione una fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        );

      case 'multiplecheckbox':
        return (
          <div className="space-y-3">
            {input.opciones?.map((opcion) => (
              <div key={opcion} className="flex items-center space-x-2">
                <Checkbox
                  id={`${input.id_input}-${opcion}`}
                  checked={selectedOptions.includes(opcion)}
                  onCheckedChange={(checked) => 
                    handleMultipleCheckboxChange(opcion, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`${input.id_input}-${opcion}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {opcion}
                </Label>
              </div>
            ))}
            {selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedOptions.map((opcion) => (
                  <Badge key={opcion} variant="secondary" className="text-xs">
                    {opcion}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'archivo':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleValueChange(file ? file.name : '');
                }}
                className="mt-2 cursor-pointer"
                accept="*/*"
              />
            </div>
            {valor && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileText className="w-4 h-4" />
                <span className="text-sm flex-1">{valor}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleValueChange('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={valor}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={input.placeholder}
            className="transition-smooth focus:ring-request-primary/50"
          />
        );
    }
  };

  const getInputIcon = (tipo: TipoInput) => {
    switch (tipo) {
      case 'textocorto': return <FileText className="w-4 h-4" />;
      case 'textolargo': return <FileText className="w-4 h-4" />;
      case 'combobox': return <CheckSquare className="w-4 h-4" />;
      case 'multiplecheckbox': return <CheckSquare className="w-4 h-4" />;
      case 'date': return <CalendarIcon className="w-4 h-4" />;
      case 'number': return <FileText className="w-4 h-4" />;
      case 'archivo': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gradient-card shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getInputIcon(input.tipo_input)}
          <Label className="font-medium text-foreground">
            {input.etiqueta || `Campo ${input.tipo_input}`}
            {requerido && <span className="text-request-danger ml-1">*</span>}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {showRequiredToggle && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`required-${input.id_input}`}
                checked={requerido}
                onCheckedChange={handleRequiredToggle}
              />
              <Label 
                htmlFor={`required-${input.id_input}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Requerido
              </Label>
            </div>
          )}
          
          {onRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {input.descripcion && (
        <p className="text-xs text-muted-foreground">{input.descripcion}</p>
      )}

      <div className="space-y-2">
        {renderInput()}
        
        {input.validacion && (
          <div className="text-xs text-muted-foreground">
            {input.validacion.min && `Mín: ${input.validacion.min}`}
            {input.validacion.max && ` Máx: ${input.validacion.max}`}
            {input.validacion.pattern && ` Patrón: ${input.validacion.pattern}`}
          </div>
        )}
      </div>
    </div>
  );
};