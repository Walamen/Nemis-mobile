import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Assignment, SubmitAssignmentRequest } from '@/types/tasks';
import { getSubmissionFormParts } from '@/utils/submission';

/** Uploads (up to 20 MB) need far longer than the default 15s request timeout. */
const FILE_UPLOAD_TIMEOUT_MS = 120_000;

function toSubmissionFormData(request: Omit<SubmitAssignmentRequest, 'assignmentId'>) {
  const formData = new FormData();
  for (const [name, value] of getSubmissionFormParts(request)) {
    // React Native's FormData takes a `{ uri, name, type }` descriptor for
    // files and streams the file from disk — the contents never sit in JS.
    formData.append(name, value as unknown as Blob);
  }
  return formData;
}

export const assignmentsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAssignments: build.query<Assignment[], void>({
      query: () => ({ url: '/student/assignments' }),
      transformResponse: (response: ApiEnvelope<Assignment[]>) => response.data,
      providesTags: ['Assignments'],
    }),
    getAssignmentDetail: build.query<Assignment, string>({
      query: (id) => ({ url: `/student/assignments/${id}` }),
      transformResponse: (response: ApiEnvelope<Assignment>) => response.data,
      providesTags: ['Assignments'],
    }),
    submitAssignment: build.mutation<Assignment['mySubmission'], SubmitAssignmentRequest>({
      query: ({ assignmentId, ...body }) => ({
        url: `/student/assignments/${assignmentId}/submit`,
        method: 'POST',
        body: toSubmissionFormData(body),
        ...(body.file ? { timeout: FILE_UPLOAD_TIMEOUT_MS } : {}),
      }),
      transformResponse: (response: ApiEnvelope<Assignment['mySubmission']>) => response.data,
      invalidatesTags: ['Assignments'],
    }),
  }),
});

export const { useGetAssignmentsQuery, useGetAssignmentDetailQuery, useSubmitAssignmentMutation } =
  assignmentsApi;
