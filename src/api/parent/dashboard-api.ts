import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ParentDashboard } from '@/types/dashboard';

export const parentDashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getParentDashboard: build.query<ParentDashboard, void>({
      query: () => ({ url: '/parent/dashboard' }),
      transformResponse: (response: ApiEnvelope<ParentDashboard>) => response.data,
    }),
  }),
});

export const { useGetParentDashboardQuery } = parentDashboardApi;
