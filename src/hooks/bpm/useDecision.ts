import { useState } from 'react';
import { postPasoDecision, postSolicitudDecision, deletePasoDecision, DecisionCreateReq } from '@/services/api';

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
