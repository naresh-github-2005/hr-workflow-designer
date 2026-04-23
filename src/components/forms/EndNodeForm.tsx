import type { EndNodeData } from '../../types/workflow';
import { InputField, TextareaField, ToggleField } from '../common/Field';

interface EndNodeFormProps {
  data: EndNodeData;
  onChange: (nextData: EndNodeData) => void;
}

export function EndNodeForm({ data, onChange }: EndNodeFormProps) {
  return (
    <div className="space-y-3">
      <InputField
        label="Title"
        required
        value={data.title}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <TextareaField
        label="End message"
        required
        value={data.endMessage}
        onChange={(event) => onChange({ ...data, endMessage: event.target.value })}
      />
      <ToggleField
        label="Include summary"
        checked={data.summaryFlag}
        onChange={(summaryFlag) => onChange({ ...data, summaryFlag })}
      />
    </div>
  );
}
