import { GreenApiError, messageForStatus, NETWORK_ERROR_STATUS, TIMEOUT_MESSAGE } from './errors';
import type { Credentials } from './types';

const DEFAULT_TIMEOUT_MS = 15_000;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function buildUrl(credentials: Credentials, method: string, suffix = ''): string {
  const base = credentials.apiUrl.replace(/\/+$/, '');
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`;
}

async function fetchText(url: string, options: RequestOptions): Promise<{ status: number; ok: boolean; text: string }> {
  const { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    return { status: response.status, ok: response.ok, text: response.ok ? await response.text() : '' };
  } catch (error) {
    if (signal?.aborted) throw error;
    const message = timeout.aborted ? TIMEOUT_MESSAGE : messageForStatus(NETWORK_ERROR_STATUS);
    throw new GreenApiError(message, NETWORK_ERROR_STATUS);
  }
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T | null> {
  const { status, ok, text } = await fetchText(url, options);
  if (!ok) throw new GreenApiError(messageForStatus(status), status);

  if (!text || text === 'null') return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GreenApiError('Некорректный ответ сервера — проверьте apiUrl', status);
  }
}

export async function requestRequired<T>(url: string, options?: RequestOptions): Promise<T> {
  const data = await request<T>(url, options);
  if (data === null) throw new GreenApiError('Пустой ответ сервера', 200);
  return data;
}
