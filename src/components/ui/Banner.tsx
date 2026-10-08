import type { ReactNode } from 'react';

const TONES = {
  danger: 'bg-danger text-white',
  warning: 'bg-amber-100 text-amber-900',
};

interface Props {
  tone: keyof typeof TONES;
  children: ReactNode;
}

export function Banner({ tone, children }: Props) {
  return (
    <div role="status" className={`px-4 py-2 text-center text-sm ${TONES[tone]}`}>
      {children}
    </div>
  );
}
