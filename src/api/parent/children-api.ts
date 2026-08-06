import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Child } from '@/types/dashboard';

export const childrenApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyChildren: build.query<Child[], void>({
      query: () => ({ url: '/parent/children' }),
      transformResponse: (response: ApiEnvelope<Child[]>) => response.data,
    }),
  }),
});

export const { useGetMyChildrenQuery } = childrenApi;
