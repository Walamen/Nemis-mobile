import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useSubmitAssignmentMutation } from '@/api/tasks/assignments-api';
import {
  submitAssignmentSchema,
  type SubmitAssignmentFormValues,
} from '@/features/tasks/submit-assignment-schema';
import type { Assignment } from '@/types/tasks';
import { getApiErrorMessage } from '@/utils/api-error';

export function useSubmitAssignmentForm(assignment: Assignment, onSubmitted: () => void) {
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  const form = useForm<SubmitAssignmentFormValues>({
    resolver: zodResolver(submitAssignmentSchema),
    defaultValues: { response: assignment.mySubmission?.response ?? '' },
  });
  const { reset } = form;

  // Keyed on the id + saved response (not the object), so a background
  // refetch of the same assignment doesn't wipe what the student is typing.
  const assignmentId = assignment.id;
  const savedResponse = assignment.mySubmission?.response ?? '';
  useEffect(() => {
    reset({ response: savedResponse });
  }, [assignmentId, savedResponse, reset]);

  async function onSubmit(values: SubmitAssignmentFormValues) {
    try {
      await submitAssignment({ assignmentId, response: values.response }).unwrap();
      onSubmitted();
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return { ...form, onSubmit: form.handleSubmit(onSubmit), isSubmitting };
}
