import { describe, expect, it } from 'vitest';

import { createLocalId, isLocalMessage, mergeStatus, quoteFor, upsertMessage } from './messages';
import type { Message, MessageStatus } from './types';

describe('messages', () => {
  it('moves a status only forward', () => {
    expect(mergeStatus('read', 'delivered')).toBe('read');
    expect(mergeStatus('sent', 'delivered')).toBe('delivered');
    expect(mergeStatus('pending', 'failed')).toBe('failed');
    expect(mergeStatus('delivered', 'failed')).toBe('delivered');
  });

  it('ignores statuses it does not know', () => {
    expect(mergeStatus('sent', 'deleted' as MessageStatus)).toBe('sent');
  });

  it('creates unique local ids', () => {
    const id = createLocalId();
    expect(id).not.toBe(createLocalId());
    expect(isLocalMessage({ id, chatId: '1', direction: 'outgoing', text: '', timestamp: 0 })).toBe(true);
  });

  it('quotes the original message when it is loaded', () => {
    const original: Message = { id: 'M1', chatId: '1', direction: 'outgoing', text: 'hi', timestamp: 0 };
    expect(quoteFor({ id: 'M1' }, original)).toEqual({ direction: 'outgoing', text: 'hi' });

    const photo: Message = { ...original, text: null, typeMessage: 'imageMessage' };
    expect(quoteFor({ id: 'M1' }, photo).text).toBe('Фото');
  });

  it('falls back to the text from the history, then to a placeholder', () => {
    expect(quoteFor({ id: 'M1', text: 'from history' })).toEqual({ text: 'from history' });
    expect(quoteFor({ id: 'M1' })).toEqual({ text: 'Исходное сообщение недоступно' });
  });

  it('keeps the quoted text from the history when merging with a live message', () => {
    const live: Message = {
      id: 'M2',
      chatId: '1',
      direction: 'incoming',
      text: 'yes',
      timestamp: 1,
      replyTo: { id: 'M1' },
    };
    const fromHistory: Message = { ...live, replyTo: { id: 'M1', text: 'hi' } };
    expect(upsertMessage([live], fromHistory)[0].replyTo).toEqual({ id: 'M1', text: 'hi' });
  });
});
