import { create } from 'zustand';
import { createId } from '../utils/id';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastStoreState {
  toasts: ToastItem[];
  addToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  addToast: (message, variant = 'info', durationMs = 2200) => {
    const id = createId('toast');
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }]
    }));

    window.setTimeout(() => {
      get().removeToast(id);
    }, durationMs);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),

  clearToasts: () => set({ toasts: [] })
}));
