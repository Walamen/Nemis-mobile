import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  AssessmentGradesQuery,
  ChildAssessmentGrade,
  ReportCard,
  ReportCardYear,
} from '@/types/grades';

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
    // No year: the server's default, as for the student's own card.
    getChildReportCard: build.query<
      ReportCard | null,
      { childId: string; academicYearId?: string }
    >({
      query: ({ childId, academicYearId }) => ({
        url: `/parent/academics/${childId}/report-card`,
        params: academicYearId ? { academicYearId } : undefined,
      }),
      transformResponse: (response: ApiEnvelope<ReportCard | null>) => response.data,
    }),
    getChildReportCardYears: build.query<ReportCardYear[], string>({
      query: (childId) => ({ url: `/parent/academics/${childId}/report-card/years` }),
      transformResponse: (response: ApiEnvelope<ReportCardYear[]>) => response.data,
    }),
  }),
});

export const {
  useGetChildAssessmentGradesQuery,
  useGetChildReportCardQuery,
  useGetChildReportCardYearsQuery,
} = parentAcademicsApi;
