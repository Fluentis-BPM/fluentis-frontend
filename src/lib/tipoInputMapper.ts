import { TipoInput, normalizeTipoInput } from '@/types/bpm/inputs';

// Mapa oficial Front -> API (PascalCase)
const frontToApi: Record<TipoInput, string> = {
  textocorto: 'TextoCorto',
  textolargo: 'TextoLargo',
  combobox: 'Combobox',
  multiplecheckbox: 'MultipleCheckbox',
  radiogroup: 'RadioGroup',
  date: 'Date',
  number: 'Number',
  archivo: 'Archivo'
};

// Mapa inverso API -> Front
const apiToFront = Object.entries(frontToApi).reduce<Record<string, TipoInput>>((acc, [front, api]) => {
  acc[api.toLowerCase()] = front as TipoInput;
  return acc;
}, {});

export function toApiTipoInput(t: string | TipoInput): string {
  const normalized = normalizeTipoInput(String(t)) as TipoInput;
  return frontToApi[normalized];
}

export function fromApiTipoInput(apiValue: string): TipoInput {
  const key = apiValue.toLowerCase();
  return apiToFront[key] ?? normalizeTipoInput(apiValue);
}

// Parsear valor según tipo para UI consistente
export function coerceValor(tipo: TipoInput, raw: string | null | undefined): unknown {
  if (raw == null) return null;
  switch (tipo) {
    case 'number':
      return raw === '' ? null : (isNaN(Number(raw)) ? raw : Number(raw));
    case 'date':
      return raw ? new Date(raw) : null;
    case 'multiplecheckbox':
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    case 'archivo':
      try {
        return JSON.parse(raw);
      } catch {
        return { fileName: raw };
      }
    default:
      return raw;
  }
}

// Preparar valor para enviar a API (inverso de coerceValor)
export function serializeValor(tipo: TipoInput, value: unknown): string | null {
  if (value == null) return null;
  switch (tipo) {
    case 'number':
      return String(value);
    case 'date':
      return value instanceof Date ? value.toISOString() : String(value);
    case 'multiplecheckbox':
    case 'archivo':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}
