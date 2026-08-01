import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/constants/api';

const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  timeout: 15000,
  prepareHeaders: (headers) => {
    headers.set('x-app-context', 'sis');
    return headers;
  },
});

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
    refreshPromise ??= rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
    const refreshResult = await refreshPromise;
    refreshPromise = null;

    if (!refreshResult.error) {
      return rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
