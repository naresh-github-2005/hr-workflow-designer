import type { AutomationAction, AutomationNodeData } from '../../types/workflow';
import { InputField } from '../common/Field';

interface AutomationNodeFormProps {
  data: AutomationNodeData;
  actions: AutomationAction[];
  onChange: (nextData: AutomationNodeData) => void;
}

export function AutomationNodeForm({ data, actions, onChange }: AutomationNodeFormProps) {
  const selectedAction = actions.find((action) => action.id === data.actionId);

  const onActionChange = (actionId: string) => {
    const nextAction = actions.find((action) => action.id === actionId);
    const nextParams: Record<string, string> = {};
    for (const param of nextAction?.params ?? []) {
      nextParams[param.name] = data.actionParams[param.name] ?? '';
    }
    onChange({
      ...data,
      actionId,
      actionLabel: nextAction?.label ?? '',
      actionParams: nextParams
    });
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Title"
        required
        value={data.title}
        onChange={(event) => onChange({ ...data, title: event.target.value })}
      />
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        <span className="font-medium">Automation action *</span>
        <select
          value={data.actionId}
          onChange={(event) => onActionChange(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-400"
        >
          <option value="">Select action</option>
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
      </label>

      {(selectedAction?.params ?? []).map((param) => (
        <InputField
          key={param.name}
          label={param.label}
          required={param.required}
          value={data.actionParams[param.name] ?? ''}
          onChange={(event) =>
            onChange({
              ...data,
              actionParams: {
                ...data.actionParams,
                [param.name]: event.target.value
              }
            })
          }
        />
      ))}
    </div>
  );
}
