import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

interface NodeCardProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  selected?: boolean;
  variant: 'start' | 'task' | 'approval' | 'automation' | 'end';
}

const variantClasses: Record<NodeCardProps['variant'], string> = {
  start: 'border-emerald-200 bg-emerald-50',
  task: 'border-blue-200 bg-blue-50',
  approval: 'border-amber-200 bg-amber-50',
  automation: 'border-violet-200 bg-violet-50',
  end: 'border-rose-200 bg-rose-50'
};

export function NodeCard({ title, subtitle, children, selected, variant }: NodeCardProps) {
  return (
    <div
      className={clsx(
        'min-w-[210px] rounded-lg border p-3 text-left shadow-sm',
        selected ? 'ring-2 ring-blue-400 ring-offset-1' : 'ring-0',
        variantClasses[variant]
      )}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{subtitle}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{title}</p>
      {children ? <div className="mt-2 text-xs text-slate-600">{children}</div> : null}
    </div>
  );
}
