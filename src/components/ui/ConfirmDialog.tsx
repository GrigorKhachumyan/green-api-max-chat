import { type ReactNode, type SyntheticEvent, useEffect, useId, useRef } from 'react';

interface Props {
  open: boolean;
  icon?: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, icon, title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-surface p-0 text-center text-ink shadow-[0_20px_60px_rgba(20,30,60,0.25)] backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            {icon}
          </div>
        )}
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">
          {description}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-canvas py-2.5 text-sm font-medium text-ink transition hover:bg-line"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-danger py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
