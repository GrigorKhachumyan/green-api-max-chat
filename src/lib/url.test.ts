import { describe, expect, it } from 'vitest';

import { isValidApiUrl } from './url';

describe('isValidApiUrl', () => {
  it('accepts GREEN-API hosts', () => {
    expect(isValidApiUrl('https://3100.api.green-api.com')).toBe(true);
  });

  it('rejects broken values', () => {
    expect(isValidApiUrl('https://.api.green-api.com')).toBe(false);
    expect(isValidApiUrl('ftp://api.green-api.com')).toBe(false);
    expect(isValidApiUrl('green-api')).toBe(false);
  });

  it('rejects plain http: the token would be sent unencrypted', () => {
    expect(isValidApiUrl('http://3100.api.green-api.com')).toBe(false);
  });
});
