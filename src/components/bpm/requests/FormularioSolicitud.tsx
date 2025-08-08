import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrearSolicitudInput, EstadoSolicitud } from '@/types/bpm/request';
import { CamposDinamicos } from '@/types/bpm/inputs';
import { SelectorCamposDinamicos } from './SelectorCamposDinamicos';
import { SelectorGrupoAprobacion } from './SelectorGrupoAprobacion';
import { GrupoAprobacion } from '@/types/bpm/approval';
import { Plus, User, Workflow, Settings, Users } from 'lucide-react';

interface Props {
  onCrearSolicitud: (input: CrearSolicitudInput, grupoAprobacionId?: number) => void;
  gruposAprobacion: GrupoAprobacion[];
  onCrearGrupo: (nombre: string, miembros: number[]) => GrupoAprobacion;
  isLoading?: boolean;
}

export const FormularioSolicitud: React.FC<Props> = ({ 
  onCrearSolicitud, 
  gruposAprobacion, 
  onCrearGrupo, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<CrearSolicitudInput>({
    solicitante_id: 0,
    flujo_base_id: undefined,
    estado: 'pendiente',
    datos_adicionales: {},
    campos_dinamicos: {}
  });

  const [descripcion, setDescripcion] = useState('');
  const [grupoAprobacionSeleccionado, setGrupoAprobacionSeleccionado] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.solicitante_id === 0) return;

    // Validar campos dinámicos requeridos
    const camposRequeridos = Object.entries(formData.campos_dinamicos || {}).filter(
      ([_, campo]) => campo.requerido && !campo.valor.trim()
    );

    if (camposRequeridos.length > 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const solicitudCompleta: CrearSolicitudInput = {
      ...formData,
      datos_adicionales: {
        descripcion: descripcion.trim(),
        ...formData.datos_adicionales
      }
    };

    onCrearSolicitud(solicitudCompleta, grupoAprobacionSeleccionado);
    
    // Resetear formulario
    setFormData({
      solicitante_id: 0,
      flujo_base_id: undefined,
      estado: 'pendiente',
      datos_adicionales: {},
      campos_dinamicos: {}
    });
    setDescripcion('');
    setGrupoAprobacionSeleccionado(undefined);
  };

  const handleCamposDinamicosChange = (campos: CamposDinamicos) => {
    setFormData(prev => ({
      ...prev,
      campos_dinamicos: campos
    }));
  };

  const handleCrearGrupo = (nombre: string, miembros: number[]): GrupoAprobacion => {
    return onCrearGrupo(nombre, miembros);
  };

  return (
    <Card className="shadow-elegant border-0 overflow-hidden animate-slide-up">
      <CardHeader className="bg-gradient-primary text-white">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Solicitud
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-card">
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-0">
            <TabsTrigger 
              value="basico" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-smooth"
            >
              <User className="w-4 h-4" />
              Datos Básicos
            </TabsTrigger>
            <TabsTrigger 
              value="aprobacion" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-smooth"
            >
              <Users className="w-4 h-4" />
              Aprobación
            </TabsTrigger>
            <TabsTrigger 
              value="dinamicos" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-smooth"
            >
              <Settings className="w-4 h-4" />
              Campos Dinámicos
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            <TabsContent value="basico" className="space-y-6 animate-fade-in">
              {/* ID del Solicitante */}
              <div className="space-y-2">
                <Label htmlFor="solicitante" className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-primary" />
                  ID del Solicitante
                </Label>
                <Input
                  id="solicitante"
                  type="number"
                  value={formData.solicitante_id || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    solicitante_id: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Ingrese el ID del solicitante"
                  required
                  className="transition-smooth focus:ring-request-primary/50"
                />
              </div>

              {/* Plantilla de Flujo (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="flujo" className="flex items-center gap-2 font-medium">
                  <Workflow className="w-4 h-4 text-primary" />
                  Plantilla de Flujo (Opcional)
                </Label>
                <Input
                  id="flujo"
                  type="number"
                  value={formData.flujo_base_id || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    flujo_base_id: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  placeholder="ID de plantilla predefinida"
                />
              </div>

              {/* Estado Inicial */}
              <div className="space-y-2">
                <Label className="font-medium">Estado Inicial</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: EstadoSolicitud) => 
                    setFormData(prev => ({ ...prev, estado: value }))
                  }
                >
                  <SelectTrigger className="transition-smooth focus:ring-request-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe los detalles de la solicitud..."
                  rows={3}
                  className="transition-smooth focus:ring-request-primary/50"
                />
              </div>

            </TabsContent>

            <TabsContent value="aprobacion" className="space-y-6 animate-fade-in">
              <SelectorGrupoAprobacion
                gruposDisponibles={gruposAprobacion}
                grupoSeleccionado={grupoAprobacionSeleccionado}
                onGrupoSeleccionado={setGrupoAprobacionSeleccionado}
                onCrearGrupo={handleCrearGrupo}
              />
            </TabsContent>

            <TabsContent value="dinamicos" className="space-y-6 animate-fade-in">
              <SelectorCamposDinamicos
                camposDinamicos={formData.campos_dinamicos || {}}
                onChange={handleCamposDinamicosChange}
              />
            </TabsContent>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={isLoading || formData.solicitante_id === 0}
                className="w-full bg-gradient-primary hover:opacity-90 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-smooth shadow-elegant text-white font-medium h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Solicitud
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};