import { useCallback, useRef, useState } from 'react';

import type { Credentials } from '@/api';
import { LogoutIcon } from '@/components/icons';
import { ConfirmDialog } from '@/components/ui';
import { ChatWindow, EmptyChat } from '@/features/chat';
import { Sidebar } from '@/features/sidebar';

import { ConnectionBanners } from './components';
import { useChat, useNotificationPolling } from './hooks';

interface Props {
  credentials: Credentials;
  /** The session was restored after a reload, so the instance state was not checked at login. */
  restored: boolean;
  onLogout: () => void;
  onSessionInvalid: () => void;
}

export function Messenger({ credentials, restored, onLogout, onSessionInvalid }: Props) {
  const { state, dispatch, activeChat, send, retry, loadHistory, openChat, selectChat } = useChat(credentials);
  const { connectionError, instanceState, standby } = useNotificationPolling(
    credentials,
    dispatch,
    onSessionInvalid,
    restored,
  );
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const closeLogoutDialog = useCallback(() => setConfirmingLogout(false), []);

  return (
    <div className="flex h-full flex-col">
      <ConnectionBanners instanceState={instanceState} connectionError={connectionError} standby={standby} />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          className={activeChat ? 'hidden md:flex' : 'flex'}
          credentials={credentials}
          chats={state.chats}
          activeChatId={state.activeChatId}
          phoneInputRef={phoneInputRef}
          onChatOpened={openChat}
          onChatSelected={selectChat}
          onLogout={() => setConfirmingLogout(true)}
        />
        {activeChat ? (
          <ChatWindow
            className="flex"
            chat={activeChat}
            onSend={send}
            onRetry={retry}
            onReloadHistory={loadHistory}
            onBack={() => selectChat(null)}
          />
        ) : (
          <EmptyChat className="hidden md:flex" onNewChat={() => phoneInputRef.current?.focus()} />
        )}
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        icon={<LogoutIcon className="h-6 w-6" />}
        title="Выйти из аккаунта?"
        description="Список чатов будет очищен. Чтобы вернуться, понадобится снова ввести idInstance и apiTokenInstance."
        confirmLabel="Выйти"
        onConfirm={onLogout}
        onCancel={closeLogoutDialog}
      />
    </div>
  );
}
