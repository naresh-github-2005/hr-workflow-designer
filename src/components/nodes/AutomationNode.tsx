import type { NodeProps } from 'reactflow';
import type { AutomationNodeData } from '../../types/workflow';
import { NodeHandles } from './NodeHandles';
import { NodeCard } from './NodeCard';

export function AutomationNode({ data, selected }: NodeProps<AutomationNodeData>) {
  return (
    <>
      <NodeCard
        title={data.title || 'Automation'}
        subtitle="Automated Step"
        variant="automation"
        selected={selected}
      >
        <p>{data.actionLabel || data.actionId || 'Action not selected'}</p>
      </NodeCard>
      <NodeHandles colorClass="!bg-violet-500" />
    </>
  );
}
