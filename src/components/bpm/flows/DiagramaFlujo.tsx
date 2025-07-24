import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MiniMap,
  Position,
  Handle,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Settings,
  Users,
  FileText,
  Plus
} from 'lucide-react';

interface DiagramaFlujoProps {
  pasos: PasoSolicitud[];
  caminos: CaminoParalelo[];
  onActualizarPaso: (pasoId: number, estado: PasoSolicitud['estado']) => void;
  onAgregarPaso: (x: number, y: number, tipo_paso?: 'ejecucion' | 'aprobacion') => void;
  onCrearCamino: (origen: number, destino: number) => void;
  onEditarPaso?: (paso: PasoSolicitud) => void;
  readOnly?: boolean;
  camposDinamicosIniciales?: any; // Campos dinámicos de la solicitud original
  selectedNodeId?: string;
  onNodeSelect?: (paso: PasoSolicitud | null) => void;
}

// Componente personalizado para nodos de paso
const PasoNode: React.FC<{ data: any }> = ({ data }) => {
  const { paso, onActualizarEstado, onEditarPaso, camposDinamicosIniciales, esInicial, isSelected, onNodeClick } = data;
  
  const getIconByTipo = () => {
    switch (paso.tipo) {
      case 'inicio': return <Play className="w-4 h-4" />;
      case 'fin': return <CheckCircle className="w-4 h-4" />;
      case 'decision': return <AlertTriangle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getIconByTipoPaso = () => {
    return paso.tipo_paso === 'aprobacion' ? <Users className="w-3 h-3" /> : <FileText className="w-3 h-3" />;
  };

  const getColorByEstado = () => {
    switch (paso.estado) {
      case 'aprobado': return 'border-success bg-success/10';
      case 'rechazado': return 'border-destructive bg-destructive/10';
      case 'excepcion': return 'border-warning bg-warning/10';
      case 'completado': return 'border-info bg-info/10';
      default: return 'border-muted bg-background';
    }
  };

  const getBadgeVariant = () => {
    switch (paso.estado) {
      case 'aprobado': return 'default';
      case 'rechazado': return 'destructive';
      case 'excepcion': return 'secondary';
      case 'completado': return 'secondary';
      default: return 'outline';
    }
  };

  const getTipoPasoColor = () => {
    return paso.tipo_paso === 'aprobacion' ? 'text-orange-600' : 'text-blue-600';
  };

  return (
    <Card 
      className={`p-4 min-w-[220px] transition-all duration-200 cursor-pointer ${getColorByEstado()} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
      }`}
      onClick={() => onNodeClick?.(paso)}
    >
      <div className="flex items-start gap-3">
        <div className="text-primary mt-1">
          {getIconByTipo()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{paso.nombre}</h4>
          </div>
          
          {paso.descripcion && (
            <p className="text-xs text-muted-foreground mb-2">{paso.descripcion}</p>
          )}
          
          {/* Indicador de tipo de paso */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 ${getTipoPasoColor()}`}>
              {getIconByTipoPaso()}
              <span className="text-xs font-medium">
                {paso.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución'}
              </span>
            </div>
            <Badge variant={getBadgeVariant()} className="text-xs">
              {paso.estado}
            </Badge>
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

          {!data.readOnly && paso.estado === 'pendiente' && (
            <div className="flex gap-1">
              {paso.tipo_paso === 'aprobacion' ? (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-success text-success hover:bg-success/10"
                    onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'aprobado')}
                  >
                    Aprobar
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'rechazado')}
                  >
                    Rechazar
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs border-success text-success hover:bg-success/10"
                  onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'completado')}
                >
                  Completar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Handles para conexiones */}
      {/* Solo mostrar handle de entrada si NO es el paso inicial */}
      {!esInicial && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 bg-primary border-2 border-background rounded-full"
          id="target"
        />
      )}
      
      {/* Handle de salida para todos los pasos excepto el último */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-secondary border-2 border-background rounded-full"
        id="source"
      />
    </Card>
  );
};

const nodeTypes = {
  pasoNode: PasoNode,
};

export const DiagramaFlujo: React.FC<DiagramaFlujoProps> = ({
  pasos,
  caminos,
  onActualizarPaso,
  onAgregarPaso,
  onCrearCamino,
  onEditarPaso,
  readOnly = false,
  camposDinamicosIniciales,
  selectedNodeId,
  onNodeSelect
}) => {
  
  // Convertir pasos a nodos de React Flow
  const initialNodes: Node[] = useMemo(() => 
    pasos.map(paso => {
      const esInicial = paso.tipo === 'inicio';
      const nodeId = paso.id_paso_solicitud.toString();
      return {
        id: nodeId,
        type: 'pasoNode',
        position: { x: paso.posicion_x, y: paso.posicion_y },
        data: { 
          paso, 
          onActualizarEstado: onActualizarPaso,
          onEditarPaso,
          readOnly,
          camposDinamicosIniciales: esInicial ? camposDinamicosIniciales : undefined,
          esInicial,
          isSelected: selectedNodeId === nodeId,
          onNodeClick: onNodeSelect
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: !readOnly,
      };
    }), [pasos, onActualizarPaso, onEditarPaso, readOnly, camposDinamicosIniciales, selectedNodeId, onNodeSelect]
  );

  // Convertir caminos a edges de React Flow con mejor styling
  const initialEdges: Edge[] = useMemo(() => 
    caminos.map(camino => ({
      id: camino.id_camino.toString(),
      source: camino.paso_origen_id.toString(),
      target: camino.paso_destino_id.toString(),
      type: 'smoothstep',
      animated: !camino.es_excepcion,
      style: { 
        stroke: camino.es_excepcion ? 'hsl(var(--warning))' : 'hsl(var(--primary))',
        strokeWidth: 3,
        strokeDasharray: camino.es_excepcion ? '5,5' : undefined
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: camino.es_excepcion ? 'hsl(var(--warning))' : 'hsl(var(--primary))'
      },
      label: camino.nombre,
      labelStyle: { 
        fontSize: 11, 
        fontWeight: 500,
        color: camino.es_excepcion ? 'hsl(var(--warning))' : 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--background))',
        padding: '2px 6px',
        borderRadius: '4px',
        border: `1px solid ${camino.es_excepcion ? 'hsl(var(--warning))' : 'hsl(var(--primary))'}`,
      },
    })), [caminos]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Función mejorada para actualizar posición del paso
  const handleNodeDragEnd = useCallback((_event: any, node: Node) => {
    console.log('🎯 Node drag ended:', { id: node.id, position: node.position });
    
    // Buscar el paso correspondiente y actualizar su posición
    const paso = pasos.find(p => p.id_paso_solicitud.toString() === node.id);
    if (paso && onEditarPaso) {
      const pasoActualizado = {
        ...paso,
        posicion_x: Math.round(node.position.x),
        posicion_y: Math.round(node.position.y)
      };
      console.log('💾 Guardando nueva posición:', pasoActualizado);
      onEditarPaso(pasoActualizado);
    }
  }, [pasos, onEditarPaso]);

  // Personalizar onNodesChange para manejar el arrastre
  const customOnNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    // Buscar cambios de posición cuando termina el drag
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false && change.position) {
        // El nodo terminó de moverse, actualizar posición
        const nodeId = change.id;
        const newPosition = change.position;
        
        const paso = pasos.find(p => p.id_paso_solicitud.toString() === nodeId);
        if (paso && onEditarPaso) {
          const pasoActualizado = {
            ...paso,
            posicion_x: Math.round(newPosition.x),
            posicion_y: Math.round(newPosition.y)
          };
          console.log('💾 Actualizando posición del paso:', pasoActualizado);
          
          // Usar setTimeout para evitar conflictos con el re-render
          setTimeout(() => {
            onEditarPaso(pasoActualizado);
          }, 0);
        }
      }
    });
  }, [onNodesChange, pasos, onEditarPaso]);

  // Sincronizar nodos cuando cambien los pasos (sin resetear posiciones durante drag)
  useEffect(() => {
    setNodes(currentNodes => {
      // Si ya tenemos nodos, mantener las posiciones actuales y solo actualizar datos
      if (currentNodes.length > 0) {
        return initialNodes.map(newNode => {
          const existingNode = currentNodes.find(n => n.id === newNode.id);
          if (existingNode) {
            // Mantener la posición actual si el nodo existe
            return {
              ...newNode,
              position: existingNode.position
            };
          }
          return newNode;
        });
      }
      // Si no hay nodos previos, usar las posiciones iniciales
      return initialNodes;
    });
  }, [pasos.length, setNodes]); // Solo re-sincronizar cuando cambie el número de pasos

  // Sincronizar edges cuando cambien los caminos CON PROTECCIÓN
  useEffect(() => {
    setEdges(currentEdges => {
      // Mantener edges temporales (conexiones en proceso) y permanentes existentes
      const tempEdges = currentEdges.filter(edge => edge.id.startsWith('connecting-'));
      const permanentEdges = currentEdges.filter(edge => !edge.id.startsWith('connecting-'));
      
      // Solo actualizar si realmente hay cambios en los caminos principales
      const hasNewPermanentEdges = initialEdges.some(newEdge => 
        !permanentEdges.some(existingEdge => existingEdge.id === newEdge.id)
      );
      
      if (hasNewPermanentEdges || tempEdges.length > 0) {
        // Combinar edges iniciales con los temporales
        return [...initialEdges, ...tempEdges];
      }
      
      // Si no hay cambios significativos, mantener el estado actual
      return currentEdges;
    });
  }, [initialEdges.length]); // Solo cuando cambie la cantidad de caminos

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        // Verificar que no se esté intentando conectar HACIA el paso inicial
        const pasoTarget = pasos.find(p => p.id_paso_solicitud.toString() === params.target);
        
        if (pasoTarget?.tipo === 'inicio') {
          // No permitir conexiones hacia el paso inicial
          console.warn('No se pueden crear conexiones hacia el paso inicial');
          return;
        }
        
        console.log('🔗 Creando conexión:', params.source, '→', params.target);
        
        // Crear la conexión inmediatamente en el estado local
        const tempEdge: Edge = {
          id: `connecting-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: 'hsl(var(--primary))',
            strokeWidth: 3
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'hsl(var(--primary))'
          }
        };
        
        setEdges(currentEdges => addEdge(tempEdge, currentEdges));
        
        // Notificar al hook para que actualice el estado
        onCrearCamino(parseInt(params.source), parseInt(params.target));
      }
    },
    [onCrearCamino, setEdges, pasos]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!readOnly && event.detail === 2) { // Doble click
        const bounds = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        onAgregarPaso(x, y);
      }
    },
    [onAgregarPaso, readOnly]
  );

  return (
    <div className="w-full h-[600px] border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={customOnNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeDragStop={handleNodeDragEnd}
        nodeTypes={nodeTypes}
        fitView={false}
        className="bg-gradient-to-br from-background to-muted/20"
      >
        <Controls className="bg-background border shadow-lg" />
        <MiniMap 
          className="bg-background border shadow-lg"
          nodeColor={(node) => {
            const paso = pasos.find(p => p.id_paso_solicitud.toString() === node.id);
            if (!paso) return 'hsl(var(--primary))';
            
            // Color especial para el paso inicial
            if (paso.tipo === 'inicio') return 'hsl(var(--secondary))';
            
            switch (paso.estado) {
              case 'aprobado': return 'hsl(var(--success))';
              case 'rechazado': return 'hsl(var(--destructive))';
              case 'excepcion': return 'hsl(var(--warning))';
              case 'completado': return 'hsl(var(--info))';
              default: return 'hsl(var(--primary))';
            }
          }}
        />
        <Background gap={20} size={1} className="opacity-30" />
      </ReactFlow>
      
      {!readOnly && (
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 Doble click para agregar paso • Arrastra desde <span className="text-secondary font-medium">●</span> para conectar pasos
            </p>
            <p className="text-xs text-info">
              🎯 El paso inicial <span className="text-secondary font-medium">siempre</span> es el punto de partida del flujo
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const rect = document.querySelector('.react-flow')?.getBoundingClientRect();
                  if (rect) {
                    onAgregarPaso(Math.random() * 400 + 100, Math.random() * 300 + 100, 'ejecucion');
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Ejecución
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const rect = document.querySelector('.react-flow')?.getBoundingClientRect();
                  if (rect) {
                    onAgregarPaso(Math.random() * 400 + 100, Math.random() * 300 + 100, 'aprobacion');
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Aprobación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};