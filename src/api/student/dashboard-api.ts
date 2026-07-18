import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { StudentDashboard } from '@/types/dashboard';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getStudentDashboard: build.query<StudentDashboard, void>({
      query: () => ({ url: '/student/profile/dashboard' }),
      transformResponse: (response: ApiEnvelope<StudentDashboard>) => response.data,
    }),
  }),
});

export const { useGetStudentDashboardQuery } = dashboardApi;
