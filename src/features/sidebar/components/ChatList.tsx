import { useMemo } from 'react';

import { type Chat, lastMessage } from '@/state';

import { ChatListItem } from './ChatListItem';

interface Props {
  chats: Record<string, Chat>;
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
}

function byRecentActivity(a: Chat, b: Chat): number {
  const aTime = lastMessage(a)?.timestamp ?? Infinity;
  const bTime = lastMessage(b)?.timestamp ?? Infinity;
  if (aTime === bTime) return 0;
  return aTime > bTime ? -1 : 1;
}

export function ChatList({ chats, activeChatId, onSelect }: Props) {
  const sorted = useMemo(() => Object.values(chats).sort(byRecentActivity), [chats]);

  if (sorted.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted">
        Чатов пока нет. Введите номер телефона получателя, чтобы начать переписку.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {sorted.map((chat) => (
        <li key={chat.chatId}>
          <ChatListItem chat={chat} active={chat.chatId === activeChatId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
