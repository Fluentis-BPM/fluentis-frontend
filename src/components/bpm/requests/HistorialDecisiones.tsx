import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DecisionHistoryEntry {
  ts: number;
  tipo: 'paso' | 'solicitud' | string;
  pasoId?: number;
  solicitudId?: number;
  body?: { IdUsuario?: number; Decision?: boolean } | unknown;
}

export const HistorialDecisiones: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [hist, setHist] = useState<DecisionHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('decisionHistory') || '[]';
      setHist(JSON.parse(raw));
    } catch (err) {
       
      console.warn('Failed to read decisionHistory', err);
      setHist([]);
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial de Decisiones</h3>
        <Button variant="ghost" onClick={() => onClose && onClose()}>Cerrar</Button>
      </div>
      {hist.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">No hay decisiones registradas en este navegador.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {hist.map((h, i) => (
            <Card key={i} className="p-2">
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{h.tipo === 'paso' ? `Paso ${h.pasoId}` : `Solicitud ${h.solicitudId}`}</div>
                  {(() => {
                    const b = h.body as { IdUsuario?: number; Decision?: boolean } | undefined;
                    return (
                      <div className="text-muted-foreground text-xs">Usuario: {b?.IdUsuario ?? '—'} • Decision: {String(b?.Decision ?? '—')}</div>
                    );
                  })()}
                </div>
                <div className="text-right">
                  {(() => {
                    const b = h.body as { Decision?: boolean } | undefined;
                    const d = Boolean(b?.Decision);
                    return <Badge variant={d ? 'success' : 'destructive'} className="text-xs">{d ? 'Aprobó' : 'Rechazó'}</Badge>;
                  })()}
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(h.ts).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
