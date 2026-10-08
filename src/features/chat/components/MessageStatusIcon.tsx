import { CheckIcon, ClockIcon, DoubleCheckIcon } from '@/components/icons';
import type { MessageStatus } from '@/state';

const LABELS: Record<Exclude<MessageStatus, 'failed'>, string> = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
};

export function MessageStatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'failed') return null;

  return (
    <span title={LABELS[status]} aria-label={LABELS[status]} role="img">
      {status === 'pending' && <ClockIcon className="h-3.5 w-3.5" />}
      {status === 'sent' && <CheckIcon className="h-3.5 w-3.5" />}
      {status === 'delivered' && <DoubleCheckIcon className="h-3.5 w-4" />}
      {status === 'read' && <DoubleCheckIcon className="h-3.5 w-4 text-accent" />}
    </span>
  );
}
