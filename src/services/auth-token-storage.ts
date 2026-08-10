import { deleteSecureItem, getSecureItem, setSecureItem } from '@/services/secure-storage';

// React Native's fetch does not reliably persist/resend cookies the way a
// browser does, so the native app authenticates via Bearer tokens instead
// of the httpOnly cookies the web dashboards use. These are the only place
// the tokens are held on-device (Expo SecureStore = iOS Keychain / Android
// Keystore), matching CLAUDE.md's "never store auth tokens in AsyncStorage".
const ACCESS_TOKEN_KEY = 'sis_access_token';
const REFRESH_TOKEN_KEY = 'sis_refresh_token';
const SID_KEY = 'sis_sid';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  sid: string;
};

export async function getAccessToken(): Promise<string | null> {
  return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshCredentials(): Promise<{
  sid: string;
  refreshToken: string;
} | null> {
  const [sid, refreshToken] = await Promise.all([
    getSecureItem(SID_KEY),
    getSecureItem(REFRESH_TOKEN_KEY),
  ]);
  return sid && refreshToken ? { sid, refreshToken } : null;
}

export async function setAuthTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
    setSecureItem(SID_KEY, tokens.sid),
  ]);
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
    deleteSecureItem(SID_KEY),
  ]);
}
