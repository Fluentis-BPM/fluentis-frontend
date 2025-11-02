import { useState } from 'react';
import { postPasoDecision, postSolicitudDecision, deletePasoDecision, DecisionCreateReq } from '@/services/api';
import { toast } from '@/hooks/bpm/use-toast';
import { markRejected } from '@/hooks/bpm/optimisticDecisions';

type ExecuteResult = unknown;

export function useDecision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const executePaso = async (pasoId: number, body: DecisionCreateReq): Promise<ExecuteResult> => {
    setLoading(true); setError(null);
    try {
      const paso = await postPasoDecision(pasoId, body);
      // Store local history for UX (simple localStorage log)
      try {
        const hist = JSON.parse(localStorage.getItem('decisionHistory') || '[]');
        hist.unshift({ ts: Date.now(), tipo: 'paso', pasoId, body });
        localStorage.setItem('decisionHistory', JSON.stringify(hist.slice(0, 200)));
      } catch (err) {
        // noop but log to help debugging
         
        console.warn('Failed to update local decisionHistory', err);
      }
      // Notificar según decisión (rechazo => soft reset a pendiente)
  const decidedFalse = body?.Decision === false || body?.decision === false;
      if (decidedFalse) {
        // Marcar rechazo optimista para que el UI lo muestre como "rechazado" hasta un refresh manual
        markRejected(pasoId);
        toast({
          title: 'Rechazo registrado',
          description: 'El paso volvió a estado pendiente y sus decisiones fueron limpiadas.',
          variant: 'destructive',
          duration: 5000,
        });
      }
      return paso;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const executeSolicitud = async (solicitudId: number, body: DecisionCreateReq): Promise<ExecuteResult> => {
    setLoading(true); setError(null);
    try {
      const resp = await postSolicitudDecision(solicitudId, body);
      try {
        const hist = JSON.parse(localStorage.getItem('decisionHistory') || '[]');
        hist.unshift({ ts: Date.now(), tipo: 'solicitud', solicitudId, body, resp });
        localStorage.setItem('decisionHistory', JSON.stringify(hist.slice(0, 200)));
      } catch (err) {
         
        console.warn('Failed to update local decisionHistory', err);
      }
      return resp;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const undoPasoDecision = async (pasoId: number, decisionId: number) => {
    setLoading(true); setError(null);
    try {
      await deletePasoDecision(pasoId, decisionId);
      return true;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executePaso, executeSolicitud, undoPasoDecision };
}
