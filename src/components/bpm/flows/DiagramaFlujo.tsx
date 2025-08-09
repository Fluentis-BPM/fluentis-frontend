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
  onActualizarEstado: (pasoId: number, estado: PasoSolicitud['estado']) => void;
  onEditarPaso?: (paso: PasoSolicitud) => void;
  camposDinamicosIniciales?: RelacionInput[] | CamposDinamicos | Record<string, string>;
  esInicial: boolean;
  isSelected: boolean;
  onNodeClick?: (paso: PasoSolicitud) => void;
  readOnly?: boolean;
}

interface DiagramaFlujoProps {
  pasos: PasoSolicitud[];
  caminos: CaminoParalelo[];
  onActualizarPaso: (pasoId: number, estado: PasoSolicitud['estado']) => void;
  onAgregarPaso: (x: number, y: number, tipo_paso?: 'ejecucion' | 'aprobacion') => void;
  onCrearCamino: (origen: number, destino: number) => void;
  onEditarPaso?: (paso: PasoSolicitud) => void;
  readOnly?: boolean;
  camposDinamicosIniciales?: RelacionInput[] | CamposDinamicos; // Campos dinámicos de la solicitud original
  selectedNodeId?: string;
  onNodeSelect?: (paso: PasoSolicitud | null) => void;
}

// Componente personalizado para nodos de paso
const PasoNode: React.FC<{ data: PasoNodeData }> = ({ data }) => {
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
      className={`p-4 min-w-[220px] transition-all duration-300 cursor-pointer ${getColorByEstado()} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-glow' : 'hover:shadow-lg hover:scale-105'
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
                    className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                    onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'aprobado')}
                  >
                    ✓ Aprobar
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white hover:scale-105 transition-all duration-300"
                    onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'rechazado')}
                  >
                    ✗ Rechazar
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs border-success text-success hover:bg-success hover:text-white hover:scale-105 transition-all duration-300"
                  onClick={() => onActualizarEstado(paso.id_paso_solicitud, 'completado')}
                >
                  ✓ Completar
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
          className="w-4 h-4 border-2 border-white rounded-full"
          style={{ backgroundColor: '#3b82f6' }} // Azul específico
          id="target"
        />
      )}
      
      {/* Handle de salida para todos los pasos excepto el último */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 border-2 border-white rounded-full"
        style={{ backgroundColor: '#10b981' }} // Verde específico
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
  // State for draggable instructions card
  const [cardPosition, setCardPosition] = useState({ x: 16, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
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
      type: 'default', // Cambiado de 'smoothstep' a 'default' para evitar problemas con líneas punteadas
      animated: !camino.es_excepcion,
      style: { 
        stroke: camino.es_excepcion ? '#f59e0b' : '#3b82f6', // Colores específicos: amarillo para excepción, azul para normal
        strokeWidth: 3,
        strokeDasharray: 'none', // Forzar línea sólida
        strokeLinecap: 'round', // Extremos redondeados
        strokeLinejoin: 'round' // Uniones redondeadas
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12, // Reducido de 20 a 12
        height: 12, // Reducido de 20 a 12
        color: camino.es_excepcion ? '#f59e0b' : '#3b82f6' // Mismos colores para las flechas
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
  const customOnNodesChange = useCallback((changes: NodeChange[]) => {
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

  // Sincronizar nodos cuando cambien los pasos (MEJORADO para mantener posiciones)
  useEffect(() => {
    setNodes(currentNodes => {
      // Si no tenemos nodos actuales, usar los iniciales
      if (currentNodes.length === 0) {
        return initialNodes;
      }

      // Crear un mapa de nodos existentes por ID para búsqueda rápida
      const existingNodesMap = new Map(currentNodes.map(node => [node.id, node]));

      // Actualizar nodos existentes y agregar nuevos
      const updatedNodes = initialNodes.map(newNode => {
        const existingNode = existingNodesMap.get(newNode.id);
        
        if (existingNode) {
          // Mantener la posición actual del nodo existente
          return {
            ...newNode,
            position: existingNode.position, // Preservar posición
            selected: existingNode.selected, // Preservar estado de selección
            data: {
              ...newNode.data,
              // Actualizar solo los datos del paso, no la posición
            }
          };
        }
        
        // Si es un nodo nuevo, usar la posición inicial
        return newNode;
      });

      return updatedNodes;
    });
  }, [pasos.map(p => `${p.id_paso_solicitud}-${p.nombre}-${p.estado}`).join(',')]); // Solo actualizar si cambian los datos relevantes, no las posiciones

  // Sincronizar edges cuando cambien los caminos (MEJORADO para mantener conexiones)
  useEffect(() => {
    setEdges(currentEdges => {
      // Separar edges temporales y permanentes
      const tempEdges = currentEdges.filter(edge => edge.id.startsWith('connecting-'));
      const permanentEdges = currentEdges.filter(edge => !edge.id.startsWith('connecting-'));
      
      // Crear un mapa de edges permanentes existentes
      const existingPermanentMap = new Map(permanentEdges.map(edge => [edge.id, edge]));
      
      // Actualizar edges permanentes existentes y agregar nuevos
      const updatedPermanentEdges = initialEdges.map(newEdge => {
        const existingEdge = existingPermanentMap.get(newEdge.id);
        
        if (existingEdge) {
          // Mantener el edge existente pero actualizar sus propiedades si es necesario
          return {
            ...existingEdge,
            ...newEdge, // Aplicar actualizaciones de estilo o etiquetas
          };
        }
        
        // Si es un edge nuevo, agregarlo
        return newEdge;
      });

      // Combinar edges permanentes actualizados con temporales
      return [...updatedPermanentEdges, ...tempEdges];
    });
  }, [caminos.map(c => `${c.id_camino}-${c.paso_origen_id}-${c.paso_destino_id}-${c.nombre}`).join(',')]); // Solo actualizar si cambian los datos del camino

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
          type: 'default', // Cambiado de 'smoothstep' a 'default'
          animated: true,
          style: { 
            stroke: '#3b82f6', // Azul específico
            strokeWidth: 3,
            strokeDasharray: 'none', // Forzar línea sólida
            strokeLinecap: 'round', // Extremos redondeados
            strokeLinejoin: 'round' // Uniones redondeadas
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12, // Reducido de 20 a 12
            height: 12, // Reducido de 20 a 12
            color: '#3b82f6' // Azul específico
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

  // Drag handlers for instructions card
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
      
      // Keep card within viewport bounds
      const maxX = window.innerWidth - 300; // Card width approximation
      const maxY = window.innerHeight - 150; // Card height approximation
      
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
                className="h-7 px-2 text-xs border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white hover:scale-105 transition-all duration-300"
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