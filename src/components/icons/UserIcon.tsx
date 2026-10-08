import type { IconProps } from './IconProps';

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.8-3.6-5-8-5z" />
    </svg>
  );
}
