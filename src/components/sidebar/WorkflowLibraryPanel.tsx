import { useEffect, useMemo, useState } from 'react';
import { useWorkflowLibraryStore } from '../../store/workflowLibraryStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { useToastStore } from '../../store/toastStore';

function toReadableTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function WorkflowLibraryPanel() {
  const hydrate = useWorkflowLibraryStore((state) => state.hydrate);
  const workflows = useWorkflowLibraryStore((state) => state.workflows);
  const activeWorkflowId = useWorkflowLibraryStore((state) => state.activeWorkflowId);
  const setActiveWorkflowId = useWorkflowLibraryStore((state) => state.setActiveWorkflowId);
  const saveAsNewWorkflow = useWorkflowLibraryStore((state) => state.saveAsNewWorkflow);
  const saveActiveWorkflow = useWorkflowLibraryStore((state) => state.saveActiveWorkflow);
  const deleteWorkflow = useWorkflowLibraryStore((state) => state.deleteWorkflow);
  const serialize = useWorkflowStore((state) => state.serialize);
  const loadSerialized = useWorkflowStore((state) => state.loadSerialized);
  const reset = useWorkflowStore((state) => state.reset);
  const addToast = useToastStore((state) => state.addToast);
  const [workflowName, setWorkflowName] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === activeWorkflowId) ?? null,
    [activeWorkflowId, workflows]
  );

  useEffect(() => {
    if (!workflowName && activeWorkflow) {
      setWorkflowName(activeWorkflow.name);
    }
  }, [activeWorkflow, workflowName]);

  const onSaveNew = () => {
    const name = workflowName.trim();
    saveAsNewWorkflow(name, serialize());
    const latest = useWorkflowLibraryStore.getState().workflows[0];
    setWorkflowName(latest?.name ?? name);
  };

  const onSaveCurrent = () => {
    const name = workflowName.trim() || activeWorkflow?.name || '';
    const id = saveActiveWorkflow(name, serialize());
    const saved = useWorkflowLibraryStore.getState().workflows.find((workflow) => workflow.id === id);
    setWorkflowName(saved?.name ?? name);
  };

  const onLoadWorkflow = (workflowId: string) => {
    const item = workflows.find((workflow) => workflow.id === workflowId);
    if (!item) {
      return;
    }
    loadSerialized(item.graph);
    setActiveWorkflowId(item.id);
    setWorkflowName(item.name);
    addToast(`Loaded "${item.name}".`, 'info');
  };

  const onDeleteWorkflow = (workflowId: string) => {
    const deletingActive = workflowId === activeWorkflowId;
    deleteWorkflow(workflowId);
    if (!deletingActive) {
      return;
    }

    const nextWorkflow = useWorkflowLibraryStore.getState().workflows[0];
    if (nextWorkflow) {
      loadSerialized(nextWorkflow.graph);
      setActiveWorkflowId(nextWorkflow.id);
      setWorkflowName(nextWorkflow.name);
      addToast(`Loaded "${nextWorkflow.name}".`, 'info');
      return;
    }

    reset();
    setWorkflowName('');
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Saved workflows</h2>
        <span className="text-[11px] text-slate-500">{workflows.length} total</span>
      </div>

      <div className="space-y-2">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          <span>Workflow name</span>
          <input
            value={workflowName}
            onChange={(event) => setWorkflowName(event.target.value)}
            placeholder={activeWorkflow?.name ?? 'Enter workflow name'}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSaveCurrent}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Save current
          </button>
          <button
            type="button"
            onClick={onSaveNew}
            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Save as new
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {workflows.length === 0 ? (
          <p className="text-xs text-slate-500">No saved workflows yet.</p>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`rounded-md border p-2 ${
                workflow.id === activeWorkflowId
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">{workflow.name}</p>
                <span className="text-[10px] text-slate-500">{toReadableTime(workflow.updatedAt)}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onLoadWorkflow(workflow.id)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteWorkflow(workflow.id)}
                  className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
