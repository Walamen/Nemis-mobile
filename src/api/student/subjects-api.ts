import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { SubjectDetail, SubjectsResponse } from '@/types/subjects';

export const subjectsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSubjects: build.query<SubjectsResponse, void>({
      query: () => ({ url: '/student/profile/subjects/me' }),
      transformResponse: (response: ApiEnvelope<SubjectsResponse>) => response.data,
    }),
    getSubjectDetail: build.query<SubjectDetail, string>({
      query: (subjectId) => ({ url: `/student/profile/subjects/me/${subjectId}` }),
      transformResponse: (response: ApiEnvelope<SubjectDetail>) => response.data,
      // Includes the subject's assignments with the student's submission
      // status — refetch after `submitAssignment` so it isn't stale.
      providesTags: ['Assignments'],
    }),
  }),
});

export const { useGetSubjectsQuery, useGetSubjectDetailQuery } = subjectsApi;
