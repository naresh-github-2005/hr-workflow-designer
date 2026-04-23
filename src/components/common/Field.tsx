import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  required?: boolean;
}

interface InputFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {}

export function InputField({ label, required, className, ...props }: InputFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      <span className="font-medium">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        className={`rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 ${className ?? ''}`}
        {...props}
      />
    </label>
  );
}

interface TextareaFieldProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextareaField({ label, required, className, ...props }: TextareaFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      <span className="font-medium">
        {label}
        {required ? ' *' : ''}
      </span>
      <textarea
        className={`min-h-[80px] rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 ${className ?? ''}`}
        {...props}
      />
    </label>
  );
}

interface ToggleFieldProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({ label, checked, onChange, required }: ToggleFieldProps) {
  return (
    <label className="flex items-center justify-between rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-600">
      <span className="font-medium">
        {label}
        {required ? ' *' : ''}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}
