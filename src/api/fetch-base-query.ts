import type { UnknownAction } from '@reduxjs/toolkit';
import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, API_REQUEST_ORIGIN } from '@/constants/api';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshCredentials,
  setAuthTokens,
} from '@/services/auth-token-storage';
import type { ApiEnvelope } from '@/types/auth';

const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  timeout: 15000,
  prepareHeaders: async (headers) => {
    // `sis` makes the server read/write the `sis_`-prefixed session cookies
    // (`sis_access_token`, `sis_refresh_token`, `sis_sid`), which the native
    // HTTP stack's cookie store persists and resends automatically.
    headers.set('x-app-context', 'sis');
    headers.set('x-client-platform', 'native');
    if (API_REQUEST_ORIGIN) {
      headers.set('origin', API_REQUEST_ORIGIN);
    }

    // Only present if a server build returns tokens in the response body —
    // the current server authenticates this app purely via the cookies above.
    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

type RefreshTokens = { accessToken: string; refreshToken: string; sid: string };

/** `refreshed`: session renewed, retry. `rejected`: the server says the
 * session is over. `failed`: transient error (offline, timeout, 5xx, rate
 * limit) — the session may still be valid, so nothing is cleared. */
type RefreshOutcome = 'refreshed' | 'rejected' | 'failed';

type ReauthOptions = {
  /** Action that wipes the RTK Query cache — injected by `apiSlice` rather
   * than imported here, since `api-slice.ts` already imports this file. */
  resetApiStateAction: () => UnknownAction;
};

async function refreshSession(api: BaseQueryApi, extraOptions: object): Promise<RefreshOutcome> {
  // The server reads the refresh token and session id from cookies; the body
  // is only sent in case tokens were ever stored locally.
  const credentials = await getRefreshCredentials();
  const refreshResult = await rawBaseQuery(
    { url: '/auth/refresh', method: 'POST', body: credentials ?? undefined },
    api,
    extraOptions,
  );

  if (refreshResult.error) {
    // `/auth/refresh` answers 401 for a missing/invalid/expired session and
    // 403 only for "Too many refresh attempts" — so 401 alone ends the session.
    if (refreshResult.error.status !== 401) return 'failed';
    await clearAuthTokens();
    return 'rejected';
  }

  const body = refreshResult.data as ApiEnvelope<ApiEnvelope<RefreshTokens>> | undefined;
  const tokens = body?.data?.data;
  if (tokens?.accessToken && tokens.refreshToken && tokens.sid) {
    await setAuthTokens(tokens);
  }
  return 'refreshed';
}

export function createBaseQueryWithReauth({
  resetApiStateAction,
}: ReauthOptions): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  // Single-flight: every request that 401s while a refresh is running awaits
  // this same promise, which only settles once new tokens are persisted — so
  // no request can start a second refresh with an already-rotated token.
  let refreshPromise: Promise<RefreshOutcome> | null = null;
  // Set once the session is known to be over (rejected refresh or logout) so
  // the post-reset `getMe` refetch doesn't trigger another refresh + reset.
  let sessionEnded = false;

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    const url = typeof args === 'string' ? args : args.url;
    if (url.includes('/auth/login') && !result.error) {
      sessionEnded = false;
    }
    if (url.includes('/auth/logout') && (!result.error || result.error.status === 401)) {
      sessionEnded = true;
    }

    const isRefreshable = !NO_REFRESH_PATHS.some((path) => url.includes(path));
    if (result.error?.status !== 401 || !isRefreshable || sessionEnded) {
      return result;
    }

    // Sent with a bearer token another request has since replaced — retry
    // with the current one instead of refreshing again.
    const sentAuthorization = result.meta?.request.headers.get('authorization');
    const currentAccessToken = await getAccessToken();
    if (currentAccessToken && sentAuthorization !== `Bearer ${currentAccessToken}`) {
      return rawBaseQuery(args, api, extraOptions);
    }

    refreshPromise ??= refreshSession(api, extraOptions).finally(() => {
      refreshPromise = null;
    });
    const outcome = await refreshPromise;

    if (outcome === 'refreshed') {
      return rawBaseQuery(args, api, extraOptions);
    }

    if (outcome === 'rejected' && !sessionEnded) {
      sessionEnded = true;
      // Clearing credentials alone leaves `getMe`'s cached user in place, so
      // the app would stay "logged in" with every request failing. Resetting
      // the cache drops it and `RootNavigator` redirects to `(auth)`.
      api.dispatch(resetApiStateAction());
    }
    return result;
  };
}
