import React, { useState, useEffect } from 'react';
import { DiagramaFlujo } from './DiagramaFlujo';
import { EditorPaso } from './EditorPaso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlujoActivo, PasoSolicitud } from '@/types/bpm/flow';
import { 
  Workflow, 
  Eye, 
  Edit, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';

interface VistaDiagramaFlujoProps {
  flujo: FlujoActivo;
  pasos: PasoSolicitud[];
  caminos: any[];
  onActualizarPaso: (pasoId: number, estado: PasoSolicitud['estado']) => void;
  onAgregarPaso: (flujoId: number, x: number, y: number, tipo_paso?: 'ejecucion' | 'aprobacion') => void;
  onCrearCamino: (origen: number, destino: number) => void;
  onEditarPaso?: (pasoActualizado: PasoSolicitud) => void;
  onVolverALista?: () => void;
}

export const VistaDiagramaFlujo: React.FC<VistaDiagramaFlujoProps> = ({
  flujo,
  pasos,
  caminos,
  onActualizarPaso,
  onAgregarPaso,
  onCrearCamino,
  onEditarPaso,
  onVolverALista
}) => {
  const { toast } = useToast();
  const [modoEdicion, setModoEdicion] = useState(true); // Empezar en modo edición por defecto
  const [pasoEditando, setPasoEditando] = useState<PasoSolicitud | null>(null);
  const [diagramaKey, setDiagramaKey] = useState(0); // Para forzar re-render
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const estadisticasPasos = {
    total: pasos.length,
    pendientes: pasos.filter(p => p.estado === 'pendiente').length,
    aprobados: pasos.filter(p => p.estado === 'aprobado').length,
    rechazados: pasos.filter(p => p.estado === 'rechazado').length,
    excepciones: pasos.filter(p => p.estado === 'excepcion').length,
  };

  const handleAgregarPaso = (x: number, y: number, tipo_paso?: 'ejecucion' | 'aprobacion') => {
    onAgregarPaso(flujo.id_flujo_activo, x, y, tipo_paso);
    // El nuevo paso aparecerá automáticamente sin necesidad de forzar re-render
    toast({
      title: "Paso agregado",
      description: `Nuevo paso de ${tipo_paso || 'ejecucion'} agregado al diagrama`,
    });
  };

  const handleEditarPaso = (paso: PasoSolicitud) => {
    setPasoEditando(paso);
  };

  const handleNodeSelect = (paso: PasoSolicitud | null) => {
    if (paso) {
      setSelectedNodeId(paso.id_paso_solicitud.toString());
      setPasoEditando(paso);
    } else {
      setSelectedNodeId(null);
      setPasoEditando(null);
    }
  };

  const handleGuardarPasoEditado = (pasoActualizado: PasoSolicitud) => {
    if (onEditarPaso) {
      onEditarPaso(pasoActualizado);
      // No forzar re-render para evitar problemas con el drag
      toast({
        title: "Paso actualizado",
        description: `Los cambios en "${pasoActualizado.nombre}" se han guardado`,
      });
    }
  };

  const handleCrearCamino = (origen: number, destino: number) => {
    onCrearCamino(origen, destino);
    // No forzar re-render para evitar problemas con el estado
    toast({
      title: "Conexión creada", 
      description: "Nueva conexión agregada entre pasos",
    });
  };

  const handleActualizarPaso = (pasoId: number, estado: PasoSolicitud['estado']) => {
    onActualizarPaso(pasoId, estado);
    // No forzar re-render para evitar problemas con el estado
    toast({
      title: "Paso actualizado",
      description: `Estado cambiado a ${estado}`,
    });
  };

  // Efectos para refrescar diagrama solo cuando sea necesario
  useEffect(() => {
    // Solo forzar re-render cuando hay cambios significativos en estructura
    // No cuando solo cambian posiciones
    setDiagramaKey(prev => prev + 1);
  }, [pasos.length, caminos.length]); // No incluir pasos o caminos completos

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'encurso': 'default',
      'finalizado': 'default', 
      'cancelado': 'destructive'
    } as const;
    
    return <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>{estado}</Badge>;
  };

  return (
    <div className="space-y-6">
          {/* Header del flujo */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Flujo #{flujo.id_flujo_activo}
                  {getEstadoBadge(flujo.estado)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Solicitud #{flujo.solicitud_id} • Iniciado {flujo.fecha_inicio.toLocaleDateString()}
                </p>
                {/* Mostrar datos de la solicitud original */}
                {flujo.datos_solicitud && (
                  <div className="mt-2 p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Datos de Solicitud:</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(flujo.datos_solicitud).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Mostrar campos dinámicos */}
                {flujo.campos_dinamicos && Object.keys(flujo.campos_dinamicos).length > 0 && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Campos Dinámicos:</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(flujo.campos_dinamicos).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onVolverALista && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onVolverALista}
                >
                  ← Volver a la Lista
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiagramaKey(prev => prev + 1)}
                className="mr-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refrescar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModoEdicion(!modoEdicion)}
                className={modoEdicion ? "border-primary text-primary" : ""}
              >
                {modoEdicion ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Solo Ver
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="diagrama" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagrama" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Diagrama de Flujo
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagrama" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <DiagramaFlujo
                key={diagramaKey}
                pasos={pasos}
                caminos={caminos}
                onActualizarPaso={handleActualizarPaso}
                onAgregarPaso={handleAgregarPaso}
                onCrearCamino={handleCrearCamino}
                onEditarPaso={handleEditarPaso}
                readOnly={!modoEdicion}
                selectedNodeId={selectedNodeId || undefined}
                onNodeSelect={handleNodeSelect}
                camposDinamicosIniciales={
                  flujo.campos_dinamicos && Array.isArray(flujo.campos_dinamicos) 
                    ? flujo.campos_dinamicos.reduce((acc: any, campo: any) => {
                        if (campo.valor !== undefined) {
                          acc[`Campo ${campo.input_id}`] = campo.valor;
                        }
                        return acc;
                      }, {})
                    : flujo.campos_dinamicos
                }
              />
            </div>
            
            {/* Panel de propiedades */}
            {pasoEditando && (
              <div className="w-96 min-w-96 max-w-2xl border-l bg-muted/30 resize-x overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Propiedades del Paso</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNodeSelect(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-[500px] overflow-y-auto p-1">
                  <EditorPaso
                    paso={pasoEditando}
                    isOpen={false} // No usar como dialog, sino como panel
                    onClose={() => handleNodeSelect(null)}
                    onGuardar={handleGuardarPasoEditado}
                    responsablesDisponibles={[
                      { id: 1, nombre: 'Ana García', rol: 'Supervisor', departamento: 'Operaciones' },
                      { id: 2, nombre: 'Carlos López', rol: 'Gerente', departamento: 'Finanzas' },
                      { id: 3, nombre: 'María Silva', rol: 'Analista', departamento: 'Calidad' },
                      { id: 4, nombre: 'Juan Pérez', rol: 'Director', departamento: 'General' }
                    ]}
                     isPanel={true}
                     // Pasar datos necesarios para los diferentes tipos de pasos
                     inputsDisponibles={[
                       {
                         id_input: 1,
                         tipo_input: 'textocorto',
                         etiqueta: 'Título de la solicitud',
                         placeholder: 'Ingrese un título descriptivo',
                         validacion: { required: true, max: 100 }
                       },
                       {
                         id_input: 2,
                         tipo_input: 'textolargo',
                         etiqueta: 'Justificación detallada',
                         placeholder: 'Explique los motivos de la solicitud...',
                         validacion: { required: true, max: 1000 }
                       },
                       {
                         id_input: 3,
                         tipo_input: 'combobox',
                         etiqueta: 'Departamento solicitante',
                         opciones: ['Recursos Humanos', 'Finanzas', 'Tecnología', 'Operaciones', 'Marketing'],
                         validacion: { required: true }
                       },
                       {
                         id_input: 4,
                         tipo_input: 'date',
                         etiqueta: 'Fecha requerida',
                         validacion: { required: false }
                       },
                       {
                         id_input: 5,
                         tipo_input: 'number',
                         etiqueta: 'Presupuesto estimado',
                         placeholder: '0.00',
                         validacion: { min: 0, max: 1000000 }
                       }
                     ]}
                     gruposAprobacion={[
                       { id_grupo: 1, nombre: 'Gerencia General' },
                       { id_grupo: 2, nombre: 'Finanzas y Contabilidad' },
                       { id_grupo: 3, nombre: 'Recursos Humanos' },
                       { id_grupo: 4, nombre: 'Tecnología' },
                       { id_grupo: 5, nombre: 'Operaciones' }
                     ]}
                     usuarioActualId={1} // Simular usuario actual
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-success">{estadisticasPasos.aprobados}</p>
                    <p className="text-sm text-muted-foreground">Aprobados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold text-warning">{estadisticasPasos.pendientes}</p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-destructive">{estadisticasPasos.rechazados}</p>
                    <p className="text-sm text-muted-foreground">Rechazados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">{estadisticasPasos.excepciones}</p>
                    <p className="text-sm text-muted-foreground">Excepciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista detallada de pasos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pasos.map((paso, index) => (
                  <div key={paso.id_paso_solicitud} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                       <div>
                         <h4 className="font-medium">{paso.nombre}</h4>
                         <p className="text-sm text-muted-foreground">
                           {paso.descripcion || 'Sin descripción'} • {paso.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {paso.responsable_id && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-3 h-3" />
                          ID: {paso.responsable_id}
                        </div>
                      )}
                      <Badge variant={
                        paso.estado === 'aprobado' ? 'default' :
                        paso.estado === 'rechazado' ? 'destructive' :
                        paso.estado === 'excepcion' ? 'secondary' : 'outline'
                      }>
                        {paso.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* El editor ahora está integrado como panel lateral */}
    </div>
  );
};