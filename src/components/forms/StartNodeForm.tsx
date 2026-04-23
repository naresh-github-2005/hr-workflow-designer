import type { StartNodeData } from '../../types/workflow';
import { InputField } from '../common/Field';
import { KeyValueEditor } from '../common/KeyValueEditor';

interface StartNodeFormProps {
  data: StartNodeData;
  onChange: (nextData: StartNodeData) => void;
}

export function StartNodeForm({ data, onChange }: StartNodeFormProps) {
  return (
    <div className="space-y-3">
      <InputField
        label="Start title"
        required
        value={data.title}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <KeyValueEditor
        label="Metadata"
        items={data.metadata}
        onChange={(metadata) => onChange({ ...data, metadata })}
        keyPlaceholder="meta key"
        valuePlaceholder="meta value"
      />
    </div>
  );
}
