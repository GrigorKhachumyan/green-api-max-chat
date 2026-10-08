import type { InstanceState } from '@/api';
import { Banner } from '@/components/ui';
import { instanceStateMessage } from '@/lib';

interface Props {
  instanceState: InstanceState;
  connectionError: string | null;
  standby: boolean;
}

export function ConnectionBanners({ instanceState, connectionError, standby }: Props) {
  return (
    <>
      {instanceState !== 'authorized' && <Banner tone="danger">{instanceStateMessage(instanceState)}</Banner>}
      {standby && (
        <Banner tone="warning">
          Чат открыт в другой вкладке — новые сообщения приходят туда. Закройте её, чтобы получать их здесь.
        </Banner>
      )}
      {!standby && connectionError && <Banner tone="warning">{connectionError}. Переподключаемся…</Banner>}
    </>
  );
}
