import { create } from 'zustand';
import type { SavedWorkflow, SerializedWorkflow } from '../types/workflow';
import { createId } from '../utils/id';
import { useToastStore } from './toastStore';

const STORAGE_KEY = 'hr-workflow-library-v1';

interface WorkflowLibraryState {
  initialized: boolean;
  workflows: SavedWorkflow[];
  activeWorkflowId: string | null;
  hydrate: () => void;
  setActiveWorkflowId: (workflowId: string | null) => void;
  saveAsNewWorkflow: (name: string, graph: SerializedWorkflow) => string;
  saveActiveWorkflow: (name: string, graph: SerializedWorkflow) => string;
  deleteWorkflow: (workflowId: string) => void;
}

function toast(message: string, variant: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
  useToastStore.getState().addToast(message, variant);
}

function persist(workflows: SavedWorkflow[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

function normalizeName(name: string, workflows: SavedWorkflow[]): string {
  const trimmed = name.trim();
  if (trimmed) {
    return trimmed;
  }
  return `Workflow ${workflows.length + 1}`;
}

function cloneGraph(graph: SerializedWorkflow): SerializedWorkflow {
  return JSON.parse(JSON.stringify(graph)) as SerializedWorkflow;
}

export const useWorkflowLibraryStore = create<WorkflowLibraryState>((set, get) => ({
  initialized: false,
  workflows: [],
  activeWorkflowId: null,

  hydrate: () => {
    if (get().initialized) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ initialized: true, workflows: [], activeWorkflowId: null });
        return;
      }

      const parsed = JSON.parse(raw) as SavedWorkflow[];
      const workflows = Array.isArray(parsed) ? parsed : [];
      set({
        initialized: true,
        workflows: workflows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        activeWorkflowId: workflows[0]?.id ?? null
      });
    } catch {
      set({ initialized: true, workflows: [], activeWorkflowId: null });
      toast('Saved workflows could not be loaded.', 'error');
    }
  },

  setActiveWorkflowId: (workflowId) => set({ activeWorkflowId: workflowId }),

  saveAsNewWorkflow: (name, graph) => {
    const state = get();
    const now = new Date().toISOString();
    const workflow: SavedWorkflow = {
      id: createId('workflow'),
      name: normalizeName(name, state.workflows),
      updatedAt: now,
      graph: cloneGraph(graph)
    };

    const workflows = [workflow, ...state.workflows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    persist(workflows);
    set({ workflows, activeWorkflowId: workflow.id });
    toast(`Saved "${workflow.name}".`, 'success');
    return workflow.id;
  },

  saveActiveWorkflow: (name, graph) => {
    const state = get();
    const now = new Date().toISOString();
    const activeId = state.activeWorkflowId;

    if (!activeId) {
      return get().saveAsNewWorkflow(name, graph);
    }

    const existing = state.workflows.find((workflow) => workflow.id === activeId);
    if (!existing) {
      return get().saveAsNewWorkflow(name, graph);
    }

    const updated: SavedWorkflow = {
      ...existing,
      name: normalizeName(name || existing.name, state.workflows),
      updatedAt: now,
      graph: cloneGraph(graph)
    };

    const workflows = state.workflows
      .map((workflow) => (workflow.id === activeId ? updated : workflow))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    persist(workflows);
    set({ workflows, activeWorkflowId: updated.id });
    toast(`Updated "${updated.name}".`, 'success');
    return updated.id;
  },

  deleteWorkflow: (workflowId) => {
    const state = get();
    const workflow = state.workflows.find((item) => item.id === workflowId);
    if (!workflow) {
      return;
    }

    const workflows = state.workflows.filter((item) => item.id !== workflowId);
    persist(workflows);
    set({
      workflows,
      activeWorkflowId: state.activeWorkflowId === workflowId ? workflows[0]?.id ?? null : state.activeWorkflowId
    });
    toast(`Deleted "${workflow.name}".`, 'warning');
  }
}));
