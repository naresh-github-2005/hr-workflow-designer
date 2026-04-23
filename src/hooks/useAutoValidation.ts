import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export function useAutoValidation(): void {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const validate = useWorkflowStore((state) => state.validate);

  useEffect(() => {
    validate();
  }, [nodes, edges, validate]);
}
