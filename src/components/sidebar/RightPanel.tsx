import { NodeConfigPanel } from '../forms/NodeConfigPanel';
import { SandboxPanel } from '../sandbox/SandboxPanel';
import { WorkflowLibraryPanel } from './WorkflowLibraryPanel';

export function RightPanel() {
  return (
    <aside className="w-[390px] shrink-0 space-y-3 overflow-y-auto border-l border-slate-200 bg-slate-50 p-3">
      <WorkflowLibraryPanel />
      <NodeConfigPanel />
      <SandboxPanel />
    </aside>
  );
}
