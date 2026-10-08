import { mergeStatus, updateMessage, upsertMessage } from './messages';
import type { Chat, ChatAction, ChatMeta, ChatState } from './types';

export const initialChatState: ChatState = { chats: {}, activeChatId: null };

function createChat({ chatId, name, preview, unread = 0 }: ChatMeta): Chat {
  return { chatId, name, preview, messages: [], historyStatus: 'idle', unread };
}

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  const chat = state.chats[chatId];
  if (!chat) return state;
  return { ...state, chats: { ...state.chats, [chatId]: update(chat) } };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chatsRestored':
      return { ...state, chats: Object.fromEntries(action.chats.map((meta) => [meta.chatId, createChat(meta)])) };

    case 'chatOpened': {
      const existing = state.chats[action.chat.chatId];
      const chat = existing ? { ...existing, unread: 0 } : createChat(action.chat);
      return { chats: { ...state.chats, [chat.chatId]: chat }, activeChatId: chat.chatId };
    }

    case 'chatSelected': {
      const next = { ...state, activeChatId: action.chatId };
      return action.chatId ? updateChat(next, action.chatId, (chat) => ({ ...chat, unread: 0 })) : next;
    }

    case 'messageQueued':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: upsertMessage(chat.messages, {
          id: action.localId,
          chatId: action.chatId,
          direction: 'outgoing',
          text: action.text,
          timestamp: action.timestamp,
          status: 'pending',
        }),
      }));

    case 'messageSent':
      return updateChat(state, action.chatId, (chat) => {
        // The notification about this message can arrive before the sendMessage response.
        if (chat.messages.some((m) => m.id === action.idMessage)) {
          return { ...chat, messages: chat.messages.filter((m) => m.id !== action.localId) };
        }
        return updateMessage(chat, action.localId, (m) => ({
          ...m,
          id: action.idMessage,
          status: mergeStatus(m.status, 'sent'),
          error: undefined,
        }));
      });

    case 'messageFailed':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.localId, (m) => ({ ...m, status: 'failed', error: action.error })),
      );

    case 'messageRetried':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.localId, (m) => ({ ...m, status: 'pending', error: undefined })),
      );

    case 'messageReceived': {
      const { message } = action;
      const chat =
        state.chats[message.chatId] ?? createChat({ chatId: message.chatId, name: action.chatName || message.chatId });
      const isNew = !chat.messages.some((m) => m.id === message.id);
      const countsAsUnread = isNew && message.direction === 'incoming' && state.activeChatId !== chat.chatId;
      return {
        ...state,
        chats: {
          ...state.chats,
          [chat.chatId]: {
            ...chat,
            messages: upsertMessage(chat.messages, message),
            unread: countsAsUnread ? chat.unread + 1 : chat.unread,
          },
        },
      };
    }

    case 'messageEdited':
      return updateChat(state, action.chatId, (chat) => ({
        ...updateMessage(chat, action.idMessage, (m) => ({ ...m, text: action.text, edited: true })),
        preview: chat.preview?.id === action.idMessage ? { ...chat.preview, text: action.text } : chat.preview,
      }));

    case 'messageDeleted':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: chat.messages.filter((m) => m.id !== action.idMessage),
        preview: chat.preview?.id === action.idMessage ? undefined : chat.preview,
      }));

    case 'statusUpdated':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.idMessage, (m) => {
          const status = mergeStatus(m.status, action.status);
          return { ...m, status, error: status === 'failed' ? (action.error ?? m.error) : undefined };
        }),
      );

    case 'historyRequested':
      return updateChat(state, action.chatId, (chat) => ({ ...chat, historyStatus: 'loading' }));

    case 'historyLoaded':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        historyStatus: 'loaded',
        messages: action.messages.reduce(upsertMessage, chat.messages),
        // The loaded messages are the source of truth now; the stored preview may be outdated.
        preview: undefined,
      }));

    case 'historyFailed':
      return updateChat(state, action.chatId, (chat) => ({ ...chat, historyStatus: 'error' }));
  }
}
