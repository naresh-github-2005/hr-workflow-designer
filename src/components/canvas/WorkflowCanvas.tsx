import { useCallback, useMemo, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
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

function CanvasContent() {
  const reactFlow = useReactFlow();
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
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

  return (
    <div className="relative h-full w-full" onClick={() => setContextMenu(null)}>
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
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          event.stopPropagation();
          selectEdge(edge.id);
          setContextMenu(null);
          setEdgeEditor({
            edgeId: edge.id,
            x: event.clientX,
            y: event.clientY,
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
        <Controls />
      </ReactFlow>

      <div className="pointer-events-none absolute left-3 top-3 rounded border border-slate-200 bg-white/95 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
        <p className={validation.isValid ? 'text-emerald-700' : 'text-amber-700'}>
          {validation.isValid
            ? 'Validation: ready to simulate'
            : `Validation: ${validation.issues.filter((issue) => issue.level === 'error').length} error(s)`}
        </p>
        <p className="text-[11px] text-slate-500">
          Delete, Esc, Ctrl/Cmd+Z, Ctrl/Cmd+Y, Alt+Drag (Pan)
        </p>
      </div>

      <div className="absolute right-3 top-3">
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
          x={contextMenu.x}
          y={contextMenu.y}
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
          className="fixed z-40 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg"
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

export function WorkflowCanvas() {
  return (
    <div className="h-full w-full bg-slate-100">
      <ReactFlowProvider>
        <CanvasContent />
      </ReactFlowProvider>
    </div>
  );
}
