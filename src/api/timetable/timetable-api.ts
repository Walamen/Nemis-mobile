import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Timetable } from '@/types/timetable';

export const timetableApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyTimetable: build.query<Timetable, void>({
      query: () => ({ url: '/timetables/student/me/timetable' }),
      transformResponse: (response: ApiEnvelope<Timetable>) => response.data,
    }),
  }),
});

export const { useGetMyTimetableQuery } = timetableApi;
