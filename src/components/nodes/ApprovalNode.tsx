import type { NodeProps } from 'reactflow';
import type { ApprovalNodeData } from '../../types/workflow';
import { NodeHandles } from './NodeHandles';
import { NodeCard } from './NodeCard';

export function ApprovalNode({ data, selected }: NodeProps<ApprovalNodeData>) {
  return (
    <>
      <NodeCard
        title={data.title || 'Approval'}
        subtitle="Approval Node"
        variant="approval"
        selected={selected}
      >
        <p>{data.approverRole ? `Role: ${data.approverRole}` : 'Approver role not set'}</p>
      </NodeCard>
      <NodeHandles colorClass="!bg-amber-500" />
    </>
  );
}
