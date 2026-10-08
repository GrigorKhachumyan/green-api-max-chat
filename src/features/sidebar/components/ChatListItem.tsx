import { Avatar } from '@/components/ui';
import { formatShortDate } from '@/lib';
import { type Chat, lastMessage, previewText } from '@/state';

interface Props {
  chat: Chat;
  active: boolean;
  onSelect: (chatId: string) => void;
}

export function ChatListItem({ chat, active, onSelect }: Props) {
  const last = lastMessage(chat);
  const emptyText = chat.historyStatus === 'loaded' ? 'Нет сообщений' : '';
  const preview = last ? previewText(last) : emptyText;

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.chatId)}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active ? 'bg-accent-soft' : 'hover:bg-canvas'
      }`}
    >
      <Avatar name={chat.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="flex-1 truncate font-medium">{chat.name}</span>
          {last && <span className="shrink-0 text-xs text-muted">{formatShortDate(last.timestamp)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-sm text-muted">
            {last?.direction === 'outgoing' && <span className="text-ink/70">Вы: </span>}
            {preview}
          </span>
          {chat.unread > 0 && (
            <span
              aria-label={`Непрочитанных: ${chat.unread}`}
              className="min-w-5 rounded-full bg-accent px-1.5 text-center text-xs leading-5 font-medium text-white"
            >
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
