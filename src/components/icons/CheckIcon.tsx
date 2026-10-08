import type { IconProps } from './IconProps';

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
