import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Node,
  MiniMap,
  Position,
  Handle,
  MarkerType,
  NodeChange,
  OnNodeDrag,
  Connection
  , OnMoveEnd, type ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { RelacionInput, CamposDinamicos } from '@/types/bpm/inputs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FloatingAddButton } from './FloatingAddButton';
import { useBpm } from '@/hooks/bpm/useBpm';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Settings,
  Users,
  FileText,
  Info
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { toast } from '@/hooks/bpm/use-toast';
import { selectPasoReadiness } from '@/store/bpm/bpmSlice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Tipo para los datos del nodo
interface PasoNodeData {
  paso: PasoSolicitud;
  camposDinamicosIniciales?: RelacionInput[] | CamposDinamicos | Record<string, string> | undefined;
  esInicial: boolean;
  isSelected: boolean;
  onNodeClick?: (paso: PasoSolicitud) => void;
  onDeletePaso?: (id: number) => void;
  readOnly?: boolean;
}

interface DiagramaFlujoProps {
  pasos: PasoSolicitud[];
  caminos: CaminoParalelo[];
  readOnly?: boolean;
  datosSolicitudIniciales?: Record<string, string> | undefined;
  selectedNodeId?: string;
  flujoActivoId: number; // Añadir esta prop para evitar el problema del ID 0
  onNodeSelect?: (paso: PasoSolicitud | null) => void;
  onCreatePaso?: (data: unknown) => void;
  onDeletePaso?: (id: number) => void;
  onCreateConexion?: (id: number, destinoId: number, esExcepcion?: boolean) => void;
  // Opcionales para compatibilidad con vistas que administran conexiones en bloque
  onReplaceConexiones?: (id: number, destinos: number[]) => void;
  onDeleteConexion?: (id: number, destinoId: number) => void;
}

