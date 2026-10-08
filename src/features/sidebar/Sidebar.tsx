import type { RefObject } from 'react';

import type { Credentials } from '@/api';
import { LogoIcon, LogoutIcon } from '@/components/icons';
import type { Chat, ChatMeta } from '@/state';

import { ChatList, NewChatForm } from './components';

interface Props {
  className?: string;
  credentials: Credentials;
  chats: Record<string, Chat>;
  activeChatId: string | null;
  phoneInputRef: RefObject<HTMLInputElement | null>;
  onChatOpened: (chat: ChatMeta) => void;
  onChatSelected: (chatId: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  className = '',
  credentials,
  chats,
  activeChatId,
  phoneInputRef,
  onChatOpened,
  onChatSelected,
  onLogout,
}: Props) {
  return (
    <aside className={`w-full flex-col border-r border-line bg-surface md:w-[340px] md:shrink-0 ${className}`}>
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <LogoIcon className="h-8 w-8" />
        <h1 className="flex-1 text-lg font-semibold">Чаты</h1>
        <button
          type="button"
          onClick={onLogout}
          title="Выйти"
          aria-label="Выйти"
          className="rounded-lg p-2 text-muted transition hover:bg-canvas hover:text-ink"
        >
          <LogoutIcon className="h-5 w-5" />
        </button>
      </header>

      <NewChatForm credentials={credentials} inputRef={phoneInputRef} onChatOpened={onChatOpened} />

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ChatList chats={chats} activeChatId={activeChatId} onSelect={onChatSelected} />
      </nav>
    </aside>
  );
}
