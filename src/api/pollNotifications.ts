import { errorMessage, isAuthError } from './errors';
import { deleteNotification, receiveNotification } from './greenApi';
import type { Credentials, ReceivedNotification } from './types';

const RETRY_DELAY_MS = 5000;

export interface PollHandlers {
  onNotification: (body: ReceivedNotification['body']) => void;
  onConnectionError: (message: string | null) => void;
  onUnauthorized: () => void;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener('abort', done, { once: true });
  });
}

export async function pollNotifications(
  credentials: Credentials,
  signal: AbortSignal,
  handlers: PollHandlers,
  retryDelayMs = RETRY_DELAY_MS,
): Promise<void> {
  while (!signal.aborted) {
    try {
      const notification = await receiveNotification(credentials, signal);
      handlers.onConnectionError(null);
      if (!notification) continue;

      try {
        handlers.onNotification(notification.body);
      } catch (error) {
        // A malformed notification must not block the queue.
        console.error('Failed to handle notification', notification, error);
      }
      await deleteNotification(credentials, notification.receiptId, signal);
    } catch (error) {
      if (signal.aborted) return;
      if (isAuthError(error)) {
        handlers.onUnauthorized();
        return;
      }
      handlers.onConnectionError(errorMessage(error, 'Ошибка получения сообщений'));
      await sleep(retryDelayMs, signal);
    }
  }
}
