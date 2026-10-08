import type { Chat } from '@/state';

import { ChatNotice } from './ChatNotice';

interface Props {
  chat: Chat;
  onReload: (chatId: string) => void;
}

export function HistoryStatus({ chat, onReload }: Props) {
  if (chat.historyStatus === 'loading') return <ChatNotice>Загружаем историю…</ChatNotice>;

  if (chat.historyStatus === 'error') {
    return (
      <ChatNotice>
        Не удалось загрузить историю.{' '}
        <button type="button" className="text-accent underline" onClick={() => onReload(chat.chatId)}>
          Повторить
        </button>
      </ChatNotice>
    );
  }

  if (chat.historyStatus === 'loaded' && chat.messages.length === 0) {
    return <ChatNotice>Сообщений пока нет</ChatNotice>;
  }

  return null;
}
