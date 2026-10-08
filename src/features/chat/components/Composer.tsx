import { type KeyboardEvent, type SubmitEvent, useState } from 'react';

import { SendIcon } from '@/components/icons';

const MAX_MESSAGE_LENGTH = 4096;

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX_MESSAGE_LENGTH;

  function submit() {
    if (!trimmed || tooLong) return;
    onSend(trimmed);
    setText('');
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          className="[field-sizing:content] max-h-40 min-h-10 flex-1 resize-none rounded-2xl bg-canvas px-4 py-2.5 text-sm ring-accent outline-none focus:ring-2"
        />
        <button
          type="submit"
          disabled={!trimmed || tooLong}
          aria-label="Отправить"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover disabled:opacity-40"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
      {tooLong && (
        <p className="mx-auto mt-1 max-w-3xl text-xs text-danger">
          Максимум {MAX_MESSAGE_LENGTH} символов ({trimmed.length})
        </p>
      )}
    </form>
  );
}
