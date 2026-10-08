import { isLocalMessage, type Message } from '@/state';

interface Props {
  message: Message;
  onRetry: (message: Message) => void;
}

export function MessageError({ message, onRetry }: Props) {
  return (
    <p className="mt-1 text-xs text-danger">
      {message.error ?? 'Ошибка отправки'}
      {isLocalMessage(message) && (
        <>
          {' · '}
          <button type="button" className="font-medium underline" onClick={() => onRetry(message)}>
            Повторить
          </button>
        </>
      )}
    </p>
  );
}
