import type { IconProps } from './IconProps';

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path
        d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M12 14l4-4-4-4M16 10H8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
