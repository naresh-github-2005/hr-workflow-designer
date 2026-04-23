import type { ApprovalNodeData } from '../../types/workflow';
import { InputField } from '../common/Field';

interface ApprovalNodeFormProps {
  data: ApprovalNodeData;
  onChange: (nextData: ApprovalNodeData) => void;
}

export function ApprovalNodeForm({ data, onChange }: ApprovalNodeFormProps) {
  return (
    <div className="space-y-3">
      <InputField
        label="Title"
        required
        value={data.title}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <InputField
        label="Approver role"
        required
        value={data.approverRole}
        onChange={(event) => onChange({ ...data, approverRole: event.target.value })}
      />
      <InputField
        label="Auto-approve threshold"
        type="number"
        min={0}
        value={data.autoApproveThreshold}
        onChange={(event) =>
          onChange({
            ...data,
            autoApproveThreshold: event.target.value === '' ? '' : Number(event.target.value)
          })
        }
      />
    </div>
  );
}
