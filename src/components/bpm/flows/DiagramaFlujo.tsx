import React, { useCallback, useMemo, useEffect, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PasoSolicitud, CaminoParalelo } from '@/types/bpm/flow';
import { RelacionInput, CamposDinamicos } from '@/types/bpm/inputs';
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
  onUpdatePaso?: (id: number, data: unknown) => void;
  onDeletePaso?: (id: number) => void;
  onCreateConexion?: (id: number, destinoId: number, esExcepcion?: boolean) => void;
  onReplaceConexiones?: (id: number, destinos: number[]) => void;
  onDeleteConexion?: (id: number, destinoId: number) => void;
}

// Componente personalizado para nodos de paso
const PasoNode: React.FC<{ data: PasoNodeData }> = ({ data }) => {
  const { paso, camposDinamicosIniciales, esInicial, isSelected, onNodeClick, onDeletePaso } = data;
  
  const getIconByTipo = () => {
    // Special icon for initial step
    if (paso.tipo_paso === 'inicio') {
      return <Play className="w-4 h-4" />;
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
    switch (paso.estado) {
      case 'aprobado': return 'border-success bg-success/10';
      case 'rechazado': return 'border-destructive bg-destructive/10';
      case 'excepcion': return 'border-warning bg-warning/10';
      case 'pendiente': return 'border-muted bg-background';
      case 'entregado': return 'border-info bg-info/10';
      case 'cancelado': return 'border-destructive bg-destructive/10';
      default: return 'border-muted bg-background';
    }
  };

  const getBadgeVariant = () => {
    // Don't show estado badge for initial step
    if (paso.tipo_paso === 'inicio') return null;
    
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
    return paso.tipo_paso === 'aprobacion' ? 'text-orange-600' : 'text-blue-600';
  };

  return (
    <Card 
      className={`p-4 min-w-[220px] transition-all duration-300 cursor-pointer ${getColorByEstado()} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-glow' : 'hover:shadow-lg hover:scale-105'
      }`}
      onClick={() => {
        // Don't open editor for initial step
        if (paso.tipo_paso === 'inicio') return;
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
            </div>
          </div>
          

          {/* Indicador de tipo de paso */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 ${getTipoPasoColor()}`}>
              {getIconByTipoPaso()}
              <span className="text-xs font-medium">
                {paso.tipo_paso === 'inicio' ? 'Inicial' : 
                 (paso.tipo_paso === 'aprobacion' ? 'Aprobación' : 'Ejecución')}
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
          {data.readOnly !== true && paso.id_paso_solicitud !== 0 && (
            <div className="flex gap-1 mt-2">
              {paso.estado === 'pendiente' && (
                <>
                  {paso.tipo_paso === 'aprobacion' ? (
                    <>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                        disabled
                      >
                        ✓ Aprobar
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white hover:scale-105 transition-all duration-300"
                        disabled
                      >
                        ✗ Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                      disabled
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
      
      {/* Handles para conexiones */}
      {paso.id_paso_solicitud !== 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 border-2 border-white rounded-full"
          style={{ backgroundColor: '#3b82f6' }}
          id="target"
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 border-2 border-white rounded-full"
        style={{ backgroundColor: '#10b981' }}
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
  readOnly = false,
  datosSolicitudIniciales,
  selectedNodeId,
  flujoActivoId, // Añadir esta prop
  onNodeSelect,
  onCreatePaso,
  onUpdatePaso,
  onDeletePaso,
  onCreateConexion,
  onReplaceConexiones,
  onDeleteConexion
}) => {
  const [cardPosition, setCardPosition] = useState({ x: 16, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Convertir pasos a nodos de React Flow
  const initialNodes: Node[] = useMemo(() => {
    const nodesFromPasos: Node[] = pasos.map(paso => {
      const esInicial = paso.tipo_paso === 'inicio'; // Ahora identificamos por tipo_paso
      const nodeId = paso.id_paso_solicitud.toString();
      return {
        id: nodeId,
        type: 'pasoNode',
        position: { x: paso.posicion_x || 0, y: paso.posicion_y || 0 },
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
  }, [pasos, readOnly, datosSolicitudIniciales, selectedNodeId, onNodeSelect, onDeletePaso]);

  // Convertir caminos a edges de React Flow
  const initialEdges: Edge[] = useMemo(() => 
    caminos.map(camino => ({
      id: camino.id_camino.toString(),
      source: camino.paso_origen_id.toString(),
      target: camino.paso_destino_id.toString(),
      type: 'default',
      animated: !camino.es_excepcion,
      style: { 
        stroke: camino.es_excepcion ? '#f59e0b' : '#3b82f6',
        strokeWidth: 3,
        strokeDasharray: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: camino.es_excepcion ? '#f59e0b' : '#3b82f6'
      },
      label: camino.nombre,
      labelStyle: { 
        fontSize: 11, 
        fontWeight: 500,
        color: camino.es_excepcion ? '#f59e0b' : '#3b82f6',
        backgroundColor: '#ffffff',
        padding: '2px 6px',
        borderRadius: '4px',
        border: `1px solid ${camino.es_excepcion ? '#f59e0b' : '#3b82f6'}`,
      },
    })), [caminos]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Función mejorada para actualizar posición del paso
  const handleNodeDragEnd: OnNodeDrag<Node> = useCallback((_event, node) => {
    console.log('🎯 Node drag ended:', { id: node.id, position: node.position });
    const paso = pasos.find(p => p.id_paso_solicitud.toString() === node.id);
    if (paso && onUpdatePaso) {
      const pasoActualizado = {
        ...paso,
        posicion_x: Math.round(node.position.x),
        posicion_y: Math.round(node.position.y)
      };
      console.log('💾 Guardando nueva posición:', pasoActualizado);
      onUpdatePaso(paso.id_paso_solicitud, pasoActualizado);
    }
  }, [pasos, onUpdatePaso]);

  // Personalizar onNodesChange para manejar el arrastre
  const customOnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false && change.position) {
        const nodeId = change.id;
        const newPosition = change.position;
        const paso = pasos.find(p => p.id_paso_solicitud.toString() === nodeId);
        if (paso && onUpdatePaso) {
          const pasoActualizado = {
            ...paso,
            posicion_x: Math.round(newPosition.x),
            posicion_y: Math.round(newPosition.y)
          };
          console.log('💾 Actualizando posición del paso:', pasoActualizado);
          setTimeout(() => onUpdatePaso(paso.id_paso_solicitud, pasoActualizado), 0);
        }
      }
    });
  }, [onNodesChange, pasos, onUpdatePaso]);

  // Sincronizar nodos cuando cambien los pasos
  useEffect(() => {
    setNodes(currentNodes => {
      if (currentNodes.length === 0) return initialNodes;
      const existingNodesMap = new Map(currentNodes.map(node => [node.id, node]));
      const updatedNodes = initialNodes.map(newNode => {
        const existingNode = existingNodesMap.get(newNode.id);
        if (existingNode) {
          return {
            ...newNode,
            position: existingNode.position,
            selected: existingNode.selected,
            data: {
              ...newNode.data,
            }
          };
        }
        return newNode;
      });
      return updatedNodes;
    });
  }, [pasos.map(p => `${p.id_paso_solicitud}-${p.nombre}-${p.estado}`).join(',')]);

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
        // Permitir todas las conexiones sin restricciones
        console.log('🔗 Creando conexión:', params.source, '→', params.target);
        console.log('🔗 Creando conexión:', params.source, '→', params.target);
        const tempEdge: Edge = {
          id: `connecting-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          type: 'default',
          animated: true,
          style: { 
            stroke: '#3b82f6',
            strokeWidth: 3,
            strokeDasharray: 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: '#3b82f6'
          }
        };
        setEdges(currentEdges => addEdge(tempEdge, currentEdges));
        
        console.log('📞 Llamando onCreateConexion con:', {
          source: parseInt(params.source),
          target: parseInt(params.target),
          onCreateConexion: !!onCreateConexion
        });
        
        if (onCreateConexion) {
          onCreateConexion(parseInt(params.source), parseInt(params.target), false);
        } else {
          console.warn('⚠️ onCreateConexion no está definido');
        }
      }
    },
    [setEdges, pasos, onCreateConexion]
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

  const handleCardMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  }, [readOnly]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 150;
      setCardPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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
        fitView={true}
        connectOnClick={false} // Evitar conexiones accidentales al hacer click
        nodesConnectable={!readOnly} // Permitir conexiones solo si no es readOnly
        className="bg-gradient-to-br from-background to-muted/20"
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
      
      {!readOnly && (
        <div 
          className="absolute bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg cursor-move select-none"
          style={{ 
            left: `${cardPosition.x}px`, 
            top: `${cardPosition.y}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
          onMouseDown={handleCardMouseDown}
        >
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
                className="h-7 px-2 text-xs border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white hover:scale-105 transition-all duration-300"
                onClick={() => {
                  if (onCreatePaso) {
                    const pasoData = {
                      flujoActivoId: flujoActivoId,
                      reglaAprobacion: "Unanimidad",
                      tipoPaso: "Ejecucion",
                      nombre: `Nuevo Paso Ejecución ${pasos.length + 1}`,
                      inputs: []
                    };
                    onCreatePaso(pasoData);
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Ejecución
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white hover:scale-105 transition-all duration-300"
                onClick={() => {
                  if (onCreatePaso) {
                    const pasoData = {
                      flujoActivoId: flujoActivoId,
                      reglaAprobacion: "Unanimidad",
                      tipoPaso: "Aprobacion",
                      nombre: `Nuevo Paso Aprobación ${pasos.length + 1}`,
                      inputs: []
                    };
                    onCreatePaso(pasoData);
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