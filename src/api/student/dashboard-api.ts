import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { StudentDashboard } from '@/types/dashboard';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getStudentDashboard: build.query<StudentDashboard, void>({
      query: () => ({ url: '/student/profile/dashboard' }),
      transformResponse: (response: ApiEnvelope<StudentDashboard>) => response.data,
      // No tags: the fields actually rendered (GPA, attendance rate, alerts)
      // don't change with notifications/messages. Unread badges come from
      // `useUnreadTotal`, not this payload's never-computed `unreadMessages`.
    }),
  }),
});

export const { useGetStudentDashboardQuery } = dashboardApi;
