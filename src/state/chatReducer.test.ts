import { describe, expect, it } from 'vitest';

import { chatReducer, initialChatState } from './chatReducer';
import { lastMessage } from './messages';
import type { ChatAction, ChatState, Message } from './types';

const CHAT_ID = '100';

function run(actions: ChatAction[], state: ChatState = initialChatState): ChatState {
  return actions.reduce(chatReducer, state);
}

function outgoing(id: string, timestamp: number, status: Message['status'] = 'sent'): Message {
  return { id, chatId: CHAT_ID, direction: 'outgoing', text: 'hi', timestamp, status };
}

const opened: ChatAction = { type: 'chatOpened', chat: { chatId: CHAT_ID, name: '+79990000000' } };
const queued: ChatAction = { type: 'messageQueued', chatId: CHAT_ID, localId: 'local-1', text: 'hi', timestamp: 1000 };

describe('chatReducer', () => {
  it('shows a queued message as pending', () => {
    const state = run([opened, queued]);
    expect(state.chats[CHAT_ID].messages).toMatchObject([{ id: 'local-1', status: 'pending' }]);
  });

  it('replaces the local id with idMessage after sending', () => {
    const state = run([opened, queued, { type: 'messageSent', chatId: CHAT_ID, localId: 'local-1', idMessage: 'M1' }]);
    expect(state.chats[CHAT_ID].messages).toMatchObject([{ id: 'M1', status: 'sent' }]);
  });

  it('does not duplicate a message whose notification arrived before the send response', () => {
    const state = run([
      opened,
      queued,
      { type: 'messageReceived', message: outgoing('M1', 1001) },
      { type: 'messageSent', chatId: CHAT_ID, localId: 'local-1', idMessage: 'M1' },
    ]);
    expect(state.chats[CHAT_ID].messages.map((m) => m.id)).toEqual(['M1']);
  });

  it('does not duplicate a message whose notification arrived after the send response', () => {
    const state = run([
      opened,
      queued,
      { type: 'messageSent', chatId: CHAT_ID, localId: 'local-1', idMessage: 'M1' },
      { type: 'messageReceived', message: outgoing('M1', 1001) },
    ]);
    expect(state.chats[CHAT_ID].messages).toHaveLength(1);
  });

  it('never moves a status backwards', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M1', 1000) },
      { type: 'statusUpdated', chatId: CHAT_ID, idMessage: 'M1', status: 'read' },
      { type: 'statusUpdated', chatId: CHAT_ID, idMessage: 'M1', status: 'delivered' },
    ]);
    expect(state.chats[CHAT_ID].messages[0].status).toBe('read');
  });

  it('marks a failed send and resets it on retry', () => {
    const failed = run([
      opened,
      queued,
      { type: 'messageFailed', chatId: CHAT_ID, localId: 'local-1', error: 'offline' },
    ]);
    expect(failed.chats[CHAT_ID].messages[0]).toMatchObject({ status: 'failed', error: 'offline' });

    const retried = chatReducer(failed, { type: 'messageRetried', chatId: CHAT_ID, localId: 'local-1' });
    expect(retried.chats[CHAT_ID].messages[0]).toMatchObject({ status: 'pending', error: undefined });
  });

  it('creates a chat for a message from a new contact and counts it as unread once', () => {
    const incoming: Message = { id: 'M9', chatId: '200', direction: 'incoming', text: 'yo', timestamp: 5 };
    const action: ChatAction = { type: 'messageReceived', message: incoming, chatName: 'Bob' };
    const state = run([opened, action, action]);
    expect(state.chats['200']).toMatchObject({ name: 'Bob', unread: 1 });
  });

  it('does not count messages of the open chat as unread', () => {
    const incoming: Message = { id: 'M9', chatId: CHAT_ID, direction: 'incoming', text: 'yo', timestamp: 5 };
    const state = run([opened, { type: 'messageReceived', message: incoming }]);
    expect(state.chats[CHAT_ID].unread).toBe(0);
  });

  it('merges history with live messages in time order without duplicates', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M2', 2000) },
      { type: 'historyLoaded', chatId: CHAT_ID, messages: [outgoing('M2', 2000, 'delivered'), outgoing('M1', 1000)] },
    ]);
    expect(state.chats[CHAT_ID].messages.map((m) => [m.id, m.status])).toEqual([
      ['M1', 'sent'],
      ['M2', 'delivered'],
    ]);
  });

  it('resets the unread counter when a chat is selected', () => {
    const incoming: Message = { id: 'M9', chatId: '200', direction: 'incoming', text: 'yo', timestamp: 5 };
    const state = run([
      opened,
      { type: 'messageReceived', message: incoming },
      { type: 'chatSelected', chatId: '200' },
    ]);
    expect(state.chats['200'].unread).toBe(0);
  });

  it('keeps the stored preview until the history is loaded', () => {
    const preview = { id: 'M0', direction: 'incoming' as const, text: 'old', timestamp: 1 };
    const restored = run([{ type: 'chatsRestored', chats: [{ chatId: CHAT_ID, name: 'Bob', preview }] }]);
    expect(lastMessage(restored.chats[CHAT_ID])).toEqual(preview);

    const loaded = chatReducer(restored, { type: 'historyLoaded', chatId: CHAT_ID, messages: [outgoing('M1', 2000)] });
    expect(lastMessage(loaded.chats[CHAT_ID])).toMatchObject({ text: 'hi', timestamp: 2000 });
  });

  it('clears the error when a failed message is later reported as delivered', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M1', 1000) },
      { type: 'statusUpdated', chatId: CHAT_ID, idMessage: 'M1', status: 'failed', error: 'Не доставлено' },
      { type: 'statusUpdated', chatId: CHAT_ID, idMessage: 'M1', status: 'read' },
    ]);
    expect(state.chats[CHAT_ID].messages[0]).toMatchObject({ status: 'read', error: undefined });
  });

  it('replaces the text of an edited message and marks it', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M1', 1000) },
      { type: 'messageEdited', chatId: CHAT_ID, idMessage: 'M1', text: 'fixed' },
    ]);
    expect(state.chats[CHAT_ID].messages).toMatchObject([{ id: 'M1', text: 'fixed', edited: true, status: 'sent' }]);
  });

  it('keeps the edited text when the history arrives later', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M1', 1000) },
      { type: 'historyLoaded', chatId: CHAT_ID, messages: [{ ...outgoing('M1', 1000), text: 'fixed', edited: true }] },
    ]);
    expect(state.chats[CHAT_ID].messages[0]).toMatchObject({ text: 'fixed', edited: true });
  });

  it('removes a deleted message and updates the chat preview', () => {
    const state = run([
      opened,
      { type: 'messageReceived', message: outgoing('M1', 1000) },
      { type: 'messageReceived', message: outgoing('M2', 2000) },
      { type: 'messageDeleted', chatId: CHAT_ID, idMessage: 'M2' },
    ]);
    expect(state.chats[CHAT_ID].messages.map((m) => m.id)).toEqual(['M1']);
    expect(lastMessage(state.chats[CHAT_ID])).toMatchObject({ timestamp: 1000 });
  });

  it('drops a stored preview when the loaded history is empty', () => {
    const preview = { id: 'M0', direction: 'outgoing' as const, text: 'deleted meanwhile', timestamp: 1 };
    const state = run([
      { type: 'chatsRestored', chats: [{ chatId: CHAT_ID, name: 'Bob', preview }] },
      { type: 'historyLoaded', chatId: CHAT_ID, messages: [] },
    ]);
    expect(lastMessage(state.chats[CHAT_ID])).toBeUndefined();
  });

  it('updates the preview of a chat that is not loaded when its last message changes', () => {
    const preview = { id: 'M0', direction: 'incoming' as const, text: 'typo', timestamp: 1 };
    const restored: ChatAction = { type: 'chatsRestored', chats: [{ chatId: CHAT_ID, name: 'Bob', preview }] };

    const edited = run([restored, { type: 'messageEdited', chatId: CHAT_ID, idMessage: 'M0', text: 'fixed' }]);
    expect(edited.chats[CHAT_ID].preview?.text).toBe('fixed');

    const deleted = run([restored, { type: 'messageDeleted', chatId: CHAT_ID, idMessage: 'M0' }]);
    expect(deleted.chats[CHAT_ID].preview).toBeUndefined();
  });
});
