import React, { useState } from 'react';
import { Input as InputType, TipoInput } from '@/types/bpm/inputs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload, X, FileText, CheckSquare, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { uploadToGoFile, getStoredGoFileFolderId, storeGoFileFolderId } from '@/services/gofile';
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
  // Normaliza valores de tipo_input provenientes de distintas fuentes (API, estáticos, etc.)
  const normalizeTipoInput = (t: string): TipoInput => {
    const s = (t || '').toString().trim().toLowerCase().replace(/[\s_-]/g, '');
    switch (s) {
      case 'textocorto':
      case 'shorttext':
      case 'texto':
      case 'inputtext':
        return 'textocorto';
      case 'textolargo':
      case 'textarea':
      case 'longtext':
        return 'textolargo';
      case 'combobox':
      case 'select':
      case 'dropdown':
        return 'combobox';
      case 'multiplecheckbox':
      case 'checkboxes':
      case 'multicheckbox':
      case 'multiopcion':
        return 'multiplecheckbox';
      case 'date':
      case 'fecha':
      case 'datetime':
        return 'date';
      case 'number':
      case 'numeric':
      case 'numero':
        return 'number';
      case 'archivo':
      case 'file':
      case 'upload':
        return 'archivo';
      default:
        return 'textocorto';
    }
  };

  const tipo = normalizeTipoInput(input.tipo_input as unknown as string);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    valor && tipo === 'date' ? new Date(valor) : undefined
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    valor && tipo === 'multiplecheckbox' ? JSON.parse(valor || '[]') : []
  );

  const handleValueChange = (newValue: string) => {
    onChange(newValue, requerido);
  };

  const handleRequiredToggle = () => {
    onChange(valor, !requerido);
  };

  const handleDateSelect = (date: Date | { from?: Date; to?: Date } | undefined) => {
    // Calendar component may return a Date or a range object; we only need a single date
    let chosen: Date | undefined;
    if (!date) chosen = undefined;
    else if (date instanceof Date) chosen = date;
    else chosen = (date as { from?: Date }).from;

    setSelectedDate(chosen);
    handleValueChange(chosen ? chosen.toISOString() : '');
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
    switch (tipo) {
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

  case 'radiogroup':
        return (
          <RadioGroup value={valor} onValueChange={handleValueChange} className="space-y-2">
            {input.opciones?.map((opcion) => (
              <div key={opcion} className="flex items-center space-x-2">
                <RadioGroupItem value={opcion} id={`${input.id_input}-rg-${opcion}`} />
                <Label htmlFor={`${input.id_input}-rg-${opcion}`} className="text-sm cursor-pointer">{opcion}</Label>
              </div>
            ))}
          </RadioGroup>
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
          <ArchivoUpload
            currentValue={valor}
            onValueChange={handleValueChange}
            requerido={requerido}
          />
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
  case 'radiogroup': return <CheckSquare className="w-4 h-4" />;
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
          {getInputIcon(tipo)}
          <Label className="font-medium text-foreground">
            {input.etiqueta || `Campo ${tipo}`}
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
              variant="outline"
              onClick={onRemove}
              className="border-destructive text-destructive hover:bg-destructive hover:text-white"
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

// --- Archivo Upload Subcomponent ---
interface ArchivoUploadProps {
  currentValue: string;
  onValueChange: (v: string) => void;
  requerido: boolean;
}

const ArchivoUpload: React.FC<ArchivoUploadProps> = ({ currentValue, onValueChange, requerido }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMeta, setSuccessMeta] = useState<{ name: string; link?: string } | null>(null);

  // Access vite env safely
  const envObj = (import.meta as unknown as { env?: Record<string, string> })?.env || {};
  const token: string | undefined = envObj.VITE_GOFILE_TOKEN || undefined;
  const fixedFolderId: string | undefined = envObj.VITE_GOFILE_DEFAULT_FOLDER_ID || undefined;
  // One-time console diagnostic (dev only) to confirm env usage
  if (import.meta.env?.DEV && (fixedFolderId || token)) {
    // Avoid spamming: attach a symbol to window
    const w = window as unknown as { __gofileEnvLogged?: boolean };
    if (!w.__gofileEnvLogged) {
      w.__gofileEnvLogged = true;
      console.info('[GoFile] Using env config', { hasToken: !!token, fixedFolderId });
    }
  }

  const humanName = (() => {
    if (!currentValue) return '';
    try {
      const obj = JSON.parse(currentValue);
      return obj.fileName || obj.name || obj.fileId || 'Archivo';
    } catch { return currentValue; }
  })();

  const startUpload = async (file: File) => {
    setUploading(true); setProgress(0); setError(null); setSuccessMeta(null);
    // If a fixed folder is configured via env, we always target that and skip localStorage logic
    const storedFolder = fixedFolderId ? null : getStoredGoFileFolderId();
    const effectiveFolder = fixedFolderId || storedFolder || undefined;
    const res = await uploadToGoFile({ file, token, folderId: effectiveFolder, onProgress: (p) => setProgress(p) });
    if (res.ok) {
      if (!fixedFolderId && res.folderId && !storedFolder) storeGoFileFolderId(res.folderId);
      const payload = JSON.stringify({ provider: 'gofile', fileId: res.fileId, fileName: res.fileName, directLink: res.directLink, folderId: fixedFolderId || res.folderId });
      onValueChange(payload);
      setSuccessMeta({ name: res.fileName || file.name, link: res.directLink });
    } else {
      setError(res.error || 'Error subiendo archivo');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center relative">
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          {uploading ? 'Subiendo...' : 'Arrastra o selecciona un archivo'}
          {requerido && <span className="text-red-500 ml-1">*</span>}
        </p>
        <Input
          type="file"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) startUpload(file);
          }}
          className="mt-2 cursor-pointer"
          accept="*/*"
        />
        {uploading && (
          <div className="mt-3 flex flex-col items-center gap-1">
            <div className="w-full h-2 bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: progress + '%' }} />
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> {progress}%
            </span>
          </div>
        )}
      </div>
      {currentValue && !uploading && !error && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <FileText className="w-4 h-4" />
          <span className="text-sm flex-1 truncate" title={humanName}>{humanName}</span>
          {successMeta?.link && (
            <a href={successMeta.link} target="_blank" rel="noopener noreferrer" className="text-xs underline text-primary">Ver</a>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
            onClick={() => { onValueChange(''); setSuccessMeta(null); setError(null); }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" /> {error}
        </div>
      )}
      {successMeta && !error && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" /> Archivo subido
        </div>
      )}
      {!token && (
        <div className="text-[10px] text-amber-600">Comprime tus archivos para minimizar el tamaño de la carga.</div>
      )}
    </div>
  );
};