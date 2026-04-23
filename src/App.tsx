import { useState } from 'react';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { ToastViewport } from './components/common/ToastViewport';
import { NodePalette } from './components/sidebar/NodePalette';
import { RightPanel } from './components/sidebar/RightPanel';
import { useWorkflowShortcuts } from './hooks/useWorkflowShortcuts';
import { useWorkflowLibraryStore } from './store/workflowLibraryStore';
import { useWorkflowStore } from './store/workflowStore';

type MobilePane = 'builder' | 'canvas' | 'inspector';

function App() {
  useWorkflowShortcuts();
  const [mobilePane, setMobilePane] = useState<MobilePane>('canvas');

  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.past.length > 0);
  const canRedo = useWorkflowStore((state) => state.future.length > 0);
  const activeWorkflowId = useWorkflowLibraryStore((state) => state.activeWorkflowId);
  const workflows = useWorkflowLibraryStore((state) => state.workflows);
  const activeWorkflow = workflows.find((workflow) => workflow.id === activeWorkflowId) ?? null;

  return (
    <>
      <div className="app-shell flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-700">
        <header className="flex min-h-14 flex-col gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">HR Workflow Designer Module</h1>
            <p className="text-[11px] text-slate-500">
              {activeWorkflow
                ? `Editing: ${activeWorkflow.name}`
                : 'Build onboarding, leave, and verification workflows.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
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
            <span className="hidden text-[11px] text-slate-500 sm:inline">Ctrl/Cmd+Z / Ctrl/Cmd+Y</span>
          </div>
        </header>

        <main className="min-h-0 flex flex-1 flex-col pb-14 lg:flex-row lg:pb-0">
          <section className={`${mobilePane === 'builder' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:flex lg:flex-none`}>
            <NodePalette />
          </section>
          <section className={`${mobilePane === 'canvas' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:flex`}>
            <WorkflowCanvas />
          </section>
          <section className={`${mobilePane === 'inspector' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:flex lg:flex-none`}>
            <RightPanel />
          </section>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-3 border-t border-slate-200 bg-white lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane('builder')}
            className={`text-xs font-medium ${mobilePane === 'builder' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('canvas')}
            className={`text-xs font-medium ${mobilePane === 'canvas' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
          >
            Canvas
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('inspector')}
            className={`text-xs font-medium ${mobilePane === 'inspector' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
          >
            Inspector
          </button>
        </nav>

        <ToastViewport />
      </div>

      <div className="mobile-landscape-lock" role="alert" aria-live="polite">
        <div className="mobile-landscape-lock-card">
          <p className="mobile-landscape-lock-eyebrow">Mobile portrait is disabled</p>
          <h2>Rotate your phone to landscape</h2>
          <p>This workflow editor is optimized for horizontal mode so dragging and connecting nodes stays usable.</p>
        </div>
      </div>
    </>
  );
}

export default App;
