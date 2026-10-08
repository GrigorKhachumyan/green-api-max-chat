import type { Chat, Message } from '@/state';

import { ChatHeader, Composer, MessageList } from './components';

interface Props {
  className?: string;
  chat: Chat;
  onSend: (text: string) => void;
  onRetry: (message: Message) => void;
  onReloadHistory: (chatId: string) => void;
  onBack: () => void;
}

export function ChatWindow({ className = '', chat, onSend, onRetry, onReloadHistory, onBack }: Props) {
  return (
    <section className={`min-w-0 flex-1 flex-col ${className}`}>
      <ChatHeader name={chat.name} onBack={onBack} />
      <MessageList chat={chat} onRetry={onRetry} onReloadHistory={onReloadHistory} />
      <Composer key={chat.chatId} onSend={onSend} />
    </section>
  );
}
