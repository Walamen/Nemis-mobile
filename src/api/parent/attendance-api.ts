import { apiSlice } from '@/api/api-slice';
import type { ChildAttendance } from '@/types/attendance';
import type { ApiEnvelope } from '@/types/auth';

export type ChildAttendanceQuery = {
  childId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

export const parentAttendanceApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildAttendance: build.query<ChildAttendance, ChildAttendanceQuery>({
      query: ({ childId, ...params }) => ({
        url: `/parent/children/${childId}/attendance`,
        params,
      }),
      transformResponse: (response: ApiEnvelope<ChildAttendance>) => response.data,
    }),
  }),
});

export const { useGetChildAttendanceQuery } = parentAttendanceApi;
