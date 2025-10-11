import api from './api';
import type { ApiInputCatalogItem } from '@/types/bpm/templates';
import { normalizeTipoInput } from '@/types/bpm/inputs';

const FRIENDLY_LABEL: Record<string, string> = {
  textocorto: 'Texto corto',
  textolargo: 'Texto largo',
  combobox: 'Lista desplegable',
  multiplecheckbox: 'Selección múltiple',
  radiogroup: 'Selección única (radio)',
  date: 'Fecha/Hora',
  number: 'Número',
  archivo: 'Archivo'
};

export const fetchInputsCatalog = async (): Promise<ApiInputCatalogItem[]> => {
  const { data } = await api.get('/api/inputs');
  const arr: unknown[] = Array.isArray(data) ? data : [];
  const mapped: ApiInputCatalogItem[] = arr.map((raw) => {
    const obj = raw as Record<string, unknown>;
    const idInput = Number(obj['idInput'] ?? obj['IdInput'] ?? obj['id_input'] ?? 0);
    const tipoRaw = String(obj['tipoInput'] ?? obj['TipoInput'] ?? obj['tipo_input'] ?? 'textocorto');
    const esJson = Boolean(obj['esJson'] ?? obj['EsJson'] ?? obj['es_json'] ?? false);
    return { idInput, tipoInput: tipoRaw, esJson };
  });

  // Deduplicar por tipo normalizado (primer id encontrado permanece)
  const seen = new Set<string>();
  const dedup: ApiInputCatalogItem[] = [];
  for (const item of mapped.sort((a, b) => a.idInput - b.idInput)) {
    const norm = normalizeTipoInput(item.tipoInput);
    if (!seen.has(norm)) {
      seen.add(norm);
      dedup.push({ ...item, tipoInput: norm, label: FRIENDLY_LABEL[norm] || norm });
    }
  }
  return dedup;
};

