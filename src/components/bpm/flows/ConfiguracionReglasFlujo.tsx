import React from 'react';
import { PasoSolicitud } from '@/types/bpm/flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  GitMerge, 
  ArrowRight, 
  Users, 
  UserCheck, 
  Crown,
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
      case 'unanime': return <Users className="w-4 h-4" />;
      case 'individual': return <UserCheck className="w-4 h-4" />;
      case 'ancla': return <Crown className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

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
                      <Users className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Unánime</div>
                        <div className="text-xs text-muted-foreground">Todos deben aprobar</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Individual</div>
                        <div className="text-xs text-muted-foreground">Cualquier aprobación es suficiente</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ancla">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Usuario Ancla</div>
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
                    {paso.regla_aprobacion === 'individual' && 'Aprobación Individual'}
                    {paso.regla_aprobacion === 'ancla' && 'Aprobación con Usuario Ancla'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paso.regla_aprobacion === 'unanime' && 'Todos los miembros del grupo deben aprobar para que el paso continúe. Un solo rechazo cancelará el paso.'}
                    {paso.regla_aprobacion === 'individual' && 'Una sola aprobación de cualquier miembro del grupo es suficiente para continuar.'}
                    {paso.regla_aprobacion === 'ancla' && 'Se requieren al menos 2 aprobaciones, incluyendo la de un usuario clave o "ancla".'}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores visuales */}
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {obtenerIconoReglaAprobacion(paso.regla_aprobacion)}
                <span className="capitalize">{paso.regla_aprobacion}</span>
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
                  <span className="ml-2 font-medium capitalize">{paso.regla_aprobacion}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};