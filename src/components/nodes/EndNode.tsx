import type { NodeProps } from 'reactflow';
import type { EndNodeData } from '../../types/workflow';
import { NodeHandles } from './NodeHandles';
import { NodeCard } from './NodeCard';

export function EndNode({ data, selected }: NodeProps<EndNodeData>) {
  return (
    <>
      <NodeCard title={data.title || 'End'} subtitle="End Node" variant="end" selected={selected}>
        <p>{data.summaryFlag ? 'Summary enabled' : 'Summary disabled'}</p>
      </NodeCard>
      <NodeHandles colorClass="!bg-rose-500" />
    </>
  );
}
