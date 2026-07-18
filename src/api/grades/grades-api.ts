import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  AssessmentGrade,
  AssessmentGradesQuery,
  ReportCard,
  TermResult,
} from '@/types/grades';

export const gradesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getReportCard: build.query<ReportCard | null, void>({
      query: () => ({ url: '/grades/student/me/report-card' }),
      transformResponse: (response: ApiEnvelope<ReportCard | null>) => response.data,
    }),
    getResults: build.query<TermResult[], string | void>({
      query: (termId) => ({
        url: '/grades/student/me/results',
        params: termId ? { termId } : undefined,
      }),
      transformResponse: (response: ApiEnvelope<TermResult[]>) => response.data,
    }),
    getAssessmentGrades: build.query<AssessmentGrade[], AssessmentGradesQuery | void>({
      query: (params) => ({ url: '/grades/student/me/assessments', params: params ?? undefined }),
      transformResponse: (response: ApiEnvelope<AssessmentGrade[]>) => response.data,
    }),
  }),
});

export const { useGetReportCardQuery, useGetResultsQuery, useGetAssessmentGradesQuery } = gradesApi;
