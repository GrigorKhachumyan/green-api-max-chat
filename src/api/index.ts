export { errorMessage, GreenApiError, isAuthError } from './errors';
export { checkAccount, getChatHistory, getStateInstance, sendMessage } from './greenApi';
export { type PollHandlers, pollNotifications } from './pollNotifications';
export type {
  AccountQuery,
  CheckAccountResponse,
  Credentials,
  HistoryItem,
  IncomingMessageNotification,
  InstanceState,
  MessageData,
  NotificationBody,
  OutgoingMessageNotification,
  ReceivedNotification,
} from './types';
