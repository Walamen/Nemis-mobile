import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/constants/api';
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
    headers.set('x-app-context', 'sis');
    // React Native's fetch doesn't reliably persist/resend cookies, so the
    // backend identifies this as the native client and returns tokens in
    // the response body (see fetch-base-query.ts's callers) instead of
    // relying solely on the httpOnly cookies the web dashboards use.
    headers.set('x-client-platform', 'native');

    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

type RefreshTokens = { accessToken: string; refreshToken: string; sid: string };

let refreshPromise: ReturnType<typeof rawBaseQuery> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args.url;
  const isRefreshable = !NO_REFRESH_PATHS.some((path) => url.includes(path));

  if (result.error?.status === 401 && isRefreshable) {
    const credentials = await getRefreshCredentials();

    if (credentials) {
      refreshPromise ??= rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', body: credentials },
        api,
        extraOptions,
      );
      const refreshResult = await refreshPromise;
      refreshPromise = null;

      const body = refreshResult.data as ApiEnvelope<ApiEnvelope<RefreshTokens>> | undefined;
      const tokens = body?.data?.data;

      if (!refreshResult.error && tokens?.accessToken && tokens.refreshToken && tokens.sid) {
        await setAuthTokens(tokens);
        return rawBaseQuery(args, api, extraOptions);
      }

      await clearAuthTokens();
    }
  }

  return result;
};
