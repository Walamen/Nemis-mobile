import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Assignment, SubmitAssignmentRequest } from '@/types/tasks';

function toSubmissionFormData({ response, file }: Omit<SubmitAssignmentRequest, 'assignmentId'>) {
  const formData = new FormData();
  if (response) formData.append('response', response);
  if (file) {
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
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
        data: toSubmissionFormData(body),
      }),
      transformResponse: (response: ApiEnvelope<Assignment['mySubmission']>) => response.data,
      invalidatesTags: ['Assignments'],
    }),
  }),
});

export const { useGetAssignmentsQuery, useGetAssignmentDetailQuery, useSubmitAssignmentMutation } =
  assignmentsApi;
