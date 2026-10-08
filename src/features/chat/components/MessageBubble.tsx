import { memo } from 'react';

import { formatTime } from '@/lib';
import { isMediaMessage, mediaLabel, type Message, type Quote } from '@/state';

import { MessageError } from './MessageError';
import { MessageStatusIcon } from './MessageStatusIcon';
import { ReplyQuote } from './ReplyQuote';

interface Props {
  message: Message;
  quote?: Quote;
  contactName: string;
  onRetry: (message: Message) => void;
}

export const MessageBubble = memo(function MessageBubble({ message, quote, contactName, onRetry }: Props) {
  const outgoing = message.direction === 'outgoing';
  const failed = message.status === 'failed';

  return (
    <div className={`flex flex-col ${outgoing ? 'items-end' : 'items-start'}`}>
      <div className="flex max-w-[80%] min-w-0 items-end gap-2 md:max-w-[65%]">
        <div
          className={`min-w-0 rounded-2xl px-3 py-2 shadow-[0_1px_1px_rgba(20,30,60,0.06)] ${
            outgoing ? 'rounded-br-md bg-bubble-out' : 'rounded-bl-md bg-bubble-in'
          }`}
        >
          {quote && <ReplyQuote quote={quote} contactName={contactName} />}
          {isMediaMessage(message) && (
            <p className="mb-1 text-sm text-muted">
              <span className="font-medium text-ink/80">{mediaLabel(message.typeMessage)}</span>
              <span className="block text-xs">Откройте в мессенджере — тут поддерживается только текст</span>
            </p>
          )}
          {message.text !== null && (
            <p className="text-[15px] leading-snug wrap-anywhere whitespace-pre-wrap">{message.text}</p>
          )}
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted">
            {message.edited && <span>изменено</span>}
            <time dateTime={new Date(message.timestamp).toISOString()}>{formatTime(message.timestamp)}</time>
            {outgoing && message.status && <MessageStatusIcon status={message.status} />}
          </div>
        </div>

        {failed && (
          <span
            title={message.error ?? 'Ошибка отправки'}
            className="mb-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger text-xs font-bold text-white"
          >
            !
          </span>
        )}
      </div>

      {failed && <MessageError message={message} onRetry={onRetry} />}
    </div>
  );
});
