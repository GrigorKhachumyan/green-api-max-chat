import { BackIcon } from '@/components/icons';
import { Avatar } from '@/components/ui';

interface Props {
  name: string;
  onBack: () => void;
}

export function ChatHeader({ name, onBack }: Props) {
  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад к списку чатов"
        className="-ml-2 rounded-lg p-2 text-muted hover:bg-canvas md:hidden"
      >
        <BackIcon className="h-5 w-5" />
      </button>
      <Avatar name={name} size="sm" />
      <h2 className="truncate font-semibold">{name}</h2>
    </header>
  );
}
