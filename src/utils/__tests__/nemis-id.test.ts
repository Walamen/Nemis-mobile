import { describe, expect, it } from '@jest/globals';

import { studentLoginSchema } from '@/features/auth/login-schema';
import { formatNemisIdInput, isValidNemisId, nemisIdDigits } from '@/utils/nemis-id';

// 4829-1573-6045 is the design's sample ID and has a correct Luhn digit.
const VALID_ID = '482915736045';

describe('isValidNemisId', () => {
  it('accepts a 12-digit ID with a correct check digit', () => {
    expect(isValidNemisId(VALID_ID)).toBe(true);
    expect(isValidNemisId('123456789015')).toBe(true);
  });

  it('ignores dashes and spaces', () => {
    expect(isValidNemisId('4829-1573-6045')).toBe(true);
    expect(isValidNemisId('4829 1573 6045')).toBe(true);
  });

  it('rejects a wrong check digit (a single typo)', () => {
    expect(isValidNemisId('482915736046')).toBe(false);
    expect(isValidNemisId('482915736054')).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(isValidNemisId('48291573604')).toBe(false);
    expect(isValidNemisId('4829157360450')).toBe(false);
    expect(isValidNemisId('')).toBe(false);
  });
});

describe('formatNemisIdInput', () => {
  it('groups digits in fours as the user types', () => {
    expect(formatNemisIdInput('4')).toBe('4');
    expect(formatNemisIdInput('4829')).toBe('4829');
    expect(formatNemisIdInput('48291')).toBe('4829-1');
    expect(formatNemisIdInput('482915736045')).toBe('4829-1573-6045');
  });

  it('strips non-digits and caps at 12 digits', () => {
    expect(formatNemisIdInput('4829-1573-6045-99')).toBe('4829-1573-6045');
    expect(formatNemisIdInput(' 48a29 ')).toBe('4829');
    expect(formatNemisIdInput('')).toBe('');
  });

  it('keeps a dash typed after a full group stable (backspace over the dash)', () => {
    // Deleting the dash in "4829-" leaves "4829", which stays "4829".
    expect(formatNemisIdInput('4829')).toBe('4829');
  });
});

describe('nemisIdDigits', () => {
  it('returns digits only', () => {
    expect(nemisIdDigits('4829-1573-6045')).toBe(VALID_ID);
  });
});

describe('studentLoginSchema', () => {
  it('sends the bare 12 digits to the API', () => {
    const result = studentLoginSchema.parse({ nemisId: '4829-1573-6045', password: 'x' });
    expect(result).toEqual({ nemisId: VALID_ID, password: 'x' });
  });

  it('explains a short ID and a mistyped ID differently', () => {
    const short = studentLoginSchema.safeParse({ nemisId: '4829-1573', password: 'x' });
    const typo = studentLoginSchema.safeParse({ nemisId: '4829-1573-6046', password: 'x' });
    expect(short.success).toBe(false);
    expect(typo.success).toBe(false);
    expect(short.error?.issues[0]?.message).toBe('Enter your 12-digit NEMIS ID');
    expect(typo.error?.issues[0]?.message).toMatch(/isn't valid/);
  });

  it('requires a password', () => {
    const result = studentLoginSchema.safeParse({ nemisId: VALID_ID, password: '' });
    expect(result.success).toBe(false);
  });
});
