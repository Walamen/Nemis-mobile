import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ClassResource } from '@/types/tasks';

export const resourcesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getResources: build.query<ClassResource[], string | void>({
      query: (subjectId) => ({
        url: '/student/resources',
        params: subjectId ? { subjectId } : undefined,
      }),
      transformResponse: (response: ApiEnvelope<ClassResource[]>) => response.data,
    }),
  }),
});

export const { useGetResourcesQuery } = resourcesApi;
