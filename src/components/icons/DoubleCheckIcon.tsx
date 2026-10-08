import type { IconProps } from './IconProps';

export function DoubleCheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M1.5 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11.5l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
