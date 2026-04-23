import type { NodeProps } from 'reactflow';
import type { StartNodeData } from '../../types/workflow';
import { NodeHandles } from './NodeHandles';
import { NodeCard } from './NodeCard';

export function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <>
      <NodeCard title={data.title || 'Start'} subtitle="Start Node" variant="start" selected={selected}>
        <p>Metadata: {data.metadata.length}</p>
      </NodeCard>
      <NodeHandles colorClass="!bg-emerald-500" />
    </>
  );
}
