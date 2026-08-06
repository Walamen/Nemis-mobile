import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { AssessmentGradesQuery, ChildAssessmentGrade, ReportCard } from '@/types/grades';

export const parentAcademicsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildAssessmentGrades: build.query<
      ChildAssessmentGrade[],
      { childId: string } & AssessmentGradesQuery
    >({
      query: ({ childId, ...params }) => ({
        url: `/parent/academics/${childId}/assessments`,
        params,
      }),
      transformResponse: (response: ApiEnvelope<ChildAssessmentGrade[]>) => response.data,
    }),
    getChildReportCard: build.query<ReportCard | null, string>({
      query: (childId) => ({ url: `/parent/academics/${childId}/report-card` }),
      transformResponse: (response: ApiEnvelope<ReportCard | null>) => response.data,
    }),
  }),
});

export const { useGetChildAssessmentGradesQuery, useGetChildReportCardQuery } = parentAcademicsApi;
