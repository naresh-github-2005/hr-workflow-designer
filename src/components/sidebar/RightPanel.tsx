import { NodeConfigPanel } from '../forms/NodeConfigPanel';
import { SandboxPanel } from '../sandbox/SandboxPanel';
import { WorkflowLibraryPanel } from './WorkflowLibraryPanel';

export function RightPanel() {
  return (
    <aside className="h-full w-full space-y-3 overflow-y-auto bg-slate-50 p-3 lg:w-[390px] lg:shrink-0 lg:border-l lg:border-slate-200">
      <WorkflowLibraryPanel />
      <NodeConfigPanel />
      <SandboxPanel />
    </aside>
  );
}
