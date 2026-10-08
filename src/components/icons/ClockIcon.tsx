import type { IconProps } from './IconProps';

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" strokeLinecap="round" />
    </svg>
  );
}
