import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { StudentAttendance } from '@/types/attendance';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyAttendance: build.query<
      StudentAttendance,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({ url: '/attendance/student/me', params: params ?? undefined }),
      transformResponse: (response: ApiEnvelope<StudentAttendance>) => response.data,
    }),
  }),
});

export const { useGetMyAttendanceQuery } = attendanceApi;
