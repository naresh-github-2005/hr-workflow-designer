import type { TaskNodeData } from '../../types/workflow';
import { InputField, TextareaField } from '../common/Field';
import { KeyValueEditor } from '../common/KeyValueEditor';

interface TaskNodeFormProps {
  data: TaskNodeData;
  onChange: (nextData: TaskNodeData) => void;
}

export function TaskNodeForm({ data, onChange }: TaskNodeFormProps) {
  return (
    <div className="space-y-3">
      <InputField
        label="Title"
        required
        value={data.title}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <TextareaField
        label="Description"
        value={data.description}
        onChange={(event) => onChange({ ...data, description: event.target.value })}
      />
      <InputField
        label="Assignee"
        required
        value={data.assignee}
        onChange={(event) => onChange({ ...data, assignee: event.target.value })}
      />
      <InputField
        label="Due date"
        type="date"
        required
        value={data.dueDate}
        onChange={(event) => onChange({ ...data, dueDate: event.target.value })}
      />
      <KeyValueEditor
        label="Custom fields"
        items={data.customFields}
        onChange={(customFields) => onChange({ ...data, customFields })}
      />
    </div>
  );
}
