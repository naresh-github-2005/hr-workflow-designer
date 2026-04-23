import { MarkerType, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import type {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  OnEdgesChange,
  OnNodesChange,
  XYPosition
} from 'reactflow';
import { create } from 'zustand';
import type {
  SerializedWorkflow,
  ValidationResult,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowTemplateId
} from '../types/workflow';
import { createId } from '../utils/id';
import { createWorkflowNode } from '../utils/nodeFactory';
import { getWorkflowTemplate } from '../utils/templates';
import { validateWorkflow } from '../validation/workflowValidator';
import { useToastStore } from './toastStore';

const MAX_HISTORY = 300;
const EDGE_BASE_STYLE = { stroke: '#7b8794', strokeWidth: 1.8 };
const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: '#7b8794',
  width: 18,
  height: 18
} as const;

interface GraphSnapshot {
  nodes: WorkflowNode[];
  edges: Edge[];
}

interface WorkflowStoreState {
  nodes: WorkflowNode[];
  edges: Edge[];
  lastAddedNodeId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  validation: ValidationResult;
  past: GraphSnapshot[];
  future: GraphSnapshot[];
  setNodes: (nodes: WorkflowNode[] | ((nodes: WorkflowNode[]) => WorkflowNode[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: WorkflowNodeType, position: XYPosition) => void;
  duplicateNode: (nodeId: string) => void;
  removeNodeById: (nodeId: string) => void;
  removeSelectedNode: () => void;
  removeSelectedEdge: () => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  clearLastAddedNodeId: () => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;
  updateSelectedNode: (updater: (data: WorkflowNodeData) => WorkflowNodeData) => void;
  undo: () => void;
  redo: () => void;
  loadTemplate: (templateId: WorkflowTemplateId) => void;
  loadSerialized: (workflow: SerializedWorkflow) => void;
  validate: () => ValidationResult;
  serialize: () => SerializedWorkflow;
  reset: () => void;
}

const emptyValidation: ValidationResult = { isValid: false, issues: [] };

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function withEdgeDefaults(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? false,
    style: { ...EDGE_BASE_STYLE, ...edge.style },
    markerEnd: edge.markerEnd ?? EDGE_MARKER,
    labelStyle:
      edge.labelStyle ??
      (typeof edge.label === 'string' && edge.label.trim()
        ? { fill: '#334155', fontSize: 11, fontWeight: 600 }
        : undefined),
    labelBgStyle:
      edge.labelBgStyle ??
      (typeof edge.label === 'string' && edge.label.trim()
        ? { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 }
        : undefined),
    labelBgPadding:
      edge.labelBgPadding ??
      (typeof edge.label === 'string' && edge.label.trim() ? [8, 4] : undefined),
    labelBgBorderRadius:
      edge.labelBgBorderRadius ??
      (typeof edge.label === 'string' && edge.label.trim() ? 12 : undefined)
  }));
}

function snapshotFromGraph(nodes: WorkflowNode[], edges: Edge[]): GraphSnapshot {
  return {
    nodes: deepClone(nodes),
    edges: deepClone(edges)
  };
}

function graphChanged(
  currentNodes: WorkflowNode[],
  currentEdges: Edge[],
  nextNodes: WorkflowNode[],
  nextEdges: Edge[]
): boolean {
  return (
    JSON.stringify(currentNodes) !== JSON.stringify(nextNodes) ||
    JSON.stringify(currentEdges) !== JSON.stringify(nextEdges)
  );
}

