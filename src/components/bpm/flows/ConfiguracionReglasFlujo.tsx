import React from 'react';
import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  GitMerge, 
  ArrowRight, 
  CheckCircle2,
  CheckSquare,
  Anchor,
  Info
} from 'lucide-react';

interface ConfiguracionReglasProps {
  paso: PasoSolicitud;
  onUpdatePaso: (paso: PasoSolicitud) => void;
  showTipoFlujo?: boolean; // permite ocultar UI de tipo de flujo
}

export const ConfiguracionReglasFlujo: React.FC<ConfiguracionReglasProps> = ({
  paso,
  onUpdatePaso,
  showTipoFlujo = true
}) => {
  const handleCambioTipoFlujo = (nuevoTipo: PasoSolicitud['tipo_flujo']) => {
    onUpdatePaso({ ...paso, tipo_flujo: nuevoTipo });
  };

  const handleCambioReglaAprobacion = (nuevaRegla: PasoSolicitud['regla_aprobacion']) => {
    onUpdatePaso({ ...paso, regla_aprobacion: nuevaRegla });
  };

  const obtenerIconoTipoFlujo = (tipo: PasoSolicitud['tipo_flujo']) => {
    switch (tipo) {
      case 'normal': return <ArrowRight className="w-4 h-4" />;
      case 'bifurcacion': return <GitBranch className="w-4 h-4" />;
      case 'union': return <GitMerge className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  const obtenerIconoReglaAprobacion = (regla: PasoSolicitud['regla_aprobacion']) => {
    switch (regla) {
      case 'unanime': return <CheckCircle2 className="w-4 h-4" />;
      case 'individual': return <CheckSquare className="w-4 h-4" />;
      case 'ancla': return <Anchor className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const labelReglaAprobacion = (regla: PasoSolicitud['regla_aprobacion']) => {
    switch (regla) {
      case 'unanime': return 'Unánime';
      case 'individual': return 'Mayoría';
      case 'ancla': return 'Ancla';
      default: return String(regla ?? '').toString();
    }
  };

  // Obtener conexiones salientes y nombre de destino desde el store
  const flujoId = paso.flujo_activo_id;
  const outgoing = useSelector((state: RootState) => {
    const caminosMap = state.bpm.caminosPorFlujo || {};
    const pasosMap = state.bpm.pasosPorFlujo || {};
    const caminos = (caminosMap[flujoId] || []) as CaminoParalelo[];
    const pasos = (pasosMap[flujoId] || []) as PasoSolicitud[];
    return caminos
      .filter((c: CaminoParalelo) => c.paso_origen_id === paso.id_paso_solicitud)
      .map(c => ({
        ...c,
        targetNombre: pasos.find((p: PasoSolicitud) => p.id_paso_solicitud === c.paso_destino_id)?.nombre || String(c.paso_destino_id)
      }));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Configuración de Reglas de Flujo</h3>
      </div>

      {/* Tipo de Flujo (oculto si showTipoFlujo es false) */}
      {showTipoFlujo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {obtenerIconoTipoFlujo(paso.tipo_flujo)}
              Tipo de Flujo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Comportamiento del Paso</Label>
              <Select 
                value={paso.tipo_flujo} 
                onValueChange={handleCambioTipoFlujo}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Normal</div>
                        <div className="text-xs text-muted-foreground">Flujo secuencial estándar</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="bifurcacion">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Bifurcación</div>
                        <div className="text-xs text-muted-foreground">Divide el flujo en múltiples caminos</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="union">
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Unión</div>
                        <div className="text-xs text-muted-foreground">Espera múltiples caminos antes de continuar</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Contador de ramas salientes desde el store (máx 10) y lista de destinos */}
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ramas:</span>
                    <span className="ml-2 font-medium">{outgoing.length} / 10</span>
                  </div>
                  {outgoing.length >= 10 ? (
                    <div role="alert" aria-live="assertive" className="text-sm font-semibold text-white px-3 py-1 rounded bg-red-700 border-2 border-red-800 shadow-lg animate-pulse">
                      Límite de 10 ramas alcanzado
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Puedes agregar {10 - outgoing.length} rama(s)</div>
                  )}
                </div>

                {/* Lista corta de conexiones salientes */}
                {outgoing.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Conexiones salientes:</div>
                    <ul className="list-disc list-inside text-sm max-h-28 overflow-y-auto">
                      {outgoing.map((c, idx) => (
                        <li key={c.id_camino || idx} className="truncate">
                          {paso.nombre || paso.id_paso_solicitud} → <span className="font-medium">{c.targetNombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Información del tipo de flujo */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                {obtenerIconoTipoFlujo(paso.tipo_flujo)}
                <div>
                  <p className="font-medium text-sm">
                    {paso.tipo_flujo === 'normal' && 'Flujo Secuencial'}
                    {paso.tipo_flujo === 'bifurcacion' && 'Flujo con Bifurcación'}
                    {paso.tipo_flujo === 'union' && 'Flujo con Unión'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paso.tipo_flujo === 'normal' && 'Este paso se ejecuta después de que se complete el paso anterior.'}
                    {paso.tipo_flujo === 'bifurcacion' && 'Este paso puede generar múltiples caminos paralelos según el resultado.'}
                    {paso.tipo_flujo === 'union' && 'Este paso espera a que se completen todos los pasos anteriores antes de continuar.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reglas de Aprobación (solo para pasos de aprobación) */}
      {paso.tipo_paso === 'aprobacion' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {obtenerIconoReglaAprobacion(paso.regla_aprobacion)}
              Reglas de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Criterio de Aprobación</Label>
              <Select 
                value={paso.regla_aprobacion}
                onValueChange={(v) => handleCambioReglaAprobacion(v as PasoSolicitud['regla_aprobacion'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unanime">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Unánime</div>
                        <div className="text-xs text-muted-foreground">Todos deben aprobar</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Mayoría</div>
                        <div className="text-xs text-muted-foreground">La mayoría debe aprobar</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ancla">
                    <div className="flex items-center gap-2">
                      <Anchor className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Ancla</div>
                        <div className="text-xs text-muted-foreground">Requiere al menos 2 aprobaciones</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Información de la regla */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                {obtenerIconoReglaAprobacion(paso.regla_aprobacion)}
                <div>
                  <p className="font-medium text-sm">
                    {paso.regla_aprobacion === 'unanime' && 'Aprobación Unánime'}
                    {paso.regla_aprobacion === 'individual' && 'Aprobación por Mayoría'}
                    {paso.regla_aprobacion === 'ancla' && 'Aprobación con Usuario Ancla'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paso.regla_aprobacion === 'unanime' && 'Todos los miembros del grupo deben aprobar para que el paso continúe. Un solo rechazo cancelará el paso.'}
                    {paso.regla_aprobacion === 'individual' && 'Se aprueba si la mayoría del grupo aprueba.'}
                    {paso.regla_aprobacion === 'ancla' && 'Se requieren al menos 2 aprobaciones, incluyendo la de un usuario clave o "ancla".'}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores visuales */}
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {obtenerIconoReglaAprobacion(paso.regla_aprobacion)}
                <span className="capitalize">{labelReglaAprobacion(paso.regla_aprobacion)}</span>
              </Badge>
              {paso.tipo_flujo !== 'normal' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {obtenerIconoTipoFlujo(paso.tipo_flujo)}
                  <span className="capitalize">{paso.tipo_flujo}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Resumen de configuración */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="font-medium text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Resumen de Configuración
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Tipo de paso:</span>
                <span className="ml-2 font-medium capitalize">{paso.tipo_paso}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de flujo:</span>
                <span className="ml-2 font-medium capitalize">{paso.tipo_flujo}</span>
              </div>
              {paso.tipo_paso === 'aprobacion' && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Regla de aprobación:</span>
                  <span className="ml-2 font-medium capitalize">{labelReglaAprobacion(paso.regla_aprobacion)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};