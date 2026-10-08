import { type KeyboardEvent, type SubmitEvent, useLayoutEffect, useRef, useState } from 'react';

import { SendIcon } from '@/components/icons';

const MAX_MESSAGE_LENGTH = 4096;

/** A phone keyboard has no Shift+Enter, so there Enter adds a new line and the button sends, as in mobile messengers. */
function sendsOnEnter(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX_MESSAGE_LENGTH;

  // Grows with the text up to max-h-40; CSS field-sizing is not supported by Safari and Firefox yet.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

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
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || !sendsOnEnter()) return;
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          className="max-h-40 min-h-10 flex-1 resize-none rounded-2xl bg-canvas px-4 py-2.5 text-base ring-accent outline-none focus:ring-2 md:text-sm"
        />
        <button
          type="submit"
          disabled={!trimmed || tooLong}
          aria-label="Отправить"
          // Keeps the focus (and the phone keyboard) in the text field, as messengers do.
          onMouseDown={(event) => event.preventDefault()}
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
