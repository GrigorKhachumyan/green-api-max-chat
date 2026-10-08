import { describe, expect, it } from 'vitest';

import {
  isMediaMessage,
  isPersonalChat,
  isServiceMessage,
  mediaLabel,
  messageFromHistory,
  messageFromNotification,
  messagesFromHistory,
  previewText,
} from './mappers';

describe('mappers', () => {
  it('maps a text history item', () => {
    const message = messageFromHistory({
      type: 'outgoing',
      idMessage: 'M1',
      timestamp: 10,
      typeMessage: 'textMessage',
      chatId: '1',
      textMessage: 'hello',
      statusMessage: 'read',
    });
    expect(message).toMatchObject({ id: 'M1', text: 'hello', timestamp: 10_000, status: 'read' });
  });

  it('keeps non-text messages without text', () => {
    const message = messageFromHistory({
      type: 'incoming',
      idMessage: 'M2',
      timestamp: 1,
      typeMessage: 'imageMessage',
      chatId: '1',
    });
    expect(message.text).toBeNull();
    expect(mediaLabel(message.typeMessage)).toBe('Фото');
  });

  it('treats noAccount as a failed outgoing message', () => {
    const message = messageFromHistory({
      type: 'outgoing',
      idMessage: 'M3',
      timestamp: 1,
      typeMessage: 'textMessage',
      chatId: '1',
      statusMessage: 'noAccount',
    });
    expect(message).toMatchObject({ status: 'failed', error: 'Получатель не зарегистрирован в мессенджере' });
  });

  it('recognises service messages and group chats', () => {
    expect(isServiceMessage('reactionMessage')).toBe(true);
    expect(isServiceMessage('textMessage')).toBe(false);
    expect(isPersonalChat('10000000')).toBe(true);
    expect(isPersonalChat('-10000000000000')).toBe(false);
  });

  it('maps a reply from history as text', () => {
    const message = messageFromHistory({
      type: 'incoming',
      idMessage: 'M4',
      timestamp: 1,
      typeMessage: 'quotedMessage',
      chatId: '1',
      textMessage: 'yes',
    });
    expect(message.text).toBe('yes');
  });

  it('maps a reply from history with the quoted message', () => {
    const message = messageFromHistory({
      type: 'incoming',
      idMessage: 'M5',
      timestamp: 1,
      typeMessage: 'quotedMessage',
      chatId: '1',
      textMessage: 'yes',
      quotedMessage: { stanzaId: 'M1', textMessage: 'hi' },
    });
    expect(message.replyTo).toEqual({ id: 'M1', text: 'hi' });
  });

  it('keeps edited messages from history and drops deleted ones and service records', () => {
    const base = { type: 'incoming' as const, timestamp: 1, chatId: '1', typeMessage: 'textMessage' };
    const messages = messagesFromHistory([
      { ...base, idMessage: 'M1', textMessage: 'fixed', isEdited: true },
      { ...base, idMessage: 'M2', textMessage: 'gone', isDeleted: true },
      { ...base, idMessage: 'M3', typeMessage: 'reactionMessage' },
    ]);
    expect(messages).toMatchObject([{ id: 'M1', text: 'fixed', edited: true }]);
  });

  it('keeps the caption of a photo as its text', () => {
    const message = messageFromNotification({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'P1',
      timestamp: 1,
      senderData: { chatId: '1' },
      messageData: { typeMessage: 'imageMessage', fileMessageData: { caption: 'Look' } },
    });
    expect(message).toMatchObject({ text: 'Look', typeMessage: 'imageMessage' });
    expect(isMediaMessage(message)).toBe(true);
    expect(previewText(message)).toBe('Фото: Look');

    const fromHistory = messageFromHistory({
      type: 'incoming',
      idMessage: 'P2',
      timestamp: 1,
      typeMessage: 'imageMessage',
      chatId: '1',
      caption: '',
    });
    expect(fromHistory.text).toBeNull();
    expect(previewText(fromHistory)).toBe('Фото');
  });

  it('previews text messages as their text', () => {
    expect(previewText({ text: 'hi', typeMessage: 'textMessage' })).toBe('hi');
    expect(previewText({ text: 'local', typeMessage: undefined })).toBe('local');
  });
});
