/**
 * New-password rules for Change password — one list drives the form's
 * validation, the "Your password must" checklist and the strength meter, so
 * they can't disagree. The server itself only requires 8+ characters; the
 * capital-letter and number rules are the app's policy. "Don't reuse a recent
 * password" isn't listed: the server keeps no password history, so the app
 * can't check it and won't claim to.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Be at least 8 characters long',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'capital',
    label: 'Include one capital letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  { id: 'number', label: 'Include one number', test: (password: string) => /\d/.test(password) },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]['id'];

export function passwordRuleResults(password: string): Record<PasswordRuleId, boolean> {
  return Object.fromEntries(PASSWORD_RULES.map((rule) => [rule.id, rule.test(password)])) as Record<
    PasswordRuleId,
    boolean
  >;
}

export function meetsPasswordRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export type PasswordStrength = {
  /** Filled segments of the 4-segment meter, 0–4. */
  score: 0 | 1 | 2 | 3 | 4;
  label: '' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
};

/**
 * Meter value: one segment per rule met, plus a fourth for extra strength
 * (12+ characters or a symbol) — only once every rule is met, so a long
 * password missing a number never reads as "Strong".
 */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '' };
  const met = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const extra = password.length >= 12 || /[^A-Za-z0-9]/.test(password);
  const score = (met === PASSWORD_RULES.length && extra ? 4 : Math.max(met, 1)) as 1 | 2 | 3 | 4;
  const label = (['', 'Weak', 'Fair', 'Strong', 'Very strong'] as const)[score];
  return { score, label };
}
