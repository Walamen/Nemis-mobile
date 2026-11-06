import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  AssessmentGrade,
  AssessmentGradesQuery,
  GradingConfig,
  ReportCard,
  ReportCardYear,
  TermResult,
} from '@/types/grades';

export const gradesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // No year: the server's default (the current year's card, else the
    // newest year with one — so a closed year's final card still shows).
    getReportCard: build.query<ReportCard | null, string | void>({
      query: (academicYearId) => ({
        url: '/grades/student/me/report-card',
        params: academicYearId ? { academicYearId } : undefined,
      }),
      transformResponse: (response: ApiEnvelope<ReportCard | null>) => response.data,
    }),
    getReportCardYears: build.query<ReportCardYear[], void>({
      query: () => ({ url: '/grades/student/me/report-card/years' }),
      transformResponse: (response: ApiEnvelope<ReportCardYear[]>) => response.data,
    }),
    // Same institution-wide scale the web report card shows as a legend
    // below its score grid — reused as-is, not a new backend concept.
    getGradingConfig: build.query<GradingConfig, void>({
      query: () => ({ url: '/grading-config' }),
      transformResponse: (response: ApiEnvelope<GradingConfig>) => response.data,
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

export const {
  useGetReportCardQuery,
  useGetReportCardYearsQuery,
  useGetGradingConfigQuery,
  useGetResultsQuery,
  useGetAssessmentGradesQuery,
} = gradesApi;
