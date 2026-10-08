import { type RefObject, type SubmitEvent, useState } from 'react';

import { type Credentials, GreenApiError } from '@/api';
import { PlusIcon } from '@/components/icons';
import { Spinner } from '@/components/ui';
import type { ChatMeta } from '@/state';

import { RecipientError, resolveRecipient } from '../utils';

interface Props {
  credentials: Credentials;
  inputRef: RefObject<HTMLInputElement | null>;
  onChatOpened: (chat: ChatMeta) => void;
}

export function NewChatForm({ credentials, inputRef, onChatOpened }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onChatOpened(await resolveRecipient(credentials, value));
      setValue('');
    } catch (err) {
      const known = err instanceof RecipientError || err instanceof GreenApiError;
      setError(known ? err.message : 'Не удалось проверить номер');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-4 pb-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder="+7 999 123-45-67"
          inputMode="tel"
          autoComplete="tel"
          aria-label="Номер телефона получателя"
          className="min-w-0 flex-1 rounded-xl bg-canvas px-3 py-2 text-base ring-accent transition outline-none placeholder:text-muted focus:ring-2 md:text-sm"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          title="Создать чат"
          aria-label="Создать чат"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? <Spinner /> : <PlusIcon className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs break-words text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
