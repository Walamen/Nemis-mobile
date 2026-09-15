import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ParentDashboard } from '@/types/dashboard';

export const parentDashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getParentDashboard: build.query<ParentDashboard, void>({
      query: () => ({ url: '/parent/dashboard' }),
      transformResponse: (response: ApiEnvelope<ParentDashboard>) => response.data,
      // `stats.unreadMessages` rolls up both notifications and direct
      // messages, so this must be invalidated by whatever those two
      // invalidate — marking a notification read, or sending a message —
      // otherwise the dashboard badge is stuck until the app is reloaded.
      providesTags: ['Notifications', 'Messages'],
    }),
  }),
});

export const { useGetParentDashboardQuery } = parentDashboardApi;
