import { buildUrl, request, requestRequired } from './client';
import { GreenApiError } from './errors';
import type {
  AccountQuery,
  CheckAccountResponse,
  Credentials,
  HistoryItem,
  ReceivedNotification,
  SendMessageResponse,
  StateInstanceResponse,
} from './types';

const RECEIVE_TIMEOUT_SECONDS = 20;
const RECEIVE_CLIENT_TIMEOUT_MS = (RECEIVE_TIMEOUT_SECONDS + 10) * 1000;
const HISTORY_SIZE = 50;

export function getStateInstance(credentials: Credentials, signal?: AbortSignal): Promise<StateInstanceResponse> {
  return requestRequired(buildUrl(credentials, 'getStateInstance'), { signal });
}

export function checkAccount(credentials: Credentials, query: AccountQuery): Promise<CheckAccountResponse> {
  return requestRequired(buildUrl(credentials, 'checkAccount'), { method: 'POST', body: query });
}

export function sendMessage(credentials: Credentials, chatId: string, message: string): Promise<SendMessageResponse> {
  return requestRequired(buildUrl(credentials, 'sendMessage'), { method: 'POST', body: { chatId, message } });
}

export async function getChatHistory(credentials: Credentials, chatId: string): Promise<HistoryItem[]> {
  const items = await request<HistoryItem[]>(buildUrl(credentials, 'getChatHistory'), {
    method: 'POST',
    body: { chatId, count: HISTORY_SIZE },
  });
  return items ?? [];
}

export async function receiveNotification(
  credentials: Credentials,
  signal: AbortSignal,
): Promise<ReceivedNotification | null> {
  try {
    const url = buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${RECEIVE_TIMEOUT_SECONDS}`);
    return await request<ReceivedNotification>(url, { signal, timeoutMs: RECEIVE_CLIENT_TIMEOUT_MS });
  } catch (error) {
    // 408: the long-polling window ended with an empty queue.
    if (error instanceof GreenApiError && error.status === 408) return null;
    throw error;
  }
}

export async function deleteNotification(credentials: Credentials, receiptId: number, signal?: AbortSignal) {
  await request(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), { method: 'DELETE', signal });
}
