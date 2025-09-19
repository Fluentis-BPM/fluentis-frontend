import api from './api';
import type { ApiInputCatalogItem } from '@/types/bpm/templates';

export const fetchInputsCatalog = async (): Promise<ApiInputCatalogItem[]> => {
  const { data } = await api.get('/api/inputs');
  const arr: unknown[] = Array.isArray(data) ? data : [];
  return arr.map((raw) => {
    const obj = raw as Record<string, unknown>;
    const idInput = (obj['idInput'] ?? obj['IdInput'] ?? obj['id_input']) as number;
    const tipoRaw = (obj['tipoInput'] ?? obj['TipoInput'] ?? obj['tipo_input'] ?? 'textocorto') as string;
    const esJson = Boolean(obj['esJson'] ?? obj['EsJson'] ?? obj['es_json'] ?? false);
    return { idInput, tipoInput: String(tipoRaw), esJson };
  });
};