// Componente personalizado para nodos de paso
const PasoNode: React.FC<{ data: PasoNodeData }> = ({ data }) => {
  const { paso, camposDinamicosIniciales, esInicial, isSelected, onNodeClick, onDeletePaso } = data;
  const flujoId = paso.flujo_activo_id;
  const readiness = useSelector((state: RootState) => selectPasoReadiness(state, flujoId, paso.id_paso_solicitud));
  
  const getIconByTipo = () => {
    // Special icon for initial step
    if (paso.tipo_paso === 'inicio') {
      return <Play className="w-4 h-4" />;
    }
    // Special icon for final step
    if (paso.tipo_paso === 'fin') {
      return <CheckCircle className="w-4 h-4" />;
    }
    switch (paso.tipo_flujo) { // Corregido de 'tipo' a 'tipo_flujo' según la interfaz PasoSolicitud
      case 'normal': return <Settings className="w-4 h-4" />;
      case 'bifurcacion': return <AlertTriangle className="w-4 h-4" />;
      case 'union': return <CheckCircle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getIconByTipoPaso = () => {
    return paso.tipo_paso === 'aprobacion' ? <Users className="w-3 h-3" /> : <FileText className="w-3 h-3" />;
  };

  const getColorByEstado = () => {
    // Special style for final step - purple/violet theme
    if (paso.tipo_paso === 'fin') {
      return 'border-purple-600 bg-purple-50';
    }

    switch (paso.estado) {
      case 'aprobado': return 'border-success bg-success/10';
      case 'rechazado': return 'border-destructive bg-destructive/10';
      case 'excepcion': return 'border-warning bg-warning/10';
      case 'pendiente': return 'border-gray-500 bg-white';
      case 'entregado': return 'border-info bg-info/10';
      case 'cancelado': return 'border-destructive bg-destructive/10';
      default: return 'border-gray-500 bg-white';
    }
  };

  const getBadgeVariant = () => {
    // Don't show estado badge for initial or final step
    if (paso.tipo_paso === 'inicio' || paso.tipo_paso === 'fin') return null;
    
    switch (paso.estado) {
      case 'aprobado': return 'default';
      case 'rechazado': return 'destructive';
      case 'excepcion': return 'secondary';
      case 'pendiente': return 'outline';
      case 'entregado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getTipoPasoColor = () => {
    if (paso.tipo_paso === 'fin') return 'text-purple-600';
    return paso.tipo_paso === 'aprobacion' ? 'text-orange-600' : 'text-blue-600';
  };

  // Determinar si el paso está listo según readiness (inicio siempre listo)
  const isReady = paso.tipo_paso === 'inicio' ? true : Boolean(readiness?.ready ?? true);

  return (
    <Card
      className={`p-4 min-w-[220px] transition-all b-2 border-2 border-blue-500 duration-300 ${
        paso.tipo_paso === 'fin' ? '' : 'cursor-pointer'
      } ${getColorByEstado()} ${isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-glow' : 'hover:shadow-lg hover:scale-105'}`}

      onClick={() => {
        // Allow opening editor for initial step to view initial campos; still block final step
        if (paso.tipo_paso === 'fin') return;
        onNodeClick?.(paso);
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-primary mt-1">
          {getIconByTipo()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{paso.nombre || 'Sin nombre'}</h4>
              {paso.tipo_paso === 'inicio' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Inicial</span>
              )}
              {paso.tipo_paso === 'fin' && (
                <span className="text-xs bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded-full font-semibold">Final</span>
              )}
              {paso.tipo_paso === 'fin' && paso.estado === 'entregado' && (
                <Badge variant="success" className="text-[10px]">Finalizado</Badge>
              )}
            </div>
          </div>

          {/* Si el paso es tipo 'union', mostrar contador X/Y */}
          {paso.tipo_flujo === 'union' && readiness && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">Esperando:</span>
              <span className="ml-2 text-sm font-medium">{readiness.completedParents} / {readiness.totalParents} ramas</span>
            </div>
          )}
          

          {/* Indicador de tipo de paso */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 ${getTipoPasoColor()}`}>
              {getIconByTipoPaso()}
              <span className="text-xs font-medium">
                {paso.tipo_paso === 'inicio' ? 'Inicial' : 
                 (paso.tipo_paso === 'fin' ? 'Finalización' : 
                 (paso.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'))}
              </span>
            </div>
            {getBadgeVariant() && (
              <Badge variant={getBadgeVariant()} className="text-xs">
                {paso.estado}
              </Badge>
            )}
          </div>

          {paso.responsable_id && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <User className="w-3 h-3" />
              Responsable: {paso.responsable_id}
            </div>
          )}

          {/* Mostrar campos dinámicos para el paso inicial */}
          {esInicial && camposDinamicosIniciales && Object.keys(camposDinamicosIniciales).length > 0 && (
            <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">📋 Campos de Solicitud:</p>
              <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                {Object.entries(camposDinamicosIniciales).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="text-primary">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {data.readOnly !== true && paso.id_paso_solicitud !== 0 && paso.tipo_paso !== 'inicio' && paso.tipo_paso !== 'fin' && (
            <div className="flex gap-1 mt-2">
              {paso.estado === 'pendiente' && (
                <>
                  {paso.tipo_paso === 'aprobacion' ? (
                    <>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                        disabled={!isReady}
                        title={!isReady ? `Faltan ${readiness?.pendingParentIds?.length ?? 0} de ${readiness?.totalParents ?? 0} ramas` : ''}
                      >
                        ✓ Aprobar
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white hover:scale-105 transition-all duration-300"
                        disabled={!isReady}
                        title={!isReady ? `Faltan ${readiness?.pendingParentIds?.length ?? 0} de ${readiness?.totalParents ?? 0} ramas` : ''}
                      >
                        ✗ Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                      disabled={!isReady}
                      title={!isReady ? `Faltan ${readiness?.pendingParentIds?.length ?? 0} de ${readiness?.totalParents ?? 0} ramas` : ''}
                    >
                      ✓ Completar
                    </Button>
                  )}
                </>
              )}
              <Button 
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:scale-105 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeletePaso && confirm(`¿Eliminar el paso "${paso.nombre}"?`)) {
                    onDeletePaso(paso.id_paso_solicitud);
                  }
                }}
              >
                🗑️
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Overlay visual para nodos no listos: no afecta el canvas/SVG de react-flow */}
      {!isReady && paso.tipo_paso !== 'inicio' && (
        <div className="absolute inset-0 bg-white/60 rounded pointer-events-none" />
      )}
      
      {/* Handles para conexiones */}
      {paso.id_paso_solicitud !== 0 && paso.tipo_paso !== 'inicio' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 border-2 border-white rounded-full"
          style={{ backgroundColor: '#3b82f6' }}
          id="target"
        />
      )}
      
      {/* Handle normal (salida estándar) - todos los pasos excepto Fin */}
      {paso.tipo_paso !== 'fin' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 border-2 border-white rounded-full"
          style={{ backgroundColor: '#10b981', top: '40%' }}
          id="source-normal"
        />
      )}
      
      {/* Handle de excepción (salida roja) - solo para pasos de Aprobación */}
      {paso.tipo_paso === 'aprobacion' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 border-2 border-white rounded-full"
          style={{ backgroundColor: '#ef4444', top: '60%' }}
          id="source-excepcion"
        />
      )}
    </Card>
  );
};

const nodeTypes = {
  pasoNode: PasoNode,
};

export const DiagramaFlujo: React.FC<DiagramaFlujoProps> = ({
  pasos,
  caminos,
  readOnly = false,
  datosSolicitudIniciales,
  selectedNodeId,
  flujoActivoId, // Añadir esta prop
  onNodeSelect,
  onCreatePaso,
  onDeletePaso,
  onCreateConexion
}) => {
  const { stagePosition } = useBpm();
  // React Flow instance and viewport preservation
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const hasFittedRef = useRef(false);
  const lastViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const draftsByPasoId = useSelector((state: RootState) => state.bpm?.draftsByPasoId || {});
  
  // Convertir pasos a nodos de React Flow
  const initialNodes: Node[] = useMemo(() => {
    const nodesFromPasos: Node[] = pasos.map(paso => {
      const esInicial = paso.tipo_paso === 'inicio'; // Ahora identificamos por tipo_paso
      const nodeId = paso.id_paso_solicitud.toString();
      const draft = draftsByPasoId[paso.id_paso_solicitud];
      const posX = draft?.position?.x ?? paso.posicion_x ?? 0;
      const posY = draft?.position?.y ?? paso.posicion_y ?? 0;
      return {
        id: nodeId,
        type: 'pasoNode',
        position: { x: posX, y: posY },
        data: { 
          paso, 
          readOnly,
          // Pass the initial request data into the initial node only
          camposDinamicosIniciales: esInicial ? datosSolicitudIniciales : undefined,
          esInicial,
          isSelected: selectedNodeId === nodeId,
          onNodeClick: onNodeSelect,
          onDeletePaso
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: !readOnly,
        connectable: true, // Permitir conexiones desde/hacia este nodo
        selectable: true,
      } as Node;
    });

    // Ya no creamos el nodo sintético, todos los pasos vienen del backend
    return nodesFromPasos;
  }, [pasos, readOnly, datosSolicitudIniciales, selectedNodeId, onNodeSelect, onDeletePaso, draftsByPasoId]);

  // Convertir caminos a edges de React Flow
  const initialEdges: Edge[] = useMemo(() => 
    caminos.map(camino => ({
      id: camino.id_camino.toString(),
      source: camino.paso_origen_id.toString(),
      target: camino.paso_destino_id.toString(),
      sourceHandle: camino.es_excepcion ? 'source-excepcion' : 'source-normal', // Especificar el handle correcto
      targetHandle: 'target',
      type: 'default',
      animated: !camino.es_excepcion,
      style: { 
        stroke: camino.es_excepcion ? '#ef4444' : '#3b82f6',
        strokeWidth: 3,
        strokeDasharray: camino.es_excepcion ? '5,5' : 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      zIndex: 1000, // Elevar las conexiones por encima de los nodos
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: camino.es_excepcion ? '#ef4444' : '#3b82f6'
      },
      label: camino.nombre || (camino.es_excepcion ? '⚠️ Excepción' : undefined),
      labelStyle: camino.es_excepcion ? {
        fontSize: 11,
        fontWeight: 600,
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #ef4444',
      } : (camino.nombre ? {
        fontSize: 11, 
        fontWeight: 500,
        color: '#3b82f6',
        backgroundColor: '#ffffff',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #3b82f6',
      } : undefined),
    })), [caminos]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Función mejorada para actualizar posición del paso
  const handleNodeDragEnd: OnNodeDrag<Node> = useCallback((_event, node) => {
    const paso = pasos.find(p => p.id_paso_solicitud.toString() === node.id);
    if (paso) {
      stagePosition(paso.id_paso_solicitud, Math.round(node.position.x), Math.round(node.position.y));
    }
  }, [pasos, stagePosition]);

  // Personalizar onNodesChange para manejar el arrastre
  // Only stage position on explicit drag stop to avoid noisy drafts on re-sync
  const customOnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    // Intentionally do NOT stage positions here.
  }, [onNodesChange]);

  // Sincronizar nodos cuando cambien los pasos
  useEffect(() => {
    // Preserve current viewport before mutating nodes
    try {
      const vp = rfInstanceRef.current?.getViewport?.();
      if (vp && typeof vp.x === 'number') {
        lastViewportRef.current = { x: vp.x, y: vp.y, zoom: vp.zoom };
      }
    } catch {
      // ignore viewport retrieval errors
    }

    setNodes(currentNodes => {
      if (currentNodes.length === 0) return initialNodes;
      const existingNodesMap = new Map(currentNodes.map(node => [node.id, node]));
      const updatedNodes = initialNodes.map(newNode => {
        const existingNode = existingNodesMap.get(newNode.id);
        if (existingNode) {
          // Use backend-provided position so server changes are reflected
          return {
            ...existingNode,
            ...newNode,
            // Respect staged draft positions (already included in newNode.position)
            position: newNode.position,
            selected: existingNode.selected,
          };
        }
        return newNode;
      });
      return updatedNodes;
    });
    // Restore viewport after nodes update (next tick)
    queueMicrotask(() => {
      if (lastViewportRef.current) {
        const { x, y, zoom } = lastViewportRef.current;
        try { rfInstanceRef.current?.setViewport?.({ x, y, zoom }); } catch { /* ignore */ }
      }
    });
  }, [
    // Re-sync when names, states, or POSITIONS change in backend
    pasos.map(p => `${p.id_paso_solicitud}-${p.nombre}-${p.estado}-${p.posicion_x}-${p.posicion_y}`).join(','),
    initialNodes
  ]);

  // Sincronizar edges cuando cambien los caminos
  useEffect(() => {
    setEdges(currentEdges => {
      const tempEdges = currentEdges.filter(edge => edge.id.startsWith('connecting-'));
      const permanentEdges = currentEdges.filter(edge => !edge.id.startsWith('connecting-'));
      const existingPermanentMap = new Map(permanentEdges.map(edge => [edge.id, edge]));
      const updatedPermanentEdges = initialEdges.map(newEdge => {
        const existingEdge = existingPermanentMap.get(newEdge.id);
        if (existingEdge) {
          return {
            ...existingEdge,
            ...newEdge,
          };
        }
        return newEdge;
      });
      return [...updatedPermanentEdges, ...tempEdges];
    });
  }, [caminos.map(c => `${c.id_camino}-${c.paso_origen_id}-${c.paso_destino_id}-${c.nombre}`).join(',')]);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('🔗 Intentando crear conexión:', params);
      if (params.source && params.target) {
        // Obtener información de los pasos origen y destino
        const pasoOrigen = pasos.find(p => p.id_paso_solicitud.toString() === params.source);
        const pasoDestino = pasos.find(p => p.id_paso_solicitud.toString() === params.target);
        
        if (!pasoOrigen || !pasoDestino) {
          console.error('❌ No se encontró el paso origen o destino');
          return;
        }

        // Validación 1: No se puede conectar a pasos de tipo Inicio
        if (pasoDestino.tipo_paso === 'inicio') {
          toast({
            title: 'Conexión no permitida',
            description: 'No puedes conectar a un paso de tipo Inicio.',
            variant: 'destructive',
            duration: 4000
          });
          return;
        }

        // Validación 2: Determinar si es una conexión de excepción basada en el handle
        const esConexionExcepcion = params.sourceHandle === 'source-excepcion';
        
        // Validación 3: Solo pasos de Aprobación pueden crear conexiones de excepción
        if (esConexionExcepcion && pasoOrigen.tipo_paso !== 'aprobacion') {
          toast({
            title: 'Conexión de excepción no permitida',
            description: 'Solo los pasos de tipo Aprobación pueden tener caminos de excepción.',
            variant: 'destructive',
            duration: 4000
          });
          return;
        }

        // Limitar ramas salientes por nodo (máximo 10)
        const MAX_BRANCHES = 10;
        const outgoingCount = edges.filter(e => e.source === params.source).length;
        if (outgoingCount >= MAX_BRANCHES) {
          toast({
            title: `No se puede crear la conexión`,
            description: `El paso "${pasoOrigen.nombre}" ya tiene ${outgoingCount} ramas (máx ${MAX_BRANCHES}). Intentaste conectar a "${pasoDestino.nombre}".`,
            variant: 'destructive',
            duration: 6000
          });
          console.warn(`⚠️ Nodo ${params.source} ya tiene ${outgoingCount} ramas (máx ${MAX_BRANCHES}).`);
          return;
        }

        // Mostrar advertencia si se conecta a un paso Final
        if (pasoDestino.tipo_paso === 'fin') {
          const confirmar = window.confirm(
            `⚠️ Estás conectando a un paso Final.\n\nEsto cerrará el flujo inmediatamente cuando se llegue a este punto.\n\n¿Deseas continuar?`
          );
          if (!confirmar) return;
        }

        // Crear la conexión
        console.log('🔗 Creando conexión:', params.source, '→', params.target, 'esExcepcion:', esConexionExcepcion);
        
        const tempEdge: Edge = {
          id: `connecting-${params.source}-${params.target}-${esConexionExcepcion ? 'exc' : 'norm'}`,
          source: params.source,
          target: params.target,
          sourceHandle: esConexionExcepcion ? 'source-excepcion' : 'source-normal',
          targetHandle: 'target',
          type: 'default',
          animated: !esConexionExcepcion,
          style: { 
            stroke: esConexionExcepcion ? '#ef4444' : '#3b82f6',
            strokeWidth: 3,
            strokeDasharray: esConexionExcepcion ? '5,5' : 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          },
          zIndex: 1000, // Elevar las conexiones por encima de los nodos
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: esConexionExcepcion ? '#ef4444' : '#3b82f6'
          },
          label: esConexionExcepcion ? '⚠️ Excepción' : undefined,
          labelStyle: esConexionExcepcion ? {
            fontSize: 11,
            fontWeight: 600,
            color: '#ef4444',
            backgroundColor: '#fee2e2',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #ef4444',
          } : undefined,
        };
        setEdges(currentEdges => addEdge(tempEdge, currentEdges));
        
        console.log('📞 Llamando onCreateConexion con:', {
          source: parseInt(params.source),
          target: parseInt(params.target),
          esExcepcion: esConexionExcepcion,
          onCreateConexion: !!onCreateConexion
        });
        
        if (onCreateConexion) {
          onCreateConexion(parseInt(params.source), parseInt(params.target), esConexionExcepcion);
        } else {
          console.warn('⚠️ onCreateConexion no está definido');
        }
      }
    },
    [setEdges, pasos, edges, onCreateConexion]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!readOnly && event.detail === 2 && onCreatePaso) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const pasoData = {
          flujoActivoId: flujoActivoId,
          reglaAprobacion: "Unanimidad",
          tipoPaso: "Ejecucion",
          nombre: `Nuevo Paso ${pasos.length + 1}`,
          inputs: []
        };
        console.log('🆕 Creando nuevo paso:', pasos);
        onCreatePaso(pasoData);
        console.log('🆕 Creando nuevo paso en:', { x, y });
      }
    },
    [readOnly, pasos, onCreatePaso]
  );

  // Handler for the floating add button
  const handleAddPaso = useCallback(
    (tipo: 'aprobacion' | 'ejecucion') => {
      if (!onCreatePaso) return;
      
      // Calculate position for new step (place it in a grid-like pattern)
      const stepCount = pasos.length;
      const x = 100 + (stepCount % 4) * 300; // 4 steps per row
      const y = 100 + Math.floor(stepCount / 4) * 200; // New row every 4 steps
      
      const pasoData = {
        flujoActivoId: flujoActivoId,
        reglaAprobacion: tipo === 'aprobacion' ? "Unanimidad" : "Unanimidad",
        tipoPaso: tipo === 'aprobacion' ? "Aprobacion" : "Ejecucion", // Match the case from working example
        nombre: `Nuevo Paso ${tipo === 'aprobacion' ? 'Aprobación' : 'Ejecución'} ${pasos.length + 1}`,
        posicion_x: x,
        posicion_y: y,
        inputs: []
      };
      
      console.log(`🆕 Creando nuevo paso de ${tipo}:`, pasoData);
      onCreatePaso(pasoData);
    },
    [pasos.length, flujoActivoId, onCreatePaso]
  );

  return (
    <div className="w-full h-full border rounded-lg bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={customOnNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeDragStop={handleNodeDragEnd}
        nodeTypes={nodeTypes}
        // Only fitView on first mount; afterwards we maintain viewport
        fitView={!hasFittedRef.current}
        connectOnClick={false} // Evitar conexiones accidentales al hacer click
        nodesConnectable={!readOnly} // Permitir conexiones solo si no es readOnly
        elevateEdgesOnSelect={true} // Elevar las conexiones seleccionadas
        className="bg-gradient-to-br from-background to-muted/20"
        onInit={(instance) => {
          // initial fit and mark as done
          if (!hasFittedRef.current) {
            hasFittedRef.current = true;
            rfInstanceRef.current = instance;
            // capture initial viewport
            try { lastViewportRef.current = instance.getViewport?.() || null; } catch { /* ignore */ }
          }
        }}
        onMoveEnd={((_e, viewport) => {
          // Track viewport to restore across data refreshes
          lastViewportRef.current = viewport;
        }) as OnMoveEnd}
      >
        <Controls className="bg-background border shadow-lg" />
        <MiniMap 
          className="bg-background border shadow-lg"
          nodeColor={(node) => {
            const paso = pasos.find(p => p.id_paso_solicitud.toString() === node.id);
            if (!paso) return 'hsl(var(--primary))';
            if (paso.tipo_flujo === 'normal' && !paso.camino_id) return 'hsl(var(--secondary))';
            switch (paso.estado) {
              case 'aprobado': return 'hsl(var(--success))';
              case 'rechazado': return 'hsl(var(--destructive))';
              case 'excepcion': return 'hsl(var(--warning))';
              case 'pendiente': return 'hsl(var(--primary))';
              case 'entregado': return 'hsl(var(--info))';
              case 'cancelado': return 'hsl(var(--destructive))';
              default: return 'hsl(var(--primary))';
            }
          }}
        />
        <Background gap={20} size={1} className="opacity-30" />
      </ReactFlow>

      {/* Icono de ayuda con tooltip - SUPERIOR IZQUIERDA (más a la derecha) */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-6 left-24 z-50">
              <button className="h-12 w-12 rounded-full bg-white border border-input shadow-lg hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs p-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-2">Tipos de Conexión</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex-shrink-0" />
                  <span>Conexión Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
                  <span>Conexión de Excepción</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  <strong>Arrastre</strong> desde el punto verde para conexiones normales, 
                  o desde el punto rojo (solo en pasos de Aprobación) para excepciones.
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Floating Add Button - only show if not read-only */}
      {!readOnly && (
        <FloatingAddButton
          onAddPaso={handleAddPaso}
          disabled={!onCreatePaso}
        />
      )}
    </div>
  );
};