import { useEffect, useState } from 'react';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { ToastViewport } from './components/common/ToastViewport';
import { NodeConfigPanel } from './components/forms/NodeConfigPanel';
import { NodePalette } from './components/sidebar/NodePalette';
import { RightPanel } from './components/sidebar/RightPanel';
import { useWorkflowShortcuts } from './hooks/useWorkflowShortcuts';
import { useToastStore } from './store/toastStore';
import { useWorkflowLibraryStore } from './store/workflowLibraryStore';
import { useWorkflowStore } from './store/workflowStore';

type MobilePane = 'build' | 'inspector';

function App() {
  useWorkflowShortcuts();
  const [mobilePane, setMobilePane] = useState<MobilePane>('build');
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.past.length > 0);
  const canRedo = useWorkflowStore((state) => state.future.length > 0);
  const addToast = useToastStore((state) => state.addToast);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const activeWorkflowId = useWorkflowLibraryStore((state) => state.activeWorkflowId);
  const workflows = useWorkflowLibraryStore((state) => state.workflows);
  const activeWorkflow = workflows.find((workflow) => workflow.id === activeWorkflowId) ?? null;
  const canUseFullscreen = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    if (!selectedNodeId) {
      setMobileEditorOpen(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (mobilePane !== 'build') {
      setMobileEditorOpen(false);
    }
  }, [mobilePane]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
    };
  }, []);

  const onToggleFullscreen = async () => {
    if (!canUseFullscreen) {
      addToast('Fullscreen mode is not supported in this browser.', 'warning');
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
    } catch {
      addToast('Fullscreen request was blocked by the browser.', 'warning');
    }
  };

  return (
    <>
      <div className="app-shell flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-100 text-slate-700">
        <header className="flex min-h-10 flex-col gap-1 border-b border-slate-200 bg-white px-2 py-1 sm:px-4 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-2 lg:py-0">
          <div>
            <h1 className="text-xs font-semibold text-slate-800 sm:text-sm">HR Workflow Designer Module</h1>
            <p className="hidden text-[10px] text-slate-500 lg:block lg:text-[11px]">
              {activeWorkflow
                ? `Editing: ${activeWorkflow.name}`
                : 'Build onboarding, leave, and verification workflows.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Redo
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              {isFullscreen ? 'Exit full' : 'Full screen'}
            </button>
            <span className="hidden text-[10px] text-slate-500 sm:inline">Ctrl/Cmd+Z / Ctrl/Cmd+Y</span>
          </div>
        </header>

        <main className="min-h-0 flex flex-1 flex-col pb-[3.25rem] lg:flex-row lg:pb-0">
          <section className="hidden min-h-0 lg:flex lg:flex-none">
            <NodePalette />
          </section>
          <section className="hidden min-h-0 lg:flex lg:flex-1">
            <WorkflowCanvas />
          </section>
          <section className="hidden min-h-0 lg:flex lg:flex-none">
            <RightPanel />
          </section>

          <section className={`${mobilePane === 'build' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:hidden`}>
            <div className="flex min-h-0 flex-1">
              <div className="h-full w-[150px] min-w-[136px] max-w-[30vw] border-r border-slate-200 bg-white">
                <NodePalette mobileCompact />
              </div>
              <div className="min-w-0 flex-1">
                <WorkflowCanvas onMobileNodeEditRequest={() => setMobileEditorOpen(true)} />
              </div>
            </div>
          </section>

          <section className={`${mobilePane === 'inspector' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:hidden`}>
            <RightPanel />
          </section>
        </main>

        <nav className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex h-8 -translate-x-1/2 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane('build')}
            className={`h-8 px-4 text-[11px] font-medium ${
              mobilePane === 'build' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            Build
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('inspector')}
            className={`h-8 px-4 text-[11px] font-medium ${
              mobilePane === 'inspector' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            Inspector
          </button>
        </nav>

        {mobilePane === 'build' && mobileEditorOpen && selectedNodeId ? (
          <div
            className="fixed inset-0 z-50 bg-slate-900/35 p-3 lg:hidden"
            onClick={() => setMobileEditorOpen(false)}
          >
            <div
              className="mx-auto mt-1 max-h-[calc(100vh-4.5rem)] w-[min(26rem,100%)] overflow-y-auto rounded-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileEditorOpen(false)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
              <NodeConfigPanel />
            </div>
          </div>
        ) : null}

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
