import { apiSlice } from '@/api/api-slice';
import type {
  ApiEnvelope,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RequestPasswordResetRequest,
  User,
} from '@/types/auth';

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
      transformResponse: (response: ApiEnvelope<ApiEnvelope<{ user: User }>>) =>
        response.data.data.user,
      invalidatesTags: ['Me'],
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
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
