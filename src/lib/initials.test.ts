import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
  it('takes the first letters of two words', () => {
    expect(initials('Ivan Petrov')).toBe('IP');
  });

  it('returns an empty string when there are no letters', () => {
    expect(initials('+79991234567')).toBe('');
  });

  it('skips a leading @', () => {
    expect(initials('@green_api')).toBe('G');
  });
});
