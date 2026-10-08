import { PlusIcon } from '@/components/icons';

interface Props {
  className?: string;
  onNewChat: () => void;
}

export function EmptyChat({ className = '', onNewChat }: Props) {
  return (
    <section className={`flex-1 flex-col items-center justify-center gap-3 ${className}`}>
      <p className="text-sm text-muted">Выберите чат или создайте новый</p>
      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
      >
        <PlusIcon className="h-4 w-4" />
        Новый чат
      </button>
    </section>
  );
}
