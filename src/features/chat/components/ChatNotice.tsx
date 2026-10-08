import type { ReactNode } from 'react';

export function ChatNotice({ children }: { children: ReactNode }) {
  return <p className="my-2 self-center rounded-full bg-surface/80 px-3 py-1 text-xs text-muted">{children}</p>;
}
