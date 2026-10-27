import { describe, expect, it } from '@jest/globals';

import { changePasswordSchema } from '@/features/profile/change-password-schema';
import { meetsPasswordRules, passwordRuleResults, passwordStrength } from '@/utils/password-rules';

describe('password rules', () => {
  it('checks each rule on its own', () => {
    expect(passwordRuleResults('abc')).toEqual({ length: false, capital: false, number: false });
    expect(passwordRuleResults('Abcdefg1')).toEqual({ length: true, capital: true, number: true });
  });

  it('accepts a password meeting every rule (lowercase not required)', () => {
    expect(meetsPasswordRules('ABCDEFG1')).toBe(true);
    expect(meetsPasswordRules('abcdefg1')).toBe(false);
  });
});

describe('passwordStrength', () => {
  it('is empty for an empty password', () => {
    expect(passwordStrength('')).toEqual({ score: 0, label: '' });
  });

  it('counts rules met', () => {
    expect(passwordStrength('abc').label).toBe('Weak');
    expect(passwordStrength('abcdefgh').label).toBe('Weak');
    expect(passwordStrength('Abcdefgh').label).toBe('Fair');
    expect(passwordStrength('Abcdefg1')).toEqual({ score: 3, label: 'Strong' });
  });

  it('only reaches "Very strong" once every rule is met', () => {
    expect(passwordStrength('Abcdefg1!')).toEqual({ score: 4, label: 'Very strong' });
    expect(passwordStrength('averyverylongpassword').label).toBe('Weak');
  });
});

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'old', newPassword: 'Abcdefg1', newPasswordConfirm: 'Abcdefg1' };

  it('accepts a valid change', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('explains a missing rule in a full sentence', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: 'Abcdefgh',
      newPasswordConfirm: 'Abcdefgh',
    });
    expect(result.error?.issues[0]?.message).toBe('Your password must include one number');
  });

  it('rejects mismatched confirmation', () => {
    const result = changePasswordSchema.safeParse({ ...valid, newPasswordConfirm: 'Abcdefg2' });
    expect(result.error?.issues[0]?.message).toBe('Passwords do not match');
  });
});
