import { describe, expect, it } from 'vitest';

import { isTelegramUsername, isValidPhone, normalizePhone } from './phone';

describe('phone', () => {
  it('keeps digits only', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('accepts 10–15 digits', () => {
    expect(isValidPhone('79991234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('1234567890123456')).toBe(false);
  });

  it('detects a Telegram username', () => {
    expect(isTelegramUsername('@green_api')).toBe(true);
    expect(isTelegramUsername('green_api')).toBe(false);
  });
});
