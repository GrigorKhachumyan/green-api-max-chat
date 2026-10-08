import type { Credentials } from '@/api';
import type { ChatMeta, MessagePreview } from '@/state';

import { isValidApiUrl } from './url';

const CREDENTIALS_KEY = 'max-chat:credentials';
const CHATS_KEY = 'max-chat:chats';

function read(key: string): unknown {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the app works without persistence.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidCredentials(value: unknown): value is Credentials {
  if (!isRecord(value)) return false;
  const { apiUrl, idInstance, apiTokenInstance } = value;
  return (
    typeof apiUrl === 'string' &&
    isValidApiUrl(apiUrl) &&
    typeof idInstance === 'string' &&
    /^\d+$/.test(idInstance) &&
    typeof apiTokenInstance === 'string' &&
    apiTokenInstance.length > 0
  );
}

function isValidPreview(value: unknown): value is MessagePreview {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.direction === 'incoming' || value.direction === 'outgoing') &&
    (typeof value.text === 'string' || value.text === null) &&
    (value.typeMessage === undefined || typeof value.typeMessage === 'string') &&
    typeof value.timestamp === 'number'
  );
}

function parseChatMeta(value: unknown): ChatMeta | null {
  if (!isRecord(value) || typeof value.chatId !== 'string' || !value.chatId || typeof value.name !== 'string') {
    return null;
  }
  return {
    chatId: value.chatId,
    name: value.name,
    preview: isValidPreview(value.preview) ? value.preview : undefined,
    unread:
      typeof value.unread === 'number' && Number.isInteger(value.unread) && value.unread > 0 ? value.unread : undefined,
  };
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(CREDENTIALS_KEY);
    sessionStorage.removeItem(CHATS_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export function loadSession(): { credentials: Credentials | null; corrupted: boolean } {
  const stored = read(CREDENTIALS_KEY);
  if (stored === null) return { credentials: null, corrupted: false };
  if (isValidCredentials(stored)) return { credentials: stored, corrupted: false };
  clearSession();
  return { credentials: null, corrupted: true };
}

export function loadChats(): ChatMeta[] {
  const stored = read(CHATS_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.map(parseChatMeta).filter((chat) => chat !== null);
}

export const saveCredentials = (credentials: Credentials) => write(CREDENTIALS_KEY, credentials);
export const saveChats = (chats: ChatMeta[]) => write(CHATS_KEY, chats);
