import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent
} from 'react';
import ReactFlow, {
  Background,
  ConnectionMode,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type OnSelectionChangeFunc
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAutoValidation } from '../../hooks/useAutoValidation';
import { useWorkflowStore } from '../../store/workflowStore';
import { useToastStore } from '../../store/toastStore';
import type { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';
import { nodeTypes } from '../nodes/nodeTypes';
import { NodeContextMenu } from './NodeContextMenu';

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

interface EdgeEditorState {
  edgeId: string;
  x: number;
  y: number;
  value: string;
}

function clampPopupPosition(
  x: number,
  y: number,
  popupWidth: number,
  popupHeight: number
): { x: number; y: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const safeX = Math.min(Math.max(8, x), Math.max(8, viewportWidth - popupWidth - 8));
  const safeY = Math.min(Math.max(8, y), Math.max(8, viewportHeight - popupHeight - 8));
  return { x: safeX, y: safeY };
}

interface CanvasContentProps {
  onMobileNodeEditRequest?: () => void;
}

interface WorkflowCanvasProps {
  onMobileNodeEditRequest?: () => void;
}

function CanvasContent({ onMobileNodeEditRequest }: CanvasContentProps) {
  const reactFlow = useReactFlow();
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const lastAddedNodeId = useWorkflowStore((state) => state.lastAddedNodeId);
  const clearLastAddedNodeId = useWorkflowStore((state) => state.clearLastAddedNodeId);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const addNode = useWorkflowStore((state) => state.addNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const removeNodeById = useWorkflowStore((state) => state.removeNodeById);
  const updateEdgeLabel = useWorkflowStore((state) => state.updateEdgeLabel);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const selectEdge = useWorkflowStore((state) => state.selectEdge);
  const clearSelection = useWorkflowStore((state) => state.clearSelection);
  const validation = useWorkflowStore((state) => state.validation);
  const addToast = useToastStore((state) => state.addToast);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [edgeEditor, setEdgeEditor] = useState<EdgeEditorState | null>(null);
  const isDraggingRef = useRef(false);
  const dragStopTimerRef = useRef<number | null>(null);
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      style: { stroke: '#7b8794', strokeWidth: 1.8 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#7b8794'
      }
    }),
    []
  );

  useAutoValidation();

  useEffect(() => {
    return () => {
      if (dragStopTimerRef.current) {
        window.clearTimeout(dragStopTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!lastAddedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === lastAddedNodeId);
    if (!node) {
      clearLastAddedNodeId();
      return;
    }

    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile) {
      const centerX = node.position.x + 105;
      const centerY = node.position.y + 52;
      reactFlow.setCenter(centerX, centerY, { zoom: Math.max(reactFlow.getZoom(), 1), duration: 240 });
    }
    clearLastAddedNodeId();
  }, [clearLastAddedNodeId, lastAddedNodeId, nodes, reactFlow]);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType | '';
      if (!type) {
        return;
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      addNode(type, position);
      setContextMenu(null);
      setEdgeEditor(null);
    },
    [addNode, reactFlow]
  );

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      if (selectedNodes.length > 0) {
        selectNode(selectedNodes[0].id);
        return;
      }
      if (selectedEdges.length > 0) {
        selectEdge(selectedEdges[0].id);
        return;
      }
      clearSelection();
    },
    [clearSelection, selectEdge, selectNode]
  );

  const onNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: Node<WorkflowNodeData>) => {
      event.preventDefault();
      event.stopPropagation();
      selectNode(node.id);
      setEdgeEditor(null);
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY
      });
    },
    [selectNode]
  );

  const onFitToScreen = useCallback(() => {
    reactFlow.fitView({ padding: 0.2, duration: 300 });
    addToast('Canvas fit to screen.', 'info');
  }, [addToast, reactFlow]);

  const onNodeClick = useCallback(
    (event: ReactMouseEvent, node: Node<WorkflowNodeData>) => {
      event.preventDefault();
      selectNode(node.id);
      if (isDraggingRef.current) {
        return;
      }
      if (!onMobileNodeEditRequest) {
        return;
      }
      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      if (isMobile) {
        onMobileNodeEditRequest();
      }
    },
    [onMobileNodeEditRequest, selectNode]
  );

  return (
    <div
      className="relative h-full w-full"
      onClick={() => {
        setContextMenu(null);
        setEdgeEditor(null);
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        onNodeDragStart={() => {
          if (dragStopTimerRef.current) {
            window.clearTimeout(dragStopTimerRef.current);
            dragStopTimerRef.current = null;
          }
          isDraggingRef.current = true;
          setContextMenu(null);
          setEdgeEditor(null);
        }}
        onNodeDragStop={() => {
          if (dragStopTimerRef.current) {
            window.clearTimeout(dragStopTimerRef.current);
          }
          dragStopTimerRef.current = window.setTimeout(() => {
            isDraggingRef.current = false;
            dragStopTimerRef.current = null;
          }, 120);
        }}
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          event.stopPropagation();
          selectEdge(edge.id);
          setContextMenu(null);
          const { x, y } = clampPopupPosition(event.clientX, event.clientY, 224, 132);
          setEdgeEditor({
            edgeId: edge.id,
            x,
            y,
            value: typeof edge.label === 'string' ? edge.label : ''
          });
        }}
        onPaneClick={() => {
          clearSelection();
          setContextMenu(null);
          setEdgeEditor(null);
        }}
        onPaneContextMenu={() => {
          setContextMenu(null);
          setEdgeEditor(null);
        }}
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={defaultEdgeOptions}
        style={{ backgroundColor: '#f8fafc' }}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable
        nodesConnectable
        fitView
        panOnDrag={false}
        panActivationKeyCode="Alt"
        zoomOnScroll
        deleteKeyCode={null}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          stroke: '#94a3b8',
          strokeWidth: 2,
          strokeDasharray: '6 4'
        }}
      >
        <MiniMap pannable zoomable style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} />
        <Background color="#e2e8f0" gap={20} />
        <Controls className="!scale-[0.9] sm:!scale-100" />
      </ReactFlow>

      <div className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] text-slate-600 shadow-sm sm:left-3 sm:top-3 sm:bottom-auto sm:max-w-sm sm:text-xs">
        <p className={validation.isValid ? 'text-emerald-700' : 'text-amber-700'}>
          {validation.isValid
            ? 'Validation: ready to simulate'
            : `Validation: ${validation.issues.filter((issue) => issue.level === 'error').length} error(s)`}
        </p>
        <p className="text-[10px] text-slate-500 sm:text-[11px]">
          Delete, Esc, Ctrl/Cmd+Z, Ctrl/Cmd+Y, Alt+Drag (Pan), tap node for details
        </p>
      </div>

      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
        <button
          type="button"
          onClick={onFitToScreen}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm hover:bg-slate-100"
        >
          Fit to screen
        </button>
      </div>

      {contextMenu ? (
        <NodeContextMenu
          x={clampPopupPosition(contextMenu.x, contextMenu.y, 160, 126).x}
          y={clampPopupPosition(contextMenu.x, contextMenu.y, 160, 126).y}
          onEdit={() => {
            selectNode(contextMenu.nodeId);
            setContextMenu(null);
            addToast('Node selected for editing.', 'info');
          }}
          onDuplicate={() => {
            duplicateNode(contextMenu.nodeId);
            setContextMenu(null);
          }}
          onDelete={() => {
            removeNodeById(contextMenu.nodeId);
            setContextMenu(null);
          }}
        />
      ) : null}

      {edgeEditor ? (
        <div
          className="fixed z-40 w-[min(14rem,calc(100vw-1rem))] rounded-md border border-slate-200 bg-white p-2 shadow-lg"
          style={{ left: edgeEditor.x, top: edgeEditor.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-1 text-[11px] font-medium text-slate-600">Connection text</p>
          <input
            autoFocus
            value={edgeEditor.value}
            placeholder="Type text for this line"
            onChange={(event) =>
              setEdgeEditor((prev) => (prev ? { ...prev, value: event.target.value } : prev))
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                updateEdgeLabel(edgeEditor.edgeId, edgeEditor.value);
                setEdgeEditor(null);
              }
              if (event.key === 'Escape') {
                setEdgeEditor(null);
              }
            }}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
          />
          <div className="mt-2 flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setEdgeEditor(null)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                updateEdgeLabel(edgeEditor.edgeId, edgeEditor.value);
                setEdgeEditor(null);
              }}
              className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-100"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WorkflowCanvas({ onMobileNodeEditRequest }: WorkflowCanvasProps = {}) {
  return (
    <div className="h-full min-h-[360px] w-full bg-slate-100 lg:min-h-0">
      <ReactFlowProvider>
        <CanvasContent onMobileNodeEditRequest={onMobileNodeEditRequest} />
      </ReactFlowProvider>
    </div>
  );
}
