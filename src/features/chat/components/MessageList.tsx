import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { type Chat, isLocalMessage, type Message, quoteFor } from '@/state';

import { HistoryStatus } from './HistoryStatus';
import { MessageBubble } from './MessageBubble';

const STICK_TO_BOTTOM_PX = 80;

interface Props {
  chat: Chat;
  onRetry: (message: Message) => void;
  onReloadHistory: (chatId: string) => void;
}

export function MessageList({ chat, onRetry, onReloadHistory }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const localCount = chat.messages.filter(isLocalMessage).length;
  const localCountRef = useRef(localCount);
  const messagesById = useMemo(() => new Map(chat.messages.map((m) => [m.id, m])), [chat.messages]);

  useLayoutEffect(() => {
    atBottomRef.current = true;
  }, [chat.chatId]);

  // Follow new messages only when the user is not reading older ones, or when they sent a message themselves.
  useLayoutEffect(() => {
    const sentByUser = localCount > localCountRef.current;
    localCountRef.current = localCount;
    const element = scrollRef.current;
    if (element && (atBottomRef.current || sentByUser)) element.scrollTop = element.scrollHeight;
  }, [chat.chatId, chat.messages.length, localCount]);

  // The list gets shorter when the phone keyboard opens or the composer grows: keep the last message in view.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      if (atBottomRef.current) element.scrollTop = element.scrollHeight;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element) return;
    atBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < STICK_TO_BOTTOM_PX;
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <div
        role="log"
        aria-live="polite"
        aria-label={`Переписка с ${chat.name}`}
        className="mx-auto flex max-w-3xl flex-col gap-1.5"
      >
        <HistoryStatus chat={chat} onReload={onReloadHistory} />
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            quote={message.replyTo && quoteFor(message.replyTo, messagesById.get(message.replyTo.id))}
            contactName={chat.name}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}
