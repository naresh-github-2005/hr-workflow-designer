import type { KeyValueItem } from '../../types/workflow';
import { createId } from '../../utils/id';

interface KeyValueEditorProps {
  label: string;
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  label,
  items,
  onChange,
  keyPlaceholder = 'key',
  valuePlaceholder = 'value'
}: KeyValueEditorProps) {
  const updateItem = (id: string, field: 'key' | 'value', value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    onChange([...items, { id: createId('kv'), key: '', value: '' }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <button
          type="button"
          onClick={addItem}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
        >
          + Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500">No items added.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={item.key}
                placeholder={keyPlaceholder}
                onChange={(event) => updateItem(item.id, 'key', event.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400"
              />
              <input
                value={item.value}
                placeholder={valuePlaceholder}
                onChange={(event) => updateItem(item.id, 'value', event.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-700 hover:bg-rose-100"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
