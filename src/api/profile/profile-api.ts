import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserProfile,
} from '@/types/profile';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      query: () => ({ url: '/users/profile' }),
      transformResponse: (response: ApiEnvelope<UserProfile>) => response.data,
      providesTags: ['Me'],
    }),
    updateProfile: build.mutation<UpdateProfileResponse, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/profile', method: 'PATCH', body }),
      transformResponse: (response: ApiEnvelope<UpdateProfileResponse>) => response.data,
      invalidatesTags: ['Me'],
    }),
    changePassword: build.mutation<UpdateProfileResponse, ChangePasswordRequest>({
      query: (body) => ({ url: '/users/profile', method: 'PATCH', body }),
      transformResponse: (response: ApiEnvelope<UpdateProfileResponse>) => response.data,
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } =
  profileApi;