function pushHistory(state: WorkflowStoreState): GraphSnapshot[] {
  return [...state.past, snapshotFromGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
}

function toast(message: string, variant: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
  useToastStore.getState().addToast(message, variant);
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  lastAddedNodeId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  validation: emptyValidation,
  past: [],
  future: [],

  setNodes: (nodes) =>
    set((state) => {
      const nextNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
      if (!graphChanged(state.nodes, state.edges, nextNodes, state.edges)) {
        return { nodes: nextNodes };
      }
      return {
        nodes: nextNodes,
        lastAddedNodeId: null,
        past: pushHistory(state),
        future: []
      };
    }),

  setEdges: (edges) =>
    set((state) => {
      const nextEdges = withEdgeDefaults(typeof edges === 'function' ? edges(state.edges) : edges);
      if (!graphChanged(state.nodes, state.edges, state.nodes, nextEdges)) {
        return { edges: nextEdges };
      }
      return {
        edges: nextEdges,
        lastAddedNodeId: null,
        past: pushHistory(state),
        future: []
      };
    }),

  onNodesChange: (changes: NodeChange[]) => {
    const removedCount = changes.filter((change) => change.type === 'remove').length;

    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      const nodeIds = new Set(nextNodes.map((node) => node.id));
      const filteredEdges = state.edges.filter(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
      const nextEdges = withEdgeDefaults(filteredEdges);

      const shouldRecordHistory =
        changes.some((change) => {
          if (change.type === 'select' || change.type === 'dimensions') {
            return false;
          }
          if (change.type === 'position' && 'dragging' in change) {
            return !change.dragging;
          }
          return true;
        }) || nextEdges.length !== state.edges.length;

      const nextSelectedNodeId =
        state.selectedNodeId && nodeIds.has(state.selectedNodeId) ? state.selectedNodeId : null;
      const nextSelectedEdgeId =
        state.selectedEdgeId && nextEdges.some((edge) => edge.id === state.selectedEdgeId)
          ? state.selectedEdgeId
          : null;

      if (!shouldRecordHistory || !graphChanged(state.nodes, state.edges, nextNodes, nextEdges)) {
        return {
          nodes: nextNodes,
          edges: nextEdges,
          selectedNodeId: nextSelectedNodeId,
          selectedEdgeId: nextSelectedEdgeId
        };
      }

      return {
        nodes: nextNodes,
        edges: nextEdges,
        lastAddedNodeId: null,
        selectedNodeId: nextSelectedNodeId,
        selectedEdgeId: nextSelectedEdgeId,
        past: pushHistory(state),
        future: []
      };
    });

    if (removedCount > 0) {
      toast(`${removedCount} node removed.`, 'warning');
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const removedCount = changes.filter((change) => change.type === 'remove').length;

    set((state) => {
      const nextEdges = withEdgeDefaults(applyEdgeChanges(changes, state.edges));
      const shouldRecordHistory = changes.some((change) => change.type !== 'select');
      const nextSelectedEdgeId =
        state.selectedEdgeId && nextEdges.some((edge) => edge.id === state.selectedEdgeId)
          ? state.selectedEdgeId
          : null;

      if (!shouldRecordHistory || !graphChanged(state.nodes, state.edges, state.nodes, nextEdges)) {
        return {
          edges: nextEdges,
          selectedEdgeId: nextSelectedEdgeId
        };
      }

      return {
        edges: nextEdges,
        lastAddedNodeId: null,
        selectedEdgeId: nextSelectedEdgeId,
        past: pushHistory(state),
        future: []
      };
    });

    if (removedCount > 0) {
      toast(`${removedCount} connection removed.`, 'warning');
    }
  },

  onConnect: (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    set((state) => {
      const nextEdges = withEdgeDefaults(
        addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`
          },
          state.edges
        )
      );

      return {
        edges: nextEdges,
        lastAddedNodeId: null,
        selectedEdgeId: null,
        past: pushHistory(state),
        future: []
      };
    });

    toast('Nodes connected.', 'success');
  },

  addNode: (type: WorkflowNodeType, position: XYPosition) => {
    const node = createWorkflowNode(type, position);

    set((state) => ({
      nodes: [...state.nodes, node],
      lastAddedNodeId: node.id,
      selectedNodeId: node.id,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));

    toast(`${node.data.type} node added.`, 'success');
  },

  duplicateNode: (nodeId: string) => {
    const existingNode = get().nodes.find((node) => node.id === nodeId);
    if (!existingNode) {
      return;
    }

    const duplicatedNode: WorkflowNode = {
      ...deepClone(existingNode),
      id: createId(existingNode.data.type),
      position: {
        x: existingNode.position.x + 40,
        y: existingNode.position.y + 40
      },
      selected: false
    };

    set((state) => ({
      nodes: [...state.nodes, duplicatedNode],
      lastAddedNodeId: duplicatedNode.id,
      selectedNodeId: duplicatedNode.id,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));

    toast('Node duplicated.', 'success');
  },

  removeNodeById: (nodeId: string) => {
    const existingNode = get().nodes.find((node) => node.id === nodeId);
    if (!existingNode) {
      return;
    }

    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: withEdgeDefaults(
        state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      ),
      lastAddedNodeId: null,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));

    toast('Node deleted.', 'warning');
  },

  removeSelectedNode: () => {
    const nodeId = get().selectedNodeId;
    if (!nodeId) {
      return;
    }
    get().removeNodeById(nodeId);
  },

  removeSelectedEdge: () => {
    const edgeId = get().selectedEdgeId;
    if (!edgeId) {
      return;
    }

    set((state) => ({
      edges: withEdgeDefaults(state.edges.filter((edge) => edge.id !== edgeId)),
      lastAddedNodeId: null,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));

    toast('Connection deleted.', 'warning');
  },

  updateEdgeLabel: (edgeId: string, label: string) => {
    set((state) => {
      const currentEdge = state.edges.find((edge) => edge.id === edgeId);
      if (!currentEdge) {
        return state;
      }

      const nextEdges = withEdgeDefaults(
        state.edges.map((edge) => {
          if (edge.id !== edgeId) {
            return edge;
          }
          const normalizedLabel = label.trim();
          return {
            ...edge,
            label: normalizedLabel,
            labelStyle: normalizedLabel
              ? { fill: '#334155', fontSize: 11, fontWeight: 600 }
              : undefined,
            labelBgStyle: normalizedLabel
              ? { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 }
              : undefined,
            labelBgPadding: normalizedLabel ? [8, 4] : undefined,
            labelBgBorderRadius: normalizedLabel ? 12 : undefined
          };
        })
      );

      if (!graphChanged(state.nodes, state.edges, state.nodes, nextEdges)) {
        return state;
      }

      return {
        edges: nextEdges,
        lastAddedNodeId: null,
        past: pushHistory(state),
        future: []
      };
    });

    toast('Connection label updated.', 'success');
  },

  selectNode: (id: string | null) =>
    set({
      selectedNodeId: id,
      selectedEdgeId: null
    }),

  selectEdge: (id: string | null) =>
    set({
      selectedNodeId: null,
      selectedEdgeId: id
    }),

  clearSelection: () =>
    set({
      selectedNodeId: null,
      selectedEdgeId: null
    }),

  clearLastAddedNodeId: () =>
    set({
      lastAddedNodeId: null
    }),

  updateSelectedNode: (updater) =>
    set((state) => {
      if (!state.selectedNodeId) {
        return state;
      }

      const currentNode = state.nodes.find((node) => node.id === state.selectedNodeId);
      if (!currentNode) {
        return state;
      }

      const nextData = updater(currentNode.data);
      if (JSON.stringify(nextData) === JSON.stringify(currentNode.data)) {
        return state;
      }

      const nextNodes = state.nodes.map((node) =>
        node.id === state.selectedNodeId
          ? {
              ...node,
              data: nextData
            }
          : node
      );

      return {
        nodes: nextNodes,
        lastAddedNodeId: null,
        past: pushHistory(state),
        future: []
      };
    }),

  undo: () => {
    if (get().past.length === 0) {
      return;
    }

    set((state) => {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const current = snapshotFromGraph(state.nodes, state.edges);

      return {
        nodes: deepClone(previous.nodes),
        edges: withEdgeDefaults(deepClone(previous.edges)),
        lastAddedNodeId: null,
        selectedNodeId: null,
        selectedEdgeId: null,
        past: state.past.slice(0, -1),
        future: [current, ...state.future].slice(0, MAX_HISTORY)
      };
    });

    toast('Undo applied.', 'info');
  },

  redo: () => {
    if (get().future.length === 0) {
      return;
    }

    set((state) => {
      if (state.future.length === 0) {
        return state;
      }

      const next = state.future[0];
      const current = snapshotFromGraph(state.nodes, state.edges);

      return {
        nodes: deepClone(next.nodes),
        edges: withEdgeDefaults(deepClone(next.edges)),
        lastAddedNodeId: null,
        selectedNodeId: null,
        selectedEdgeId: null,
        past: [...state.past, current].slice(-MAX_HISTORY),
        future: state.future.slice(1)
      };
    });

    toast('Redo applied.', 'info');
  },

  loadTemplate: (templateId: WorkflowTemplateId) => {
    const template = getWorkflowTemplate(templateId);

    set((state) => ({
      nodes: deepClone(template.nodes),
      edges: withEdgeDefaults(deepClone(template.edges)),
      lastAddedNodeId: null,
      selectedNodeId: null,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));

    toast('Template loaded.', 'success');
  },

  loadSerialized: (workflow: SerializedWorkflow) => {
    set((state) => ({
      nodes: deepClone(workflow.nodes),
      edges: withEdgeDefaults(deepClone(workflow.edges)),
      lastAddedNodeId: null,
      selectedNodeId: null,
      selectedEdgeId: null,
      past: pushHistory(state),
      future: []
    }));
  },

  validate: () => {
    const state = get();
    const result = validateWorkflow(state.nodes, state.edges);
    set({ validation: result });
    return result;
  },

  serialize: () => {
    const state = get();
    return {
      nodes: state.nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: node.data
      })),
      edges: state.edges
    };
  },

  reset: () => {
    set((state) => ({
      nodes: [],
      edges: [],
      lastAddedNodeId: null,
      selectedNodeId: null,
      selectedEdgeId: null,
      validation: emptyValidation,
      past: pushHistory(state),
      future: []
    }));

    toast('Canvas cleared.', 'info');
  }
}));
