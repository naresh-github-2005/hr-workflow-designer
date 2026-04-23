import type { SerializedWorkflow, WorkflowTemplateId } from '../types/workflow';

export const workflowTemplateList: Array<{
  id: WorkflowTemplateId;
  label: string;
  description: string;
}> = [
  {
    id: 'employee-onboarding',
    label: 'Employee Onboarding',
    description: 'Starter flow for joining formalities and approvals.'
  },
  {
    id: 'leave-approval',
    label: 'Leave Approval',
    description: 'Leave request with manager approval and notifications.'
  }
];

const templates: Record<WorkflowTemplateId, SerializedWorkflow> = {
  'employee-onboarding': {
    nodes: [
      {
        id: 'start-onboarding',
        type: 'start',
        position: { x: 120, y: 120 },
        data: {
          type: 'start',
          title: 'Onboarding Start',
          metadata: [
            { id: 'meta-1', key: 'department', value: 'HR' },
            { id: 'meta-2', key: 'priority', value: 'normal' }
          ]
        }
      },
      {
        id: 'task-collect-docs',
        type: 'task',
        position: { x: 120, y: 280 },
        data: {
          type: 'task',
          title: 'Collect Employee Documents',
          description: 'Collect ID proof, education proof, and signed offer letter.',
          assignee: 'HR Executive',
          dueDate: '2026-04-30',
          customFields: [{ id: 'task-meta-1', key: 'checklist', value: 'standard-doc-set' }]
        }
      },
      {
        id: 'approval-manager',
        type: 'approval',
        position: { x: 120, y: 450 },
        data: {
          type: 'approval',
          title: 'Manager Approval',
          approverRole: 'Hiring Manager',
          autoApproveThreshold: 0
        }
      },
      {
        id: 'automation-mail',
        type: 'automation',
        position: { x: 420, y: 450 },
        data: {
          type: 'automation',
          title: 'Send Welcome Email',
          actionId: 'send_email',
          actionLabel: 'Send Email',
          actionParams: {
            recipient: 'new.employee@company.com',
            subject: 'Welcome to the organization',
            template: 'onboarding_welcome_v1'
          }
        }
      },
      {
        id: 'end-onboarding',
        type: 'end',
        position: { x: 420, y: 620 },
        data: {
          type: 'end',
          title: 'Onboarding Completed',
          endMessage: 'Employee onboarding has been completed successfully.',
          summaryFlag: true
        }
      }
    ],
    edges: [
      {
        id: 'edge-start-docs',
        source: 'start-onboarding',
        target: 'task-collect-docs',
        type: 'smoothstep'
      },
      {
        id: 'edge-docs-approval',
        source: 'task-collect-docs',
        target: 'approval-manager',
        type: 'smoothstep'
      },
      {
        id: 'edge-approval-automation',
        source: 'approval-manager',
        target: 'automation-mail',
        type: 'smoothstep'
      },
      {
        id: 'edge-automation-end',
        source: 'automation-mail',
        target: 'end-onboarding',
        type: 'smoothstep'
      }
    ]
  },
  'leave-approval': {
    nodes: [
      {
        id: 'start-leave',
        type: 'start',
        position: { x: 120, y: 120 },
        data: {
          type: 'start',
          title: 'Leave Request Submitted',
          metadata: [{ id: 'leave-meta-1', key: 'leaveType', value: 'annual' }]
        }
      },
      {
        id: 'task-validate-balance',
        type: 'task',
        position: { x: 120, y: 280 },
        data: {
          type: 'task',
          title: 'Validate Leave Balance',
          description: 'Check leave quota and policy eligibility.',
          assignee: 'HR Ops',
          dueDate: '2026-04-30',
          customFields: [{ id: 'leave-task-meta-1', key: 'policy', value: 'global-leave-policy' }]
        }
      },
      {
        id: 'approval-lead',
        type: 'approval',
        position: { x: 120, y: 450 },
        data: {
          type: 'approval',
          title: 'Team Lead Approval',
          approverRole: 'Team Lead',
          autoApproveThreshold: 2
        }
      },
      {
        id: 'automation-notify',
        type: 'automation',
        position: { x: 420, y: 450 },
        data: {
          type: 'automation',
          title: 'Notify Slack',
          actionId: 'notify_slack',
          actionLabel: 'Notify Slack Channel',
          actionParams: {
            channel: '#hr-approvals',
            message: 'Leave request approved and calendar will be updated.'
          }
        }
      },
      {
        id: 'end-leave',
        type: 'end',
        position: { x: 420, y: 620 },
        data: {
          type: 'end',
          title: 'Leave Workflow Completed',
          endMessage: 'Leave request workflow finished.',
          summaryFlag: true
        }
      }
    ],
    edges: [
      {
        id: 'edge-leave-start-balance',
        source: 'start-leave',
        target: 'task-validate-balance',
        type: 'smoothstep'
      },
      {
        id: 'edge-leave-balance-approval',
        source: 'task-validate-balance',
        target: 'approval-lead',
        type: 'smoothstep'
      },
      {
        id: 'edge-leave-approval-notify',
        source: 'approval-lead',
        target: 'automation-notify',
        type: 'smoothstep'
      },
      {
        id: 'edge-leave-notify-end',
        source: 'automation-notify',
        target: 'end-leave',
        type: 'smoothstep'
      }
    ]
  }
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getWorkflowTemplate(templateId: WorkflowTemplateId): SerializedWorkflow {
  return deepClone(templates[templateId]);
}
