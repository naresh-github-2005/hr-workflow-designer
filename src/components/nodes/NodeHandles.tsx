import { Handle, Position } from 'reactflow';

interface NodeHandlesProps {
  colorClass: string;
}

export function NodeHandles({ colorClass }: NodeHandlesProps) {
  const baseClass = `!h-3 !w-3 !border-2 !border-white ${colorClass}`;

  return (
    <>
      <Handle id="top" type="source" position={Position.Top} className={baseClass} />
      <Handle id="right" type="source" position={Position.Right} className={baseClass} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={baseClass} />
      <Handle id="left" type="source" position={Position.Left} className={baseClass} />
    </>
  );
}
