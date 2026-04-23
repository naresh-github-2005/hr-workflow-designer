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
    <div className="pointer-events-none fixed left-1/2 top-3 z-50 flex w-[calc(100vw-1rem)] max-w-[320px] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-[320px] sm:translate-x-0">
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
