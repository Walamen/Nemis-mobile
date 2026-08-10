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
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        // React Native can't rely on the sid cookie, so send it from
        // SecureStore instead; clear local tokens regardless of outcome.
        const credentials = await getRefreshCredentials();
        const result = await baseQuery({
          url: '/auth/logout',
          method: 'POST',
          body: credentials ? { sid: credentials.sid } : undefined,
        });
        await clearAuthTokens();
        // `data: null`, not `undefined` — RTK Query's queryFn result check
        // doesn't survive an `undefined` data value.
        return result.error ? { error: result.error as FetchBaseQueryError } : { data: null };
      },
      invalidatesTags: ['Me'],
    }),
    logoutAll: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
      invalidatesTags: ['Me'],
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
