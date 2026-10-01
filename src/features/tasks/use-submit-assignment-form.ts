import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useSubmitAssignmentMutation } from '@/api/tasks/assignments-api';
import {
  submitAssignmentSchema,
  type SubmitAssignmentFormValues,
} from '@/features/tasks/submit-assignment-schema';
import { pickSubmissionDocument } from '@/services/document-picker';
import type { Assignment } from '@/types/tasks';
import { getApiErrorMessage } from '@/utils/api-error';
import {
  isResponseFieldRejected,
  RESPONSE_FIELD_REJECTED_MESSAGE,
  validateSubmissionFile,
} from '@/utils/submission';

/** `editing` → (Review) → `reviewing` → (Confirm) → submitted, or back. */
export type SubmitStage = 'editing' | 'reviewing';

export function useSubmitAssignmentForm(assignment: Assignment, onSubmitted: () => void) {
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  const [stage, setStage] = useState<SubmitStage>('editing');
  const [fileError, setFileError] = useState<string | null>(null);
  const form = useForm<SubmitAssignmentFormValues>({
    resolver: zodResolver(submitAssignmentSchema),
    defaultValues: { response: assignment.mySubmission?.response ?? '', file: null },
  });
  const { reset, setValue, getValues, setError, clearErrors, handleSubmit } = form;

  // Keyed on the id + saved answer (not the object), so a background refetch
  // of the same assignment doesn't wipe what the student is typing; a new
  // saved answer (after submitting) does reset it.
  const assignmentId = assignment.id;
  const savedResponse = assignment.mySubmission?.response ?? '';
  useEffect(() => {
    reset({ response: savedResponse, file: null });
  }, [assignmentId, savedResponse, reset]);

  async function pickFile() {
    setFileError(null);
    try {
      const asset = await pickSubmissionDocument();
      if (!asset) return;
      const result = validateSubmissionFile(asset);
      if (!result.ok) {
        setFileError(result.error);
        return;
      }
      setValue('file', result.file, { shouldDirty: true });
      clearErrors('response');
    } catch {
      setFileError("Couldn't open your files. Please try again.");
    }
  }

  function removeFile() {
    setValue('file', null, { shouldDirty: true });
  }

  const review = handleSubmit(() => {
    clearErrors('root');
    setStage('reviewing');
  });

  async function confirmSubmit() {
    if (isSubmitting) return; // guards a double tap before the button disables
    const { response, file } = getValues();
    const trimmed = response.trim(); // ends only — inner line breaks are kept
    try {
      await submitAssignment({
        assignmentId,
        response: trimmed || undefined,
        file: file ? { uri: file.uri, name: file.name, type: file.mimeType } : undefined,
      }).unwrap();
      setStage('editing');
      onSubmitted();
    } catch (error) {
      // Back to editing with everything the student entered still in place.
      setStage('editing');
      setError('root', {
        message: isResponseFieldRejected(error)
          ? RESPONSE_FIELD_REJECTED_MESSAGE
          : getApiErrorMessage(error),
      });
    }
  }

  return {
    ...form,
    stage,
    isSubmitting,
    fileError,
    pickFile,
    removeFile,
    review,
    editAgain: () => setStage('editing'),
    confirmSubmit,
  };
}
