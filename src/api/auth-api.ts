import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope, LoginRequest, User } from '@/types/auth';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<User, void>({
      query: () => ({ url: '/auth/me' }),
      transformResponse: (response: ApiEnvelope<{ user: User }>) => response.data.user,
      providesTags: ['Me'],
    }),
    login: build.mutation<User, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
      transformResponse: (response: ApiEnvelope<{ user: User }>) => response.data.user,
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
  }),
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation, useLogoutAllMutation } = authApi;
