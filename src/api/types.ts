export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type InstanceState = 'notAuthorized' | 'authorized' | 'blocked' | 'suspended' | 'starting' | 'pendingPassword';

export interface StateInstanceResponse {
  stateInstance: InstanceState;
}

export type AccountQuery = ({ phoneNumber: number } | { username: string }) & { force?: boolean };

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount';

export interface HistoryItem {
  type: 'incoming' | 'outgoing';
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  statusMessage?: DeliveryStatus | 'pending';
  isEdited?: boolean;
  isDeleted?: boolean;
  quotedMessage?: { stanzaId: string; textMessage?: string };
  caption?: string;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string; stanzaId?: string };
  fileMessageData?: { caption?: string };
  quotedMessage?: { stanzaId: string; textMessage?: string };
  editedMessageData?: { textMessage: string; stanzaId: string };
  deletedMessageData?: { stanzaId: string };
}

export interface SenderData {
  chatId: string;
  chatName?: string;
  senderName?: string;
}

interface MessageNotificationBase {
  idMessage: string;
  timestamp: number;
  senderData: SenderData;
  messageData: MessageData;
}

export interface IncomingMessageNotification extends MessageNotificationBase {
  typeWebhook: 'incomingMessageReceived';
}

export interface OutgoingMessageNotification extends MessageNotificationBase {
  typeWebhook: 'outgoingMessageReceived' | 'outgoingAPIMessageReceived';
}

export interface OutgoingMessageStatusNotification {
  typeWebhook: 'outgoingMessageStatus';
  chatId: string;
  idMessage: string;
  timestamp: number;
  status: DeliveryStatus;
}

export interface StateInstanceChangedNotification {
  typeWebhook: 'stateInstanceChanged';
  stateInstance: InstanceState;
}

export type NotificationBody =
  | IncomingMessageNotification
  | OutgoingMessageNotification
  | OutgoingMessageStatusNotification
  | StateInstanceChangedNotification;

export interface ReceivedNotification {
  receiptId: number;
  body: NotificationBody | { typeWebhook: string };
}
