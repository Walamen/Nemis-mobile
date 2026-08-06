import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ChildAssignment } from '@/types/tasks';

export const parentAssignmentsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildAssignments: build.query<ChildAssignment[], string>({
      query: (childId) => ({ url: `/parent/children/${childId}/assignments` }),
      transformResponse: (response: ApiEnvelope<ChildAssignment[]>) => response.data,
    }),
  }),
});

export const { useGetChildAssignmentsQuery } = parentAssignmentsApi;
