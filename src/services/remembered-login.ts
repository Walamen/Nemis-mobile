import type { LoginRole } from '@/features/auth/login-schema';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/services/secure-storage';

// "Remember Me" on the sign-in screen: the tab and identifier (NEMIS ID or
// email) only — never the password. Kept in SecureStore with the rest of the
// auth data rather than AsyncStorage, since an identifier is still personal.
const REMEMBERED_LOGIN_KEY = 'sis_remembered_login';

export type RememberedLogin = { role: LoginRole; identifier: string };

function isRememberedLogin(value: unknown): value is RememberedLogin {
  if (typeof value !== 'object' || value === null) return false;
  const { role, identifier } = value as Record<string, unknown>;
  return (role === 'student' || role === 'parent') && typeof identifier === 'string';
}

export async function getRememberedLogin(): Promise<RememberedLogin | null> {
  try {
    const raw = await getSecureItem(REMEMBERED_LOGIN_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRememberedLogin(parsed) ? parsed : null;
  } catch {
    // Unreadable or malformed — behave as if nothing was remembered.
    return null;
  }
}

export async function setRememberedLogin(login: RememberedLogin): Promise<void> {
  await setSecureItem(REMEMBERED_LOGIN_KEY, JSON.stringify(login));
}

export async function clearRememberedLogin(): Promise<void> {
  await deleteSecureItem(REMEMBERED_LOGIN_KEY);
}
