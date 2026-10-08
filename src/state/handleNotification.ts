import type { Dispatch } from 'react';

import type { InstanceState, NotificationBody, ReceivedNotification } from '@/api';

import { FAILURE_REASONS, isPersonalChat, isServiceMessage, messageFromNotification } from './mappers';
import type { ChatAction } from './types';

const KNOWN_TYPES = new Set<string>([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
  'outgoingMessageStatus',
  'stateInstanceChanged',
]);

function isKnown(body: ReceivedNotification['body']): body is NotificationBody {
  return KNOWN_TYPES.has(body.typeWebhook);
}

export function handleNotification(
  body: ReceivedNotification['body'],
  dispatch: Dispatch<ChatAction>,
  onInstanceState: (state: InstanceState) => void,
): void {
  if (!isKnown(body)) return;

  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived': {
      const { senderData, messageData } = body;
      const { chatId } = senderData;
      if (!isPersonalChat(chatId)) return;

      if (messageData.editedMessageData) {
        const { stanzaId, textMessage } = messageData.editedMessageData;
        dispatch({ type: 'messageEdited', chatId, idMessage: stanzaId, text: textMessage });
        return;
      }
      if (messageData.deletedMessageData) {
        dispatch({ type: 'messageDeleted', chatId, idMessage: messageData.deletedMessageData.stanzaId });
        return;
      }
      if (isServiceMessage(messageData.typeMessage)) return;

      const incoming = body.typeWebhook === 'incomingMessageReceived';
      dispatch({
        type: 'messageReceived',
        message: messageFromNotification(body),
        // In outgoing notifications senderName is the account owner, not the contact.
        chatName: senderData.chatName || (incoming ? senderData.senderName : undefined),
      });
      return;
    }

    case 'outgoingMessageStatus': {
      const { chatId, idMessage, status } = body;
      if (status === 'failed' || status === 'noAccount') {
        dispatch({ type: 'statusUpdated', chatId, idMessage, status: 'failed', error: FAILURE_REASONS[status] });
      } else {
        dispatch({ type: 'statusUpdated', chatId, idMessage, status });
      }
      return;
    }

    case 'stateInstanceChanged':
      onInstanceState(body.stateInstance);
      return;
  }
}
