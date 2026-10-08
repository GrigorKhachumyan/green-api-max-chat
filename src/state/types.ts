export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  direction: 'incoming' | 'outgoing';
  text: string | null;
  typeMessage?: string;
  timestamp: number;
  status?: MessageStatus;
  error?: string;
  edited?: boolean;
  /** The message this one replies to; the text is known only when the history provides it. */
  replyTo?: { id: string; text?: string };
}

export type MessagePreview = Pick<Message, 'id' | 'direction' | 'text' | 'typeMessage' | 'timestamp'>;

export interface ChatMeta {
  chatId: string;
  name: string;
  preview?: MessagePreview;
  unread?: number;
}

export interface Chat extends ChatMeta {
  messages: Message[];
  historyStatus: 'idle' | 'loading' | 'loaded' | 'error';
  unread: number;
}

export interface ChatState {
  chats: Record<string, Chat>;
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'chatsRestored'; chats: ChatMeta[] }
  | { type: 'chatOpened'; chat: ChatMeta }
  | { type: 'chatSelected'; chatId: string | null }
  | { type: 'messageQueued'; chatId: string; localId: string; text: string; timestamp: number }
  | { type: 'messageSent'; chatId: string; localId: string; idMessage: string }
  | { type: 'messageFailed'; chatId: string; localId: string; error: string }
  | { type: 'messageRetried'; chatId: string; localId: string }
  | { type: 'messageReceived'; message: Message; chatName?: string }
  | { type: 'messageEdited'; chatId: string; idMessage: string; text: string }
  | { type: 'messageDeleted'; chatId: string; idMessage: string }
  | { type: 'statusUpdated'; chatId: string; idMessage: string; status: MessageStatus; error?: string }
  | { type: 'historyRequested'; chatId: string }
  | { type: 'historyLoaded'; chatId: string; messages: Message[] }
  | { type: 'historyFailed'; chatId: string };
