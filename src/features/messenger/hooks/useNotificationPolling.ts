import { type Dispatch, useEffect, useRef, useState } from 'react';

import {
  type Credentials,
  getStateInstance,
  type InstanceState,
  isAuthError,
  type PollHandlers,
  pollNotifications,
} from '@/api';
import { type ChatAction, handleNotification } from '@/state';

const STANDBY_NOTICE_DELAY_MS = 1000;
const WAKE_AFTER_HIDDEN_MS = 10_000;

/**
 * Counts the moments when the receive loop should start over: the network is back, or the page is visible again
 * after a while. Mobile browsers freeze background tabs, and the long-polling request that was open is dead by then.
 */
function useWakeUps(): number {
  const [wakeUps, setWakeUps] = useState(0);

  useEffect(() => {
    let hiddenAt = 0;
    const wake = () => setWakeUps((count) => count + 1);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > WAKE_AFTER_HIDDEN_MS) wake();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', wake);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', wake);
    };
  }, []);

  return wakeUps;
}

async function pollExclusively(
  idInstance: string,
  signal: AbortSignal,
  onStandby: (standby: boolean) => void,
  poll: () => Promise<void>,
): Promise<void> {
  if (!navigator.locks) return poll();

  const standbyTimer = setTimeout(() => onStandby(true), STANDBY_NOTICE_DELAY_MS);
  signal.addEventListener('abort', () => clearTimeout(standbyTimer), { once: true });
  try {
    await navigator.locks.request(`max-chat:poll:${idInstance}`, { signal }, () => {
      clearTimeout(standbyTimer);
      onStandby(false);
      return poll();
    });
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}

export function useNotificationPolling(
  credentials: Credentials,
  dispatch: Dispatch<ChatAction>,
  onUnauthorized: () => void,
  checkInstanceState: boolean,
) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [instanceState, setInstanceState] = useState<InstanceState>('authorized');
  const [standby, setStandby] = useState(false);

  const wakeUps = useWakeUps();

  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  });

  // A restored session skips the login check, so the instance could have been logged out meanwhile.
  // Right after the login it was just checked: a second request would hit the rate limit (429).
  useEffect(() => {
    if (!checkInstanceState) return;
    const controller = new AbortController();
    getStateInstance(credentials, controller.signal)
      .then(({ stateInstance }) => setInstanceState(stateInstance))
      .catch((error: unknown) => {
        if (!controller.signal.aborted && isAuthError(error)) onUnauthorizedRef.current();
      });
    return () => controller.abort();
  }, [credentials, checkInstanceState]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const handlers: PollHandlers = {
      onNotification: (body) => handleNotification(body, dispatch, setInstanceState),
      onConnectionError: setConnectionError,
      onUnauthorized: () => onUnauthorizedRef.current(),
    };
    void pollExclusively(credentials.idInstance, signal, setStandby, () =>
      pollNotifications(credentials, signal, handlers),
    );

    return () => controller.abort();
  }, [credentials, dispatch, wakeUps]);

  return { connectionError, instanceState, standby };
}
