import type { IconProps } from './IconProps';

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}
