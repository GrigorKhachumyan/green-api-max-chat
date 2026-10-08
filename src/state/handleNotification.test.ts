import { describe, expect, it, vi } from 'vitest';

import type { ReceivedNotification } from '@/api';

import { handleNotification } from './handleNotification';

function run(body: ReceivedNotification['body']) {
  const dispatch = vi.fn();
  const onInstanceState = vi.fn();
  handleNotification(body, dispatch, onInstanceState);
  return { dispatch, onInstanceState };
}

const senderData = { chatId: '100', chatName: '', senderName: 'Me' };

describe('handleNotification', () => {
  it('turns an incoming text message into messageReceived', () => {
    const { dispatch } = run({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'M1',
      timestamp: 1,
      senderData: { chatId: '100', senderName: 'Bob' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'hi' } },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'messageReceived',
      chatName: 'Bob',
      message: expect.objectContaining({ id: 'M1', direction: 'incoming', text: 'hi', timestamp: 1000 }),
    });
  });

  it('reads the text of a reply and the id of the quoted message', () => {
    const { dispatch } = run({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'M2',
      timestamp: 1,
      senderData: { chatId: '100' },
      messageData: { typeMessage: 'quotedMessage', extendedTextMessageData: { text: 'yes', stanzaId: 'M1' } },
    });
    expect(dispatch.mock.calls[0][0].message).toMatchObject({ text: 'yes', replyTo: { id: 'M1' } });
  });

  it('reads the quoted message from a separate quotedMessage object', () => {
    const { dispatch } = run({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'M3',
      timestamp: 1,
      senderData: { chatId: '100' },
      messageData: {
        typeMessage: 'quotedMessage',
        extendedTextMessageData: { text: 'yes' },
        quotedMessage: { stanzaId: 'M1', textMessage: 'hi' },
      },
    });
    expect(dispatch.mock.calls[0][0].message.replyTo).toEqual({ id: 'M1', text: 'hi' });
  });

  it('does not name a chat after the account owner for outgoing messages', () => {
    const { dispatch } = run({
      typeWebhook: 'outgoingMessageReceived',
      idMessage: 'M3',
      timestamp: 1,
      senderData,
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'hi' } },
    });
    expect(dispatch.mock.calls[0][0].chatName).toBeUndefined();
  });

  it('ignores groups, reactions and unknown notification types', () => {
    const message = { idMessage: 'M4', timestamp: 1, messageData: { typeMessage: 'textMessage' } };
    expect(
      run({ typeWebhook: 'incomingMessageReceived', ...message, senderData: { chatId: '-100' } }).dispatch,
    ).not.toHaveBeenCalled();
    expect(
      run({
        typeWebhook: 'incomingMessageReceived',
        ...message,
        senderData,
        messageData: { typeMessage: 'reactionMessage' },
      }).dispatch,
    ).not.toHaveBeenCalled();
    expect(run({ typeWebhook: 'incomingCall' }).dispatch).not.toHaveBeenCalled();
  });

  it('maps noAccount to a failed status with a reason', () => {
    const { dispatch } = run({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '100',
      idMessage: 'M5',
      timestamp: 1,
      status: 'noAccount',
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'statusUpdated', status: 'failed', error: expect.any(String) }),
    );
  });

  it('applies an edit to the original message, not as a new one', () => {
    const { dispatch } = run({
      typeWebhook: 'outgoingMessageReceived',
      idMessage: 'E1',
      timestamp: 2,
      senderData,
      messageData: { typeMessage: 'editedMessage', editedMessageData: { textMessage: 'fixed', stanzaId: 'M1' } },
    });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({
      type: 'messageEdited',
      chatId: '100',
      idMessage: 'M1',
      text: 'fixed',
    });
  });

  it('removes a deleted message', () => {
    const { dispatch } = run({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'D1',
      timestamp: 2,
      senderData,
      messageData: { typeMessage: 'deletedMessage', deletedMessageData: { stanzaId: 'M1' } },
    });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'messageDeleted', chatId: '100', idMessage: 'M1' });
  });

  it('reports instance state changes', () => {
    const { onInstanceState } = run({ typeWebhook: 'stateInstanceChanged', stateInstance: 'notAuthorized' });
    expect(onInstanceState).toHaveBeenCalledWith('notAuthorized');
  });
});
