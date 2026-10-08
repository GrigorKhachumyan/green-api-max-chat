import { useCallback, useEffect, useReducer, useRef } from 'react';

import { type Credentials, errorMessage, getChatHistory, sendMessage } from '@/api';
import { loadChats, saveChats } from '@/lib';
import {
  type Chat,
  type ChatMeta,
  chatReducer,
  createLocalId,
  initialChatState,
  lastMessage,
  type Message,
  messagesFromHistory,
  toPreview,
} from '@/state';

function toChatMeta(chat: Chat): ChatMeta {
  const last = lastMessage(chat);
  return { chatId: chat.chatId, name: chat.name, preview: last && toPreview(last), unread: chat.unread };
}

function restoreState() {
  return chatReducer(initialChatState, { type: 'chatsRestored', chats: loadChats() });
}

export function useChat(credentials: Credentials) {
  const [state, dispatch] = useReducer(chatReducer, undefined, restoreState);
  const historyRequests = useRef(new Set<string>());
  const activeChat = state.activeChatId ? state.chats[state.activeChatId] : null;

  useEffect(() => {
    saveChats(Object.values(state.chats).map(toChatMeta));
  }, [state.chats]);

  const loadHistory = useCallback(
    async (chatId: string) => {
      if (historyRequests.current.has(chatId)) return;
      historyRequests.current.add(chatId);
      dispatch({ type: 'historyRequested', chatId });
      try {
        const items = await getChatHistory(credentials, chatId);
        dispatch({ type: 'historyLoaded', chatId, messages: messagesFromHistory(items) });
      } catch {
        dispatch({ type: 'historyFailed', chatId });
      } finally {
        historyRequests.current.delete(chatId);
      }
    },
    [credentials],
  );

  useEffect(() => {
    if (activeChat?.historyStatus === 'idle') void loadHistory(activeChat.chatId);
  }, [activeChat, loadHistory]);

  const deliver = useCallback(
    async (chatId: string, localId: string, text: string) => {
      try {
        const { idMessage } = await sendMessage(credentials, chatId, text);
        dispatch({ type: 'messageSent', chatId, localId, idMessage });
      } catch (error) {
        dispatch({ type: 'messageFailed', chatId, localId, error: errorMessage(error, 'Не удалось отправить') });
      }
    },
    [credentials],
  );

  const send = useCallback(
    (text: string) => {
      const chatId = state.activeChatId;
      if (!chatId) return;
      const localId = createLocalId();
      dispatch({ type: 'messageQueued', chatId, localId, text, timestamp: Date.now() });
      void deliver(chatId, localId, text);
    },
    [state.activeChatId, deliver],
  );

  const retry = useCallback(
    (message: Message) => {
      if (message.text === null) return;
      dispatch({ type: 'messageRetried', chatId: message.chatId, localId: message.id });
      void deliver(message.chatId, message.id, message.text);
    },
    [deliver],
  );

  const openChat = useCallback((chat: ChatMeta) => dispatch({ type: 'chatOpened', chat }), []);
  const selectChat = useCallback((chatId: string | null) => dispatch({ type: 'chatSelected', chatId }), []);

  return { state, dispatch, activeChat, send, retry, loadHistory, openChat, selectChat };
}
