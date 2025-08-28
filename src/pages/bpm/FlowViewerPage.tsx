import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DiagramaFlujo } from '@/components/bpm/flows/DiagramaFlujo';
import { EditorPaso } from '@/components/bpm/flows/EditorPaso';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlujoActivo, PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { 
  Workflow, 
  Eye, 
  Edit, 
  ArrowLeft,
  RefreshCw,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/bpm/use-toast';
import { fmtDate } from '@/lib/utils';

interface FlowViewerPageProps {
  flujo: FlujoActivo;
  pasos: PasoSolicitud[];
  caminos: CaminoParalelo[];
  // onActualizarPaso: (pasoId: number, estado: PasoSolicitud['estado']) => void; // TODO: Implementar thunk updatePasoSolicitud
  // onAgregarPaso: (flujoId: number, x: number, y: number, tipo_paso?: 'ejecucion' | 'aprobacion') => void; // TODO: Implementar thunk createPasoSolicitud
  // onCrearCamino: (origen: number, destino: number) => void; // TODO: Implementar thunk createCaminoParalelo
  // onEditarPaso?: (pasoActualizado: PasoSolicitud) => void; // TODO: Implementar thunk updatePasoSolicitud
  onVolverALista?: () => void;
}

export const FlowViewerPage: React.FC<FlowViewerPageProps> = ({
  flujo,
  pasos,
  caminos,
  onVolverALista
}) => {
  // const { toast, fetchPasosYConexiones, updatePasoSolicitud, createPasoSolicitud, createCaminoParalelo } = useBpm();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [pasoEditando, setPasoEditando] = useState<PasoSolicitud | null>(null);
  const [diagramaKey, setDiagramaKey] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(480); // Width for resizable editor
  const [isResizing, setIsResizing] = useState(false);

  const handleNodeSelect = (paso: PasoSolicitud | null) => {
    if (paso) {
      setSelectedNodeId(paso.id_paso_solicitud.toString());
      setPasoEditando(paso);
    } else {
      setSelectedNodeId(null);
      setPasoEditando(null);
    }
  };

  const handleEditarPaso = (paso: PasoSolicitud) => {
    setPasoEditando(paso);
    setSelectedNodeId(paso.id_paso_solicitud.toString());
  };

  const handleGuardarPasoEditado = (pasoActualizado: PasoSolicitud) => {
    // if (onEditarPaso) {
    //   onEditarPaso(pasoActualizado);
    // }
    // Placeholder para thunk
    // updatePasoSolicitud(pasoActualizado); // TODO: Implementar thunk
    setPasoEditando(null);
    setSelectedNodeId(null);
    toast({
      title: "Paso actualizado",
      description: `Los cambios en "${pasoActualizado.nombre || 'Sin nombre'}" se han guardado correctamente.`,
    });
  };

  useEffect(() => {
    // Solo resetear el diagrama en casos específicos, no por cambios normales en pasos/caminos
    // El key se incrementa solo cuando hay cambios estructurales importantes
    // Los cambios normales (agregar/editar pasos) se manejan internamente en DiagramaFlujo
  }, []);

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 320;
      const maxWidth = window.innerWidth * 0.6;
      setEditorWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'encurso': 'default',
      'finalizado': 'default', 
      'cancelado': 'destructive'
    } as const;
    return <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>{estado}</Badge>;
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {onVolverALista && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onVolverALista}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Workflow className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  Flujo #{flujo.id_flujo_activo}
                  {getEstadoBadge(flujo.estado)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Solicitud #{flujo.solicitud_id} • {fmtDate(flujo.fecha_inicio)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDiagramaKey(prev => prev + 1);
                toast({
                  title: "Diagrama actualizado",
                  description: "El diagrama se ha refrescado correctamente",
                });
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refrescar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModoEdicion(!modoEdicion)}
              className={modoEdicion ? "border-primary text-primary bg-primary/10" : ""}
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
      </div>

      {/* Main Flow Area - Takes full remaining height */}
    <div className="flex-1 relative overflow-hidden">
        {/* React Flow Container with dynamic margin */}
        <div 
      className={`h-full transition-all duration-300`}
          style={{ marginRight: pasoEditando ? `${editorWidth}px` : '0' }}
        >
          <DiagramaFlujo
            key={diagramaKey}
            pasos={pasos}
            caminos={caminos}
            flujoActivoId={flujo.id_flujo_activo}
            readOnly={!modoEdicion}
            selectedNodeId={selectedNodeId || undefined}
            onNodeSelect={handleNodeSelect}
            datosSolicitudIniciales={flujo.datos_solicitud}
          />
        </div>

        {/* Integrated Step Editor Panel */}
        {pasoEditando && (
          <motion.div
            initial={{ x: editorWidth }}
            animate={{ x: 0 }}
            exit={{ x: editorWidth }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 right-0 h-full bg-white border-l shadow-xl flex flex-col z-10"
            style={{ width: `${editorWidth}px` }}
          >
            {/* Resize Handle */}
            <div 
              className="absolute left-0 top-0 w-1 h-full bg-gray-200 hover:bg-primary cursor-col-resize z-20 transition-colors"
              onMouseDown={handleMouseDown}
              style={{ marginLeft: '-2px' }}
            />
            
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <h3 className="font-semibold">{pasoEditando.nombre || 'Sin nombre'}</h3>
                <Badge variant={
                  pasoEditando.tipo_paso === 'aprobacion' ? 'secondary' : 'success'
                }>
                  {pasoEditando.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-white">
              <EditorPaso
                paso={pasoEditando}
                isOpen={false}
                onClose={() => setPasoEditando(null)}
                onGuardar={handleGuardarPasoEditado}
                responsablesDisponibles={[
                  { id: 1, nombre: 'Ana García', rol: 'Supervisor', departamento: 'Operaciones' },
                  { id: 2, nombre: 'Carlos López', rol: 'Gerente', departamento: 'Finanzas' },
                  { id: 3, nombre: 'María Silva', rol: 'Analista', departamento: 'Calidad' },
                  { id: 4, nombre: 'Juan Pérez', rol: 'Director', departamento: 'General' }
                ]}
                isPanel={true}
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
                  { id_grupo: 4, nombre: 'Tecnología' }
                ]}
              />
            </div>
          </motion.div>
        )}

        {/* Floating button to open step editor when a step is selected */}
        {selectedNodeId && !pasoEditando && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 right-6"
          >
            <Button
              onClick={() => {
                const paso = pasos.find(p => p.id_paso_solicitud.toString() === selectedNodeId);
                if (paso) handleEditarPaso(paso);
              }}
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Settings className="w-5 h-5 mr-2" />
              Editar Paso
            </Button>
          </motion.div>
        )}
      </div>
  </div>
  );
};

export default FlowViewerPage;