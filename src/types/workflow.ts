import type { Edge, Node, XYPosition } from 'reactflow';

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automation' | 'end';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
}

export interface BaseNodeData {
  type: WorkflowNodeType;
  title: string;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  metadata: KeyValueItem[];
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValueItem[];
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  approverRole: string;
  autoApproveThreshold: number | '';
}

export interface AutomationNodeData extends BaseNodeData {
  type: 'automation';
  actionId: string;
  actionLabel: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  endMessage: string;
  summaryFlag: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomationNodeData
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface SerializedWorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: XYPosition;
  data: WorkflowNodeData;
}

export interface SerializedWorkflow {
  nodes: SerializedWorkflowNode[];
  edges: WorkflowEdge[];
}

export interface SavedWorkflow {
  id: string;
  name: string;
  updatedAt: string;
  graph: SerializedWorkflow;
}

export interface AutomationParamDefinition {
  name: string;
  label: string;
  required: boolean;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: AutomationParamDefinition[];
}

export interface SimulationLogEntry {
  step: number;
  nodeId: string;
  nodeType: WorkflowNodeType;
  title: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  status: 'success' | 'failed';
  logs: SimulationLogEntry[];
  summary: string;
}

export interface ValidationIssue {
  code: string;
  level: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export type WorkflowTemplateId = 'employee-onboarding' | 'leave-approval';
