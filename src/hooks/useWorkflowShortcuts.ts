import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

export function useWorkflowShortcuts(): void {
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const clearSelection = useWorkflowStore((state) => state.clearSelection);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId);
  const removeSelectedNode = useWorkflowStore((state) => state.removeSelectedNode);
  const removeSelectedEdge = useWorkflowStore((state) => state.removeSelectedEdge);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const commandPressed = event.ctrlKey || event.metaKey;
      const editable = isEditableElement(event.target);

      if (commandPressed && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (commandPressed && (key === 'y' || (key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === 'escape') {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (editable) {
        return;
      }

      if (key === 'delete' || key === 'backspace') {
        event.preventDefault();
        if (selectedNodeId) {
          removeSelectedNode();
          return;
        }
        if (selectedEdgeId) {
          removeSelectedEdge();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clearSelection,
    redo,
    removeSelectedEdge,
    removeSelectedNode,
    selectedEdgeId,
    selectedNodeId,
    undo
  ]);
}
