// Student NEMIS ID: 12 digits = 11 random + 1 Luhn check digit.
//
// Validation mirrors the server's `@nemis/utils` nemis-id.ts so a mistyped ID
// is caught on the form instead of costing a login attempt (the server
// rate-limits failed logins per account). Presentation is always
// 4829-1573-6045; the API receives either form and strips separators itself.

const PAYLOAD_DIGITS = 11;
const TOTAL_DIGITS = 12;

/** Longest input the field accepts: 12 digits plus two dashes. */
export const NEMIS_ID_INPUT_MAX_LENGTH = TOTAL_DIGITS + 2;

/** Luhn check digit for an 11-digit payload. Doubling starts at the rightmost payload digit. */
function luhnCheckDigit(payload: string): number {
  let sum = 0;
  let double = true;
  for (let i = payload.length - 1; i >= 0; i--) {
    let digit = payload.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
}

/** Digits only — drops dashes, spaces and anything else typed or pasted. */
export function nemisIdDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** True for exactly 12 digits (separators ignored) with a correct check digit. */
export function isValidNemisId(value: string): boolean {
  const digits = nemisIdDigits(value);
  if (digits.length !== TOTAL_DIGITS) return false;
  return luhnCheckDigit(digits.slice(0, PAYLOAD_DIGITS)) === digits.charCodeAt(TOTAL_DIGITS - 1) - 48;
}

/**
 * Formats as the user types: groups of four joined by dashes, capped at 12
 * digits (`48291` → `4829-1`, `482915736045` → `4829-1573-6045`).
 */
export function formatNemisIdInput(value: string): string {
  const digits = nemisIdDigits(value).slice(0, TOTAL_DIGITS);
  return digits.match(/.{1,4}/g)?.join('-') ?? '';
}
