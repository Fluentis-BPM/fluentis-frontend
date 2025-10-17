import React, { useEffect, useState, useCallback } from 'react';
// Using a simple internal overlay container. Replace with project Drawer/Dialog if available.
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePasoExecution } from '@/hooks/bpm/usePasoExecution';
import { flushPasoDrafts, entregarPaso } from '@/store/bpm/executionInputsSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { RefreshCw, Save, CheckCircle2, TriangleAlert } from 'lucide-react';
import { CampoDinamico } from '@/components/bpm/requests/CampoDinamico';
import { normalizeTipoInput } from '@/types/bpm/inputs';
import type { Input as InputType } from '@/types/bpm/inputs';

interface PasoExecutionDrawerProps {
  pasoId: number | null;
  open: boolean;
  onClose: () => void;
  pasoNombre?: string;
  usuarioId?: number; // backwards compat, not used here
  onExecuted?: () => void; // notify parent to refresh list
}

// Simple fallback if Drawer not present
const FallbackContainer: React.FC<{ children: React.ReactNode; open: boolean }> = ({ children, open }) => {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end"><div className="w-full max-w-xl h-full bg-background shadow-xl border-l p-4 flex flex-col">{children}</div></div>;
};

export const PasoExecutionDrawer: React.FC<PasoExecutionDrawerProps> = ({ pasoId, open, onClose, pasoNombre, usuarioId: _usuarioId, onExecuted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { state, load, updateDraft, flush, canExecute } = usePasoExecution(pasoId || 0);

  // Initial load
  useEffect(() => {
    if (open && pasoId) {
      console.log('[PasoExecutionDrawer] Cargando relaciones para paso', pasoId);
      load();
    }
  }, [open, pasoId, load]);

  const relations = state?.relations ? Object.values(state.relations) : [];

  const handleExecute = useCallback(async () => {
    if (!pasoId) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      // Force flush all dirty drafts
      await dispatch(flushPasoDrafts({ pasoId })).unwrap().catch(() => { /* error handled below */ });
      // Re-evaluate canExecute after flush (state selector already updated)
      if (!canExecute) {
        setError('Campos requeridos incompletos o errores de validación.');
        setSubmitting(false);
        return;
      }
      // Deliver the step via API (estado: entregado). Backend will advance flow.
  await dispatch(entregarPaso({ pasoId })).unwrap();
  setMessage('Paso entregado correctamente');
  // Notify parent to refresh list
  try { onExecuted?.(); } catch { /* no-op */ }
      setTimeout(() => { onClose(); }, 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }, [pasoId, dispatch, onClose, canExecute]);

  const content = (
    <div className="flex flex-col h-full" role="dialog" aria-labelledby="exec-title" aria-modal="true">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 id="exec-title" className="text-lg font-semibold">Ejecución Paso{pasoNombre ? `: ${pasoNombre}` : ''}</h2>
          <p className="text-xs text-muted-foreground">Complete los campos requeridos antes de ejecutar.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        {state?.loading && relations.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" /> Cargando campos...</div>
        )}
        <div className="space-y-4">
          {relations.map(rel => {
            const draft = state?.drafts[rel.id];
            let current = draft?.rawValue ?? rel.valor ?? '';
            const errorMsg = draft?.error;
            // Infer tipo
            const tipoInferido = rel.tipo_input ? normalizeTipoInput(rel.tipo_input) : 'textocorto';
            // For multiplecheckbox ensure current is JSON array string
            if (tipoInferido === 'multiplecheckbox') {
              try {
                if (Array.isArray(JSON.parse(current))) {
                  // ok
                } else {
                  current = '[]';
                }
              } catch { current = '[]'; }
            }
            // Archivo: ensure object stored as JSON
            if (tipoInferido === 'archivo') {
              if (current && current.trim()) {
                try { JSON.parse(current); } catch { current = ''; }
              }
            }
            const inputMeta: InputType = {
              id_input: rel.inputId || rel.id,
              etiqueta: rel.nombre || rel.placeHolder || 'Campo',
              tipo_input: tipoInferido,
              placeholder: rel.placeHolder || '',
              descripcion: '',
              opciones: rel.opciones,
              validacion: undefined,
            } as InputType;
            return (
              <div key={rel.id} className="relative" aria-invalid={!!errorMsg} aria-describedby={errorMsg ? `err-${rel.id}` : undefined}>
                <CampoDinamico
                  input={inputMeta}
                  valor={current}
                  requerido={!!rel.requerido}
                  showRequiredToggle={false}
                  onChange={(valor) => {
                    // pass tipoInput so slice validation can use it
                    // Serialize multi/archivo consistently
                    let outgoing = valor;
                    if (inputMeta.tipo_input === 'multiplecheckbox') {
                      try {
                        // valor ya llega como JSON string desde CampoDinamico
                        JSON.parse(valor);
                      } catch { outgoing = '[]'; }
                    }
                    if (inputMeta.tipo_input === 'archivo') {
                      // debe ser JSON con metadatos del archivo o vacío
                      if (outgoing && outgoing.trim()) {
                        try { JSON.parse(outgoing); } catch { outgoing = ''; }
                      }
                    }
                    updateDraft(rel.id, outgoing, inputMeta.tipo_input);
                  }}
                  // Flush on blur (optimistic single-field save)
                  // CampoDinamico doesn't expose onBlur directly; we wrap in a div and listen capture.
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  onBlur={() => {
                    if (!pasoId) return;
                    const d = state?.drafts[rel.id];
                    if (d?.dirty && !state?.flushInProgress) {
                      dispatch(flushPasoDrafts({ pasoId }));
                    }
                  }}
                />
                {draft?.dirty && !errorMsg && (
                  <span className="absolute top-2 right-3 text-[10px] text-amber-600">Modificado</span>
                )}
                {errorMsg && (
                  <p id={`err-${rel.id}`} className="mt-1 ml-1 text-xs text-red-600 flex items-center gap-1">
                    <TriangleAlert className="h-3 w-3" /> {errorMsg}
                  </p>
                )}
              </div>
            );
          })}
          {relations.length === 0 && !state?.loading && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>No se encontraron campos dinámicos para este paso.</p>
              <p className="text-xs">Si esperabas ver inputs, verifica que el backend devuelva &apos;relacionesInput&apos; para /api/PasoSolicitud/{pasoId}.</p>
            </div>
          )}
        </div>
        <div className="h-6" />
      </ScrollArea>
      <div className="border-t pt-3 mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-col text-xs text-muted-foreground">
          {state?.flushInProgress && <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Guardando...</span>}
          {message && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {message}</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={state?.flushInProgress || submitting}
            onClick={() => flush()}
          >
            <Save className="h-4 w-4 mr-1" /> Guardar
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!canExecute || submitting || state?.flushInProgress}
            onClick={handleExecute}
          >
            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Ejecutar
          </Button>
        </div>
      </div>
    </div>
  );

  return <FallbackContainer open={open}>{content}</FallbackContainer>;
};

export default PasoExecutionDrawer;