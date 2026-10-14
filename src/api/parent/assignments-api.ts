import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ChildAssignment } from '@/types/tasks';

export const parentAssignmentsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildAssignments: build.query<ChildAssignment[], string>({
      query: (childId) => ({ url: `/parent/children/${childId}/assignments` }),
      transformResponse: (response: ApiEnvelope<ChildAssignment[]>) => response.data,
      // Same tag as the student's assignments, so anything that invalidates
      // `Assignments` (e.g. a real-time event) refreshes the parent's view too.
      providesTags: ['Assignments'],
    }),
  }),
});

export const { useGetChildAssignmentsQuery } = parentAssignmentsApi;
