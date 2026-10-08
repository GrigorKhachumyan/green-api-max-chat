import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadChats, loadSession, saveChats, saveCredentials } from './storage';

function createStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  };
}

beforeEach(() => {
  vi.stubGlobal('sessionStorage', createStorage());
});

describe('storage', () => {
  it('restores saved credentials', () => {
    const credentials = { apiUrl: 'https://3100.api.green-api.com', idInstance: '3100', apiTokenInstance: 't' };
    saveCredentials(credentials);
    expect(loadSession()).toEqual({ credentials, corrupted: false });
  });

  it('reports and clears corrupted credentials', () => {
    sessionStorage.setItem('max-chat:credentials', '{"apiUrl":1}');
    expect(loadSession()).toEqual({ credentials: null, corrupted: true });
    expect(sessionStorage.getItem('max-chat:credentials')).toBeNull();
  });

  it('round-trips chats with a preview', () => {
    const preview = { id: 'M1', direction: 'incoming' as const, text: 'hi', timestamp: 5 };
    const chats = [{ chatId: '1', name: 'Bob', preview, unread: 2 }];
    saveChats(chats);
    expect(loadChats()).toEqual(chats);
  });

  it('drops broken chat entries instead of crashing', () => {
    sessionStorage.setItem(
      'max-chat:chats',
      JSON.stringify([{ chatId: '1', name: 'Bob', preview: 'x', unread: -1 }, null, 5]),
    );
    expect(loadChats()).toEqual([{ chatId: '1', name: 'Bob', preview: undefined, unread: undefined }]);

    sessionStorage.setItem('max-chat:chats', '{"not":"an array"}');
    expect(loadChats()).toEqual([]);

    sessionStorage.setItem('max-chat:chats', '{broken json');
    expect(loadChats()).toEqual([]);
  });
});
