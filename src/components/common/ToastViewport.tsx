import { clsx } from 'clsx';
import { useToastStore } from '../../store/toastStore';

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700'
} as const;

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto rounded-md border px-3 py-2 text-xs shadow-lg backdrop-blur-sm',
            toneClasses[toast.variant]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded px-1 text-[11px] opacity-80 hover:opacity-100"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
