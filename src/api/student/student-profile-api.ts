import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { StudentProfile } from '@/types/profile';

export const studentProfileApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyStudentProfile: build.query<StudentProfile, void>({
      query: () => ({ url: '/student/profile/me' }),
      transformResponse: (response: ApiEnvelope<StudentProfile>) => response.data,
    }),
  }),
});

export const { useGetMyStudentProfileQuery } = studentProfileApi;
