import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { StudentDashboard } from '@/types/dashboard';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getStudentDashboard: build.query<StudentDashboard, void>({
      query: () => ({ url: '/student/profile/dashboard' }),
      transformResponse: (response: ApiEnvelope<StudentDashboard>) => response.data,
      // `unreadMessages` rolls up both notifications and direct messages, so
      // this must be invalidated by whatever those two invalidate — marking
      // a notification/all-notifications read, or sending a message —
      // otherwise the dashboard badge is stuck until the app is reloaded.
      providesTags: ['Notifications', 'Messages'],
    }),
  }),
});

export const { useGetStudentDashboardQuery } = dashboardApi;
