import type {
  ValidationIssue,
  ValidationResult,
  WorkflowEdge,
  WorkflowNode
} from '../types/workflow';

function pushIssue(
  issues: ValidationIssue[],
  code: string,
  message: string,
  level: 'error' | 'warning' = 'error',
  nodeId?: string
): void {
  issues.push({ code, message, level, nodeId });
}

function detectCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const adjacency = new Map<string, string[]>();
  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency.get(edge.source)?.push(edge.target);
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycleNodes = new Set<string>();

  const dfs = (nodeId: string): void => {
    visited.add(nodeId);
    inStack.add(nodeId);

    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (inStack.has(neighbor)) {
        cycleNodes.add(nodeId);
        cycleNodes.add(neighbor);
      }
    }

    inStack.delete(nodeId);
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return [...cycleNodes];
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const incomingMap = new Map<string, string[]>();
  const outgoingMap = new Map<string, string[]>();

  for (const node of nodes) {
    incomingMap.set(node.id, []);
    outgoingMap.set(node.id, []);
  }

  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      outgoingMap.get(edge.source)?.push(edge.target);
      incomingMap.get(edge.target)?.push(edge.source);
    }
  }

  const startNodes = nodes.filter((node) => node.data.type === 'start');
  const endNodes = nodes.filter((node) => node.data.type === 'end');

  if (startNodes.length === 0) {
    pushIssue(issues, 'MISSING_START', 'A workflow must include exactly one Start node.');
  }
  if (startNodes.length > 1) {
    pushIssue(issues, 'MULTIPLE_STARTS', 'Only one Start node is allowed.');
  }
  if (endNodes.length === 0) {
    pushIssue(issues, 'MISSING_END', 'At least one End node is required.');
  }

  for (const startNode of startNodes) {
    if ((incomingMap.get(startNode.id)?.length ?? 0) > 0) {
      pushIssue(
        issues,
        'START_HAS_INCOMING',
        'Start node should be first and must not have incoming connections.',
        'error',
        startNode.id
      );
    }
  }

  for (const node of nodes) {
    const incoming = incomingMap.get(node.id)?.length ?? 0;
    const outgoing = outgoingMap.get(node.id)?.length ?? 0;
    const nodeType = node.data.type;

    if (nodeType !== 'start' && incoming === 0) {
      pushIssue(
        issues,
        'ORPHAN_NODE',
        `${node.data.title || 'Node'} is orphaned and must be connected from a previous step.`,
        'error',
        node.id
      );
    }

    if (nodeType === 'start' && outgoing === 0) {
      pushIssue(
        issues,
        'START_NO_OUTGOING',
        'Start node must connect to at least one next step.',
        'error',
        node.id
      );
    }

    if (nodeType !== 'end' && nodeType !== 'start' && outgoing === 0) {
      pushIssue(
        issues,
        'NODE_NO_OUTGOING',
        `${node.data.title || 'Node'} should connect to a next step.`,
        'error',
        node.id
      );
    }

    if (nodeType === 'end' && incoming === 0) {
      pushIssue(
        issues,
        'END_NO_INCOMING',
        'End node must be reachable from another step.',
        'error',
        node.id
      );
    }

    switch (nodeType) {
      case 'start': {
        if (!node.data.title.trim()) {
          pushIssue(issues, 'START_TITLE_REQUIRED', 'Start title is required.', 'error', node.id);
        }
        break;
      }
      case 'task': {
        if (!node.data.title.trim()) {
          pushIssue(issues, 'TASK_TITLE_REQUIRED', 'Task title is required.', 'error', node.id);
        }
        if (!node.data.assignee.trim()) {
          pushIssue(issues, 'TASK_ASSIGNEE_REQUIRED', 'Task assignee is required.', 'error', node.id);
        }
        if (!node.data.dueDate.trim()) {
          pushIssue(issues, 'TASK_DUE_DATE_REQUIRED', 'Task due date is required.', 'error', node.id);
        }
        break;
      }
      case 'approval': {
        if (!node.data.title.trim()) {
          pushIssue(issues, 'APPROVAL_TITLE_REQUIRED', 'Approval title is required.', 'error', node.id);
        }
        if (!node.data.approverRole.trim()) {
          pushIssue(
            issues,
            'APPROVER_ROLE_REQUIRED',
            'Approver role is required for approval step.',
            'error',
            node.id
          );
        }
        break;
      }
      case 'automation': {
        if (!node.data.title.trim()) {
          pushIssue(issues, 'AUTO_TITLE_REQUIRED', 'Automation title is required.', 'error', node.id);
        }
        if (!node.data.actionId.trim()) {
          pushIssue(
            issues,
            'AUTO_ACTION_REQUIRED',
            'Automation step requires an action selection.',
            'error',
            node.id
          );
        }
        const emptyParam = Object.entries(node.data.actionParams).find(
          ([, value]) => !String(value).trim()
        );
        if (emptyParam) {
          pushIssue(
            issues,
            'AUTO_PARAM_REQUIRED',
            `Automation parameter "${emptyParam[0]}" is required.`,
            'error',
            node.id
          );
        }
        break;
      }
      case 'end': {
        if (!node.data.endMessage.trim()) {
          pushIssue(issues, 'END_MESSAGE_REQUIRED', 'End node message is required.', 'error', node.id);
        }
        break;
      }
      default:
        break;
    }
  }

  if (startNodes.length === 1) {
    const startId = startNodes[0].id;
    const reachable = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || reachable.has(current)) {
        continue;
      }
      reachable.add(current);
      for (const nextId of outgoingMap.get(current) ?? []) {
        queue.push(nextId);
      }
    }

    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        pushIssue(
          issues,
          'UNREACHABLE_NODE',
          `${node.data.title || 'Node'} is not reachable from Start.`,
          'warning',
          node.id
        );
      }
    }
  }

  const cycleNodeIds = detectCycles(nodes, edges);
  if (cycleNodeIds.length > 0) {
    pushIssue(
      issues,
      'CYCLE_DETECTED',
      'Cycle detected in workflow graph. Remove looped connections.',
      'error'
    );
  }

  return {
    isValid: !issues.some((issue) => issue.level === 'error'),
    issues
  };
}
