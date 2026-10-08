import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkAccount, type Credentials, GreenApiError } from '@/api';

import { RecipientError, resolveRecipient } from './resolveRecipient';

vi.mock('@/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api')>()),
  checkAccount: vi.fn(),
}));

const check = vi.mocked(checkAccount);
const credentials: Credentials = { apiUrl: 'https://api.example.com', idInstance: '1', apiTokenInstance: 'token' };

afterEach(() => vi.resetAllMocks());

describe('resolveRecipient', () => {
  it('resolves a phone number to the chatId returned by checkAccount', async () => {
    check.mockResolvedValue({ exist: true, chatId: '10000000' });

    await expect(resolveRecipient(credentials, '+7 (999) 123-45-67')).resolves.toEqual({
      chatId: '10000000',
      name: '+79991234567',
    });
    expect(check).toHaveBeenCalledWith(credentials, { phoneNumber: 79991234567, force: true });
  });

  it('rejects malformed input without calling the API', async () => {
    await expect(resolveRecipient(credentials, '12-34')).rejects.toBeInstanceOf(RecipientError);
    expect(check).not.toHaveBeenCalled();
  });

  it('reports an unregistered number', async () => {
    check.mockResolvedValue({ exist: false });
    await expect(resolveRecipient(credentials, '79991234567')).rejects.toThrow(/не найден/);
  });

  it('maps 400 from checkAccount to an invalid number', async () => {
    check.mockRejectedValue(new GreenApiError('bad request', 400));
    await expect(resolveRecipient(credentials, '79991234567')).rejects.toThrow(/указан неверно/);
  });
});
