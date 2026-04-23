import type { NodeProps } from 'reactflow';
import type { TaskNodeData } from '../../types/workflow';
import { NodeHandles } from './NodeHandles';
import { NodeCard } from './NodeCard';

export function TaskNode({ data, selected }: NodeProps<TaskNodeData>) {
  return (
    <>
      <NodeCard title={data.title || 'Task'} subtitle="Task Node" variant="task" selected={selected}>
        <p>{data.assignee ? `Assignee: ${data.assignee}` : 'Assignee not set'}</p>
      </NodeCard>
      <NodeHandles colorClass="!bg-blue-500" />
    </>
  );
}
