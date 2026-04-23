import type {
  AutomationAction,
  SerializedWorkflow,
  SimulationLogEntry,
  SimulationResult,
  WorkflowNodeData
} from '../types/workflow';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAutomations: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: [
      { name: 'recipient', label: 'Recipient Email', required: true },
      { name: 'subject', label: 'Subject', required: true },
      { name: 'template', label: 'Template Name', required: true }
    ]
  },
  {
    id: 'generate_document',
    label: 'Generate Document',
    params: [
      { name: 'documentType', label: 'Document Type', required: true },
      { name: 'employeeId', label: 'Employee ID', required: true }
    ]
  },
  {
    id: 'notify_slack',
    label: 'Notify Slack Channel',
    params: [
      { name: 'channel', label: 'Channel Name', required: true },
      { name: 'message', label: 'Message', required: true }
    ]
  }
];

function messageForNode(data: WorkflowNodeData): string {
  switch (data.type) {
    case 'start':
      return `Started workflow from "${data.title}".`;
    case 'task':
      return `Assigned "${data.title}" to ${data.assignee}. Due ${data.dueDate}.`;
    case 'approval':
      return `Approval "${data.title}" routed to role ${data.approverRole}.`;
    case 'automation':
      return `Ran automation "${data.actionLabel || data.actionId}" successfully.`;
    case 'end':
      return `Workflow ended: ${data.endMessage}`;
    default:
      return 'Step processed.';
  }
}

function topologicalNodeOrder(workflow: SerializedWorkflow): string[] {
  const incomingCount = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const node of workflow.nodes) {
    incomingCount.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of workflow.edges) {
    if (incomingCount.has(edge.source) && incomingCount.has(edge.target)) {
      outgoing.get(edge.source)?.push(edge.target);
      incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    }
  }

  const startNode = workflow.nodes.find((node) => node.data.type === 'start');
  const queue: string[] = [];
  const defaultZeros = workflow.nodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .map((node) => node.id);

  if (startNode) {
    queue.push(startNode.id, ...defaultZeros.filter((id) => id !== startNode.id));
  } else {
    queue.push(...defaultZeros);
  }

  const ordered: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || ordered.includes(id)) {
      continue;
    }
    ordered.push(id);
    for (const next of outgoing.get(id) ?? []) {
      incomingCount.set(next, (incomingCount.get(next) ?? 0) - 1);
      if ((incomingCount.get(next) ?? 0) <= 0) {
        queue.push(next);
      }
    }
  }

  for (const node of workflow.nodes) {
    if (!ordered.includes(node.id)) {
      ordered.push(node.id);
    }
  }

  return ordered;
}

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return mockAutomations;
}

export async function simulateWorkflow(workflow: SerializedWorkflow): Promise<SimulationResult> {
  await delay(450);

  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
  const orderedNodeIds = topologicalNodeOrder(workflow);
  const logs: SimulationLogEntry[] = [];

  orderedNodeIds.forEach((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      return;
    }
    logs.push({
      step: index + 1,
      nodeId: node.id,
      nodeType: node.data.type,
      title: node.data.title,
      status: 'success',
      message: messageForNode(node.data),
      timestamp: new Date().toISOString()
    });
  });

  return {
    status: 'success',
    summary: `Simulation completed. ${logs.length} step(s) executed.`,
    logs
  };
}
