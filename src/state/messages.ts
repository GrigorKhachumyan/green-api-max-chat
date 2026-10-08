import { previewText } from './mappers';
import type { Chat, Message, MessagePreview, MessageStatus } from './types';

const LOCAL_ID_PREFIX = 'local-';

const STATUS_RANK: Record<MessageStatus, number> = {
  failed: -1,
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

let localSequence = 0;

export function createLocalId(): string {
  localSequence += 1;
  return `${LOCAL_ID_PREFIX}${Date.now()}-${localSequence}`;
}

export function isLocalMessage(message: Message): boolean {
  return message.id.startsWith(LOCAL_ID_PREFIX);
}

export function mergeStatus(current?: MessageStatus, next?: MessageStatus): MessageStatus | undefined {
  if (!current) return next;
  if (!next || !(next in STATUS_RANK)) return current;
  if (next === 'failed') return current === 'pending' || current === 'sent' ? 'failed' : current;
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current;
}

export function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const index = messages.findIndex((m) => m.id === incoming.id);
  if (index === -1) return [...messages, incoming].sort((a, b) => a.timestamp - b.timestamp);

  const existing = messages[index];
  const status = mergeStatus(existing.status, incoming.status);
  const merged: Message = {
    ...existing,
    // The history carries the current text of an edited message; otherwise the first known text wins.
    text: incoming.edited ? incoming.text : (existing.text ?? incoming.text),
    typeMessage: existing.typeMessage ?? incoming.typeMessage,
    edited: existing.edited || incoming.edited,
    replyTo: existing.replyTo?.text ? existing.replyTo : (incoming.replyTo ?? existing.replyTo),
    status,
    error: status === 'failed' ? (existing.error ?? incoming.error) : undefined,
  };
  return messages.map((m, i) => (i === index ? merged : m));
}

export function updateMessage(chat: Chat, id: string, update: (message: Message) => Message): Chat {
  return { ...chat, messages: chat.messages.map((m) => (m.id === id ? update(m) : m)) };
}

export function lastMessage(chat: Chat): MessagePreview | undefined {
  return chat.messages.at(-1) ?? chat.preview;
}

export function toPreview({ id, direction, text, typeMessage, timestamp }: MessagePreview): MessagePreview {
  return { id, direction, text, typeMessage, timestamp };
}

export interface Quote {
  /** Unknown when the original message is not loaded. */
  direction?: Message['direction'];
  text: string;
}

/** MAX notifications carry only the id of the quoted message, so its text is taken from the loaded chat. */
export function quoteFor(replyTo: NonNullable<Message['replyTo']>, original?: Message): Quote {
  if (original) return { direction: original.direction, text: previewText(original) };
  return { text: replyTo.text ?? 'Исходное сообщение недоступно' };
}
