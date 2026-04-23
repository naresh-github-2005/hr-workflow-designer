import type {
  ApprovalNodeData,
  AutomationNodeData,
  EndNodeData,
  StartNodeData,
  TaskNodeData
} from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';
import { useAutomations } from '../../hooks/useAutomations';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomationNodeForm } from './AutomationNodeForm';
import { EndNodeForm } from './EndNodeForm';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';

export function NodeConfigPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateSelectedNode = useWorkflowStore((state) => state.updateSelectedNode);
  const removeSelectedNode = useWorkflowStore((state) => state.removeSelectedNode);
  const removeSelectedEdge = useWorkflowStore((state) => state.removeSelectedEdge);
  const { actions, loading, error } = useAutomations();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Node configuration</h2>
        {selectedNode ? (
          <button
            onClick={removeSelectedNode}
            className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
          >
            Delete node
          </button>
        ) : null}
      </div>

      {selectedNode ? (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">Node ID: {selectedNode.id}</p>

          {selectedNode.data.type === 'start' && (
            <StartNodeForm
              data={selectedNode.data as StartNodeData}
              onChange={(nextData) => updateSelectedNode(() => nextData)}
            />
          )}

          {selectedNode.data.type === 'task' && (
            <TaskNodeForm
              data={selectedNode.data as TaskNodeData}
              onChange={(nextData) => updateSelectedNode(() => nextData)}
            />
          )}

          {selectedNode.data.type === 'approval' && (
            <ApprovalNodeForm
              data={selectedNode.data as ApprovalNodeData}
              onChange={(nextData) => updateSelectedNode(() => nextData)}
            />
          )}

          {selectedNode.data.type === 'automation' && (
            <AutomationNodeForm
              data={selectedNode.data as AutomationNodeData}
              actions={actions}
              onChange={(nextData) => updateSelectedNode(() => nextData)}
            />
          )}

          {selectedNode.data.type === 'end' && (
            <EndNodeForm
              data={selectedNode.data as EndNodeData}
              onChange={(nextData) => updateSelectedNode(() => nextData)}
            />
          )}

          {loading ? <p className="text-xs text-slate-500">Loading automations...</p> : null}
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </div>
      ) : selectedEdgeId ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-700">Edge selected: {selectedEdgeId}</p>
          <button
            type="button"
            onClick={removeSelectedEdge}
            className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
          >
            Delete connection
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Select a node on the canvas to configure it.</p>
      )}
    </section>
  );
}
