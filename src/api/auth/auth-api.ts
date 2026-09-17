import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { apiSlice } from '@/api/api-slice';
import {
  clearAuthTokens,
  getRefreshCredentials,
  setAuthTokens,
} from '@/services/auth-token-storage';
import type {
  ApiEnvelope,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RequestPasswordResetRequest,
  User,
} from '@/types/auth';

type LoginData = { user: User; accessToken?: string; refreshToken?: string; sid?: string };

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<User, void>({
      query: () => ({ url: '/auth/me' }),
      transformResponse: (response: ApiEnvelope<ApiEnvelope<{ user: User }>>) =>
        response.data.data.user,
      providesTags: ['Me'],
    }),
    login: build.mutation<User, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: async (response: ApiEnvelope<ApiEnvelope<LoginData>>) => {
        const { user, accessToken, refreshToken, sid } = response.data.data;
        if (accessToken && refreshToken && sid) {
          await setAuthTokens({ accessToken, refreshToken, sid });
        }
        return user;
      },
      invalidatesTags: ['Me'],
    }),
    logout: build.mutation<null, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        // React Native can't rely on the sid cookie, so send it from
        // SecureStore instead; clear local tokens regardless of outcome.
        const credentials = await getRefreshCredentials();
        const result = await baseQuery({
          url: '/auth/logout',
          method: 'POST',
          body: credentials ? { sid: credentials.sid } : undefined,
        });
        await clearAuthTokens();

        // A 401 here just means there was no session left to log out of
        // (e.g. the access token had already expired, or this is a stray
        // second tap after a logout that already succeeded) — that's the
        // state we wanted anyway, not a failure worth surfacing to the user.
        const isAlreadyLoggedOut = result.error?.status === 401;

        // `resetApiState()` (not `invalidatesTags: ['Me']`) — an
        // invalidation would trigger a `getMe` *refetch*, which is
        // guaranteed to 401 now that tokens are gone, and RTK Query does
        // NOT clear a query's previously-cached data just because a later
        // refetch of it failed. That left `getMe`'s stale `User` sitting in
        // the cache after every logout, `isAuthenticated` stuck `true`, and
        // `RootNavigator` (`app/_layout.tsx`) never redirecting to
        // `(auth)` — resetting the whole cache clears it immediately
        // instead, and is the right call on logout regardless (nothing
        // from this session should linger for whoever logs in next).
        if (!result.error || isAlreadyLoggedOut) {
          api.dispatch(apiSlice.util.resetApiState());
        }

        // `data: null`, not `undefined` — RTK Query's queryFn result check
        // doesn't survive an `undefined` data value.
        return !result.error || isAlreadyLoggedOut
          ? { data: null }
          : { error: result.error as FetchBaseQueryError };
      },
    }),
    logoutAll: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        // Same stale-cache problem as `logout` above — reset directly
        // instead of relying on an `invalidatesTags` refetch that's bound
        // to 401 once tokens are gone.
        try {
          await queryFulfilled;
          dispatch(apiSlice.util.resetApiState());
        } catch {
          // Request failed — nothing logged out, nothing to reset.
        }
      },
    }),
    // Short-lived token for the notifications WebSocket handshake (see
    // `@/services/socket`) — the gateway verifies its own token rather than
    // accepting the long-lived access token directly. Deliberately a plain
    // `query` (not cached/subscribed anywhere) — callers use
    // `store.dispatch(authApi.endpoints.getSocketToken.initiate())` to fetch
    // one on demand each time the socket (re)connects.
    getSocketToken: build.query<string, void>({
      query: () => ({ url: '/auth/socket-token' }),
      transformResponse: (response: ApiEnvelope<{ token: string }>) => response.data.token,
    }),
    requestPasswordReset: build.mutation<string, RequestPasswordResetRequest>({
      query: (body) => ({ url: '/users/password-reset/request', method: 'POST', body }),
      transformResponse: (response: ApiEnvelope<{ message: string }>) => response.data.message,
    }),
    confirmPasswordReset: build.mutation<string, ConfirmPasswordResetRequest>({
      query: (body) => ({ url: '/users/password-reset/confirm', method: 'POST', body }),
      transformResponse: (response: ApiEnvelope<{ message: string }>) => response.data.message,
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = authApi;
