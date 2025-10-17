import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { EditorPaso } from '@/components/bpm/flows/EditorPaso';
import { DiagramaFlujo } from '@/components/bpm/flows/DiagramaFlujo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FlujoActivo, PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { 
  ArrowLeft, 
  Eye,
  Edit,
  Workflow,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/bpm/use-toast';
import { INPUT_TEMPLATES, normalizeTipoInput, type Input as InputType } from '@/types/bpm/inputs';
import { fetchInputsCatalog } from '@/services/inputs';

interface EditorFlujoPageProps {
  flujo?: FlujoActivo;
  pasos?: PasoSolicitud[];
  caminos?: CaminoParalelo[];
  onVolverALista?: () => void;
}

export const EditorFlujoPage: React.FC<EditorFlujoPageProps> = ({
  flujo,
  pasos = [],
  caminos = [],
  onVolverALista
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pasoEditando, setPasoEditando] = useState<PasoSolicitud | null>(null);
  const [modoVista, setModoVista] = useState<'diagrama' | 'editor' | 'split'>('split');
  const [modoEdicion, setModoEdicion] = useState(true);
  const [inputsDisponiblesCat, setInputsDisponiblesCat] = useState<InputType[]>([]);

  const handleVolverAtras = () => {
    if (onVolverALista) {
      onVolverALista();
    } else {
      navigate(-1);
    }
  };

  // Editor actions are handled locally
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchInputsCatalog();
        const mapped: InputType[] = items.map(it => ({
          id_input: it.idInput,
          tipo_input: normalizeTipoInput(it.tipoInput),
          etiqueta: it.label || normalizeTipoInput(it.tipoInput),
        }));
        if (mounted) setInputsDisponiblesCat(mapped);
      } catch {
        if (mounted) setInputsDisponiblesCat([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleGuardarPaso = (pasoActualizado: PasoSolicitud) => {
    toast({
      title: "Paso guardado",
      description: `Los cambios en "${pasoActualizado.nombre}" se han guardado correctamente.`
    });
    setPasoEditando(null);
    setModoVista('diagrama');
  };

  const handleCerrarEditor = () => {
    setPasoEditando(null);
    setModoVista('diagrama');
  };

  if (!flujo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Flujo no encontrado</h2>
          <p className="text-muted-foreground mb-4">No se pudo cargar el flujo solicitado.</p>
          <Button onClick={handleVolverAtras}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVolverAtras}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Editor de Flujo #{flujo.id_flujo_activo}</h1>
                  <p className="text-sm text-muted-foreground">
                    Solicitud #{flujo.solicitud_id} • {pasos.length} pasos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de vista */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={modoVista === 'diagrama' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setModoVista('diagrama')}
                  className="h-8"
                >
                  <Workflow className="w-4 h-4 mr-2" />
                  Diagrama
                </Button>
                <Button
                  variant={modoVista === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setModoVista('split')}
                  className="h-8"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Dividido
                </Button>
                <Button
                  variant={modoVista === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setModoVista('editor')}
                  disabled={!pasoEditando}
                  className="h-8"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editor
                </Button>
              </div>

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
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto p-6 h-[calc(100vh-80px)]">
        {modoVista === 'diagrama' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Card className="h-full shadow-soft">
              <CardContent className="p-0 h-full">
                <DiagramaFlujo
                  pasos={pasos}
                  caminos={caminos}
                  readOnly={!modoEdicion}
                  flujoActivoId={flujo.id_flujo_activo}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {modoVista === 'editor' && pasoEditando && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Card className="h-full shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Edit className="w-5 h-5" />
                  Editando: {pasoEditando.nombre}
                  <Badge variant={pasoEditando.tipo_paso === 'aprobacion' ? 'secondary' : 'success'}>
                    {pasoEditando.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <EditorPaso
                  paso={pasoEditando}
                  isOpen={false}
                  onClose={handleCerrarEditor}
                  onGuardar={handleGuardarPaso}
                  isPanel={true}
                  responsablesDisponibles={[
                    { id: 1, nombre: 'Ana García', rol: 'Supervisor', departamento: 'Operaciones' },
                    { id: 2, nombre: 'Carlos López', rol: 'Gerente', departamento: 'Finanzas' },
                    { id: 3, nombre: 'María Silva', rol: 'Analista', departamento: 'Calidad' },
                    { id: 4, nombre: 'Juan Pérez', rol: 'Director', departamento: 'General' }
                  ]}
                  inputsDisponibles={inputsDisponiblesCat.length ? inputsDisponiblesCat : INPUT_TEMPLATES}
                  gruposAprobacion={[
                    { id_grupo: 1, nombre: 'Gerencia General' },
                    { id_grupo: 2, nombre: 'Finanzas y Contabilidad' },
                    { id_grupo: 3, nombre: 'Recursos Humanos' },
                    { id_grupo: 4, nombre: 'Tecnología' },
                    { id_grupo: 5, nombre: 'Operaciones' }
                  ]}
                  usuarioActualId={1}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {modoVista === 'split' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full flex gap-6"
          >
            {/* Diagrama */}
            <div className="flex-1">
              <Card className="h-full shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    Diagrama de Flujo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-80px)]">
                  <DiagramaFlujo
                    pasos={pasos}
                    caminos={caminos}
                    readOnly={!modoEdicion}
                    selectedNodeId={pasoEditando?.id_paso_solicitud.toString()}
                    flujoActivoId={flujo.id_flujo_activo}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            {pasoEditando && (
              <div className="w-[500px] min-w-[500px]">
                <Card className="h-full shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Edit className="w-5 h-5" />
                      {pasoEditando.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-80px)]">
                    <EditorPaso
                      paso={pasoEditando}
                      isOpen={false}
                      onClose={handleCerrarEditor}
                      onGuardar={handleGuardarPaso}
                      isPanel={true}
                      responsablesDisponibles={[
                        { id: 1, nombre: 'Ana García', rol: 'Supervisor', departamento: 'Operaciones' },
                        { id: 2, nombre: 'Carlos López', rol: 'Gerente', departamento: 'Finanzas' },
                        { id: 3, nombre: 'María Silva', rol: 'Analista', departamento: 'Calidad' },
                        { id: 4, nombre: 'Juan Pérez', rol: 'Director', departamento: 'General' }
                      ]}
                      inputsDisponibles={inputsDisponiblesCat.length ? inputsDisponiblesCat : INPUT_TEMPLATES}
                      gruposAprobacion={[
                        { id_grupo: 1, nombre: 'Gerencia General' },
                        { id_grupo: 2, nombre: 'Finanzas y Contabilidad' },
                        { id_grupo: 3, nombre: 'Recursos Humanos' }
                      ]}
                      usuarioActualId={1}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
