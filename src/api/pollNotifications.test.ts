import { afterEach, describe, expect, it, vi } from 'vitest';

import { GreenApiError } from './errors';
import { deleteNotification, receiveNotification } from './greenApi';
import { type PollHandlers, pollNotifications } from './pollNotifications';
import type { Credentials, ReceivedNotification } from './types';

vi.mock('./greenApi', () => ({ receiveNotification: vi.fn(), deleteNotification: vi.fn() }));

const receive = vi.mocked(receiveNotification);
const remove = vi.mocked(deleteNotification);
const credentials: Credentials = { apiUrl: 'https://api.example.com', idInstance: '1', apiTokenInstance: 'token' };
const notification: ReceivedNotification = { receiptId: 7, body: { typeWebhook: 'incomingMessageReceived' } };

function setup() {
  const controller = new AbortController();
  const handlers: PollHandlers = {
    onNotification: vi.fn(),
    onConnectionError: vi.fn(),
    onUnauthorized: vi.fn(),
  };
  const stopAfter = (calls: number) =>
    receive.mockImplementation(async () => {
      if (receive.mock.calls.length >= calls) controller.abort();
      return null;
    });
  return { controller, handlers, stopAfter };
}

afterEach(() => vi.resetAllMocks());

describe('pollNotifications', () => {
  it('handles a notification and then deletes it', async () => {
    const { controller, handlers, stopAfter } = setup();
    stopAfter(2);
    receive.mockResolvedValueOnce(notification);

    await pollNotifications(credentials, controller.signal, handlers, 0);

    expect(handlers.onNotification).toHaveBeenCalledWith(notification.body);
    expect(remove).toHaveBeenCalledWith(credentials, 7, controller.signal);
  });

  it('deletes a notification even when handling it throws', async () => {
    const { controller, handlers, stopAfter } = setup();
    stopAfter(2);
    receive.mockResolvedValueOnce(notification);
    vi.mocked(handlers.onNotification).mockImplementation(() => {
      throw new Error('malformed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await pollNotifications(credentials, controller.signal, handlers, 0);

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('reports a network error and keeps polling', async () => {
    const { controller, handlers, stopAfter } = setup();
    stopAfter(2);
    receive.mockRejectedValueOnce(new GreenApiError('offline', 0));

    await pollNotifications(credentials, controller.signal, handlers, 0);

    expect(handlers.onConnectionError).toHaveBeenNthCalledWith(1, 'offline');
    expect(handlers.onConnectionError).toHaveBeenLastCalledWith(null);
  });

  it('stops on an auth error', async () => {
    const { controller, handlers } = setup();
    receive.mockRejectedValue(new GreenApiError('unauthorized', 401));

    await pollNotifications(credentials, controller.signal, handlers, 0);

    expect(handlers.onUnauthorized).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledTimes(1);
  });

  it('receives the same notification again when deleting it failed', async () => {
    const { controller, handlers, stopAfter } = setup();
    stopAfter(3);
    receive.mockResolvedValueOnce(notification).mockResolvedValueOnce(notification);
    remove.mockRejectedValueOnce(new GreenApiError('offline', 0));

    await pollNotifications(credentials, controller.signal, handlers, 0);

    expect(handlers.onNotification).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
  });
});
