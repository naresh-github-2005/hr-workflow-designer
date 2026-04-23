interface NodeContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function NodeContextMenu({ x, y, onEdit, onDuplicate, onDelete }: NodeContextMenuProps) {
  return (
    <div
      className="fixed z-40 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        onClick={onEdit}
        className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
      >
        Duplicate
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="w-full rounded px-2 py-1.5 text-left text-xs text-rose-700 hover:bg-rose-50"
      >
        Delete
      </button>
    </div>
  );
}
