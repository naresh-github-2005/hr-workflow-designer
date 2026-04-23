import type { DragEvent } from 'react';
import { useWorkflowLibraryStore } from '../../store/workflowLibraryStore';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowNodeType } from '../../types/workflow';
import { workflowTemplateList } from '../../utils/templates';

const paletteItems: Array<{ type: WorkflowNodeType; label: string; description: string; color: string }> = [
  { type: 'start', label: 'Start Node', description: 'Entry point for workflow', color: 'bg-emerald-500' },
  { type: 'task', label: 'Task Node', description: 'Manual HR task', color: 'bg-blue-500' },
  {
    type: 'approval',
    label: 'Approval Node',
    description: 'Role-based approval decision',
    color: 'bg-amber-500'
  },
  {
    type: 'automation',
    label: 'Automated Step',
    description: 'Run action from automation API',
    color: 'bg-violet-500'
  },
  { type: 'end', label: 'End Node', description: 'Workflow completion', color: 'bg-rose-500' }
];

interface NodePaletteProps {
  mobileCompact?: boolean;
}

export function NodePalette({ mobileCompact = false }: NodePaletteProps) {
  const loadTemplate = useWorkflowStore((state) => state.loadTemplate);
  const reset = useWorkflowStore((state) => state.reset);
  const setActiveWorkflowId = useWorkflowLibraryStore((state) => state.setActiveWorkflowId);

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className={
        mobileCompact
          ? 'h-full w-full overflow-y-auto bg-white p-2'
          : 'h-full w-full overflow-y-auto border-b border-slate-200 bg-white p-3 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-4'
      }
    >
      <h2 className="text-sm font-semibold text-slate-800">{mobileCompact ? 'Builder' : 'Workflow Builder'}</h2>
      <p className="mt-1 text-[11px] text-slate-500">
        {mobileCompact ? 'Drag nodes into canvas' : 'Drag node types into the canvas.'}
      </p>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">Templates</p>
          <button
            type="button"
            onClick={() => {
              reset();
              setActiveWorkflowId(null);
            }}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            New blank
          </button>
        </div>
        <div className={mobileCompact ? 'grid grid-cols-1 gap-1.5' : 'space-y-2'}>
          {workflowTemplateList.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                loadTemplate(template.id);
                setActiveWorkflowId(null);
              }}
              className="w-full rounded border border-slate-200 bg-white p-2 text-left hover:bg-slate-100"
            >
              <p className="text-xs font-medium text-slate-800">{template.label}</p>
              {!mobileCompact ? (
                <p className="mt-1 text-[11px] text-slate-500">{template.description}</p>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={mobileCompact ? 'mt-3 space-y-1.5' : 'mt-4 space-y-2'}>
        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(event) => onDragStart(event, item.type)}
            className={`cursor-grab rounded-md border border-slate-200 bg-white shadow-sm active:cursor-grabbing ${
              mobileCompact ? 'p-1.5' : 'p-2'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <p className={`${mobileCompact ? 'text-xs' : 'text-sm'} font-medium text-slate-800`}>{item.label}</p>
            </div>
            {!mobileCompact ? <p className="mt-1 text-xs text-slate-500">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
