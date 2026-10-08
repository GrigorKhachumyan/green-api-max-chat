import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function LoginField({ label, hint, ...inputProps }: Props) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="w-full rounded-xl border border-line bg-canvas/50 px-3 py-2.5 text-sm transition outline-none placeholder:text-muted/60 focus:border-accent focus:bg-surface"
        {...inputProps}
      />
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}
