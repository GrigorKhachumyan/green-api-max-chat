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

  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // A restored session skips the login check, so the instance could have been logged out meanwhile.
    // Right after the login it was just checked: a second request would hit the rate limit (429).
    if (checkInstanceState) {
      getStateInstance(credentials, signal)
        .then(({ stateInstance }) => setInstanceState(stateInstance))
        .catch((error: unknown) => {
          if (!signal.aborted && isAuthError(error)) onUnauthorizedRef.current();
        });
    }

    const handlers: PollHandlers = {
      onNotification: (body) => handleNotification(body, dispatch, setInstanceState),
      onConnectionError: setConnectionError,
      onUnauthorized: () => onUnauthorizedRef.current(),
    };
    void pollExclusively(credentials.idInstance, signal, setStandby, () =>
      pollNotifications(credentials, signal, handlers),
    );

    return () => controller.abort();
  }, [credentials, dispatch, checkInstanceState]);

  return { connectionError, instanceState, standby };
}
