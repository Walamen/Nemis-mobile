function resolveApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Add it to .env (see .env.example) or the EAS build environment.',
    );
  }
  // Plain HTTP is only acceptable against a local development server.
  if (!__DEV__ && !url.startsWith('https://')) {
    throw new Error('EXPO_PUBLIC_API_URL must use https:// in release builds.');
  }
  return url;
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Sent as the `Origin` header on every API request. The server's CSRF guard
 * rejects state-changing requests (logout, sending messages, submissions…)
 * that carry no Origin/Referer, which a native client never sends on its own.
 * Must exactly match one of the server's `CORS_ORIGINS` — an origin that
 * isn't allow-listed makes the server's CORS check fail every request.
 * Left unset, no Origin header is sent.
 */
export const API_REQUEST_ORIGIN = process.env.EXPO_PUBLIC_REQUEST_ORIGIN;
