import { z } from 'zod';

const submissionFileSchema = z.object({
  uri: z.string().min(1),
  name: z.string().min(1),
  size: z.number().optional(),
  mimeType: z.string().min(1),
});

/**
 * Matches the server/web contract: a written answer, a file, or both — but
 * not neither. Line breaks inside the answer are kept; only surrounding
 * whitespace is ignored when deciding whether it's empty.
 */
export const submitAssignmentSchema = z
  .object({
    response: z.string(),
    file: submissionFileSchema.nullable(),
  })
  .refine((values) => values.response.trim().length > 0 || values.file != null, {
    message: 'Write an answer or attach a file before submitting.',
    path: ['response'],
  });

export type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;
