import type { IconProps } from './IconProps';

export function BackIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
