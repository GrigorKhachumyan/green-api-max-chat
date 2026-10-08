import { type AccountQuery, checkAccount, type CheckAccountResponse, type Credentials, GreenApiError } from '@/api';
import { formatPhone, isTelegramUsername, isValidPhone, normalizePhone } from '@/lib';
import type { ChatMeta } from '@/state';

const INVALID_INPUT = 'Введите номер в международном формате с кодом страны, например +7 999 123-45-67';
const INVALID_PHONE = 'Номер телефона указан неверно. Проверьте код страны и количество цифр.';
const NOT_FOUND = 'Аккаунт не найден: номер не зарегистрирован в мессенджере или скрыт настройками приватности.';

export class RecipientError extends Error {}

function parseInput(value: string): { query: AccountQuery; name: string } {
  const input = value.trim();
  if (isTelegramUsername(input)) return { query: { username: input, force: true }, name: input };

  const digits = normalizePhone(input);
  if (!isValidPhone(digits)) throw new RecipientError(INVALID_INPUT);
  return { query: { phoneNumber: Number(digits), force: true }, name: formatPhone(digits) };
}

async function checkRecipient(credentials: Credentials, query: AccountQuery): Promise<CheckAccountResponse> {
  try {
    return await checkAccount(credentials, query);
  } catch (error) {
    if (error instanceof GreenApiError && error.status === 400) throw new RecipientError(INVALID_PHONE);
    throw error;
  }
}

export async function resolveRecipient(credentials: Credentials, value: string): Promise<ChatMeta> {
  const { query, name } = parseInput(value);
  const result = await checkRecipient(credentials, query);
  if (!result.exist || !result.chatId) throw new RecipientError(NOT_FOUND);
  return { chatId: result.chatId, name };
}
