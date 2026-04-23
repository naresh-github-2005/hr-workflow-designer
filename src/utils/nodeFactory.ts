import type { XYPosition } from 'reactflow';
import type {
  ApprovalNodeData,
  AutomationNodeData,
  EndNodeData,
  StartNodeData,
  TaskNodeData,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType
} from '../types/workflow';
import { createId } from './id';

function createDefaultNodeData(type: WorkflowNodeType): WorkflowNodeData {
  switch (type) {
    case 'start': {
      const data: StartNodeData = {
        type: 'start',
        title: 'Start',
        metadata: []
      };
      return data;
    }
    case 'task': {
      const data: TaskNodeData = {
        type: 'task',
        title: 'Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: []
      };
      return data;
    }
    case 'approval': {
      const data: ApprovalNodeData = {
        type: 'approval',
        title: 'Approval',
        approverRole: '',
        autoApproveThreshold: ''
      };
      return data;
    }
    case 'automation': {
      const data: AutomationNodeData = {
        type: 'automation',
        title: 'Automation',
        actionId: '',
        actionLabel: '',
        actionParams: {}
      };
      return data;
    }
    case 'end': {
      const data: EndNodeData = {
        type: 'end',
        title: 'End',
        endMessage: 'Workflow completed.',
        summaryFlag: true
      };
      return data;
    }
    default:
      return {
        type: 'task',
        title: 'Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: []
      } as TaskNodeData;
  }
}

export function createWorkflowNode(type: WorkflowNodeType, position: XYPosition): WorkflowNode {
  return {
    id: createId(type),
    type,
    position,
    data: createDefaultNodeData(type)
  };
}
