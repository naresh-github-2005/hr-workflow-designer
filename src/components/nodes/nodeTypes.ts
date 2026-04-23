import type { NodeTypes } from 'reactflow';
import { ApprovalNode } from './ApprovalNode';
import { AutomationNode } from './AutomationNode';
import { EndNode } from './EndNode';
import { StartNode } from './StartNode';
import { TaskNode } from './TaskNode';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automation: AutomationNode,
  end: EndNode
};
