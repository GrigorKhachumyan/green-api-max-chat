import type { HistoryItem, IncomingMessageNotification, MessageData, OutgoingMessageNotification } from '@/api';

import type { Message } from './types';

const TEXT_TYPES = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage']);
const SERVICE_TYPES = new Set(['reactionMessage', 'editedMessage', 'deletedMessage']);

export const FAILURE_REASONS = {
  failed: 'Не доставлено',
  noAccount: 'Получатель не зарегистрирован в мессенджере',
};

const MEDIA_LABELS: Record<string, string> = {
  imageMessage: 'Фото',
  videoMessage: 'Видео',
  audioMessage: 'Голосовое сообщение',
  documentMessage: 'Документ',
  stickerMessage: 'Стикер',
  locationMessage: 'Геолокация',
  contactMessage: 'Контакт',
  pollMessage: 'Опрос',
};

export function isServiceMessage(typeMessage: string): boolean {
  return SERVICE_TYPES.has(typeMessage);
}

export function isPersonalChat(chatId: string): boolean {
  return !chatId.startsWith('-');
}

export function mediaLabel(typeMessage?: string): string {
  return (typeMessage && MEDIA_LABELS[typeMessage]) || 'Сообщение';
}

/** A photo, video, file, etc.: it is not shown, only its caption (stored in `text`) is. */
export function isMediaMessage({ text, typeMessage }: Pick<Message, 'text' | 'typeMessage'>): boolean {
  return typeMessage ? !TEXT_TYPES.has(typeMessage) : text === null;
}

/** One line for the chat list and quotes: "Фото: caption", the text, or the media label. */
export function previewText(message: Pick<Message, 'text' | 'typeMessage'>): string {
  const label = mediaLabel(message.typeMessage);
  if (!isMediaMessage(message)) return message.text ?? label;
  return message.text ? `${label}: ${message.text}` : label;
}

function extractText(data: MessageData): string | null {
  if (!TEXT_TYPES.has(data.typeMessage)) return data.fileMessageData?.caption || null;
  return data.textMessageData?.textMessage ?? data.extendedTextMessageData?.text ?? null;
}

/** The MAX docs put the quoted id into extendedTextMessageData; the WhatsApp format sends a quotedMessage object. */
function replyFromNotification({ extendedTextMessageData, quotedMessage }: MessageData): Message['replyTo'] {
  const id = quotedMessage?.stanzaId ?? extendedTextMessageData?.stanzaId;
  return id ? { id, text: quotedMessage?.textMessage } : undefined;
}

export function messageFromNotification(body: IncomingMessageNotification | OutgoingMessageNotification): Message {
  const outgoing = body.typeWebhook !== 'incomingMessageReceived';
  return {
    id: body.idMessage,
    chatId: body.senderData.chatId,
    direction: outgoing ? 'outgoing' : 'incoming',
    text: extractText(body.messageData),
    typeMessage: body.messageData.typeMessage,
    timestamp: body.timestamp * 1000,
    status: outgoing ? 'sent' : undefined,
    replyTo: replyFromNotification(body.messageData),
  };
}

function historyStatus({ type, statusMessage }: HistoryItem): Pick<Message, 'status' | 'error'> {
  if (type !== 'outgoing') return {};
  if (statusMessage === 'failed' || statusMessage === 'noAccount') {
    return { status: 'failed', error: FAILURE_REASONS[statusMessage] };
  }
  return { status: statusMessage ?? 'sent' };
}

export function messageFromHistory(item: HistoryItem): Message {
  return {
    id: item.idMessage,
    chatId: item.chatId,
    direction: item.type,
    text: TEXT_TYPES.has(item.typeMessage) ? (item.textMessage ?? null) : item.caption || null,
    typeMessage: item.typeMessage,
    timestamp: item.timestamp * 1000,
    edited: item.isEdited || undefined,
    replyTo: item.quotedMessage ? { id: item.quotedMessage.stanzaId, text: item.quotedMessage.textMessage } : undefined,
    ...historyStatus(item),
  };
}

export function messagesFromHistory(items: HistoryItem[]): Message[] {
  return items.filter((item) => !item.isDeleted && !isServiceMessage(item.typeMessage)).map(messageFromHistory);
}
