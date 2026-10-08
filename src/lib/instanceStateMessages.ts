import type { InstanceState } from '@/api';

const MESSAGES: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован. Отсканируйте QR-код в личном кабинете GREEN-API.',
  pendingPassword: 'Инстанс ждёт пароль. Завершите авторизацию в личном кабинете.',
  starting: 'Инстанс запускается, попробуйте через минуту.',
  blocked: 'Аккаунт заблокирован мессенджером.',
  suspended: 'Отправка сообщений с аккаунта временно ограничена.',
};

export function instanceStateMessage(state: Exclude<InstanceState, 'authorized'>): string {
  return MESSAGES[state] ?? `Инстанс в состоянии «${state}». Проверьте его в личном кабинете GREEN-API.`;
}
