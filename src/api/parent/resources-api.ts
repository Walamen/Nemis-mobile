import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ClassResource, SchoolResource } from '@/types/tasks';

export const parentResourcesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildClassResources: build.query<ClassResource[], { childId: string; subjectId?: string }>({
      query: ({ childId, subjectId }) => ({
        url: `/parent/children/${childId}/resources`,
        params: subjectId ? { subjectId } : undefined,
      }),
      transformResponse: (response: ApiEnvelope<ClassResource[]>) => response.data,
    }),
    getParentResources: build.query<SchoolResource[], void>({
      query: () => ({ url: '/parent/resources' }),
      transformResponse: (response: ApiEnvelope<SchoolResource[]>) => response.data,
    }),
  }),
});

export const { useGetChildClassResourcesQuery, useGetParentResourcesQuery } = parentResourcesApi;
