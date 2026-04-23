import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { ToastViewport } from './components/common/ToastViewport';
import { NodePalette } from './components/sidebar/NodePalette';
import { RightPanel } from './components/sidebar/RightPanel';
import { useWorkflowShortcuts } from './hooks/useWorkflowShortcuts';
import { useWorkflowLibraryStore } from './store/workflowLibraryStore';
import { useWorkflowStore } from './store/workflowStore';

function App() {
  useWorkflowShortcuts();

  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.past.length > 0);
  const canRedo = useWorkflowStore((state) => state.future.length > 0);
  const activeWorkflowId = useWorkflowLibraryStore((state) => state.activeWorkflowId);
  const workflows = useWorkflowLibraryStore((state) => state.workflows);
  const activeWorkflow = workflows.find((workflow) => workflow.id === activeWorkflowId) ?? null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-700">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-800">HR Workflow Designer Module</h1>
          <p className="text-[11px] text-slate-500">
            {activeWorkflow ? `Editing: ${activeWorkflow.name}` : 'Build onboarding, leave, and verification workflows.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Redo
          </button>
          <span className="text-[11px] text-slate-500">Ctrl/Cmd+Z / Ctrl/Cmd+Y</span>
        </div>
      </header>

      <main className="flex h-[calc(100vh-3.5rem)]">
        <NodePalette />
        <section className="min-w-0 flex-1">
          <WorkflowCanvas />
        </section>
        <RightPanel />
      </main>

      <ToastViewport />
    </div>
  );
}

export default App;
