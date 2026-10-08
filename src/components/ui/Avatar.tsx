import { UserIcon } from '@/components/icons';
import { initials } from '@/lib';

const GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
];

const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
};

function gradientFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

interface Props {
  name: string;
  size?: keyof typeof SIZES;
}

export function Avatar({ name, size = 'md' }: Props) {
  const letters = initials(name);
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${SIZES[size]} ${gradientFor(name)}`}
    >
      {letters || <UserIcon className="h-1/2 w-1/2" />}
    </span>
  );
}
