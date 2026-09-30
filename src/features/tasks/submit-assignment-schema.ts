import { z } from 'zod';

// The app has no file picker yet, so the text response is the whole
// submission — an empty one would hand in nothing.
export const submitAssignmentSchema = z.object({
  response: z.string().trim().min(1, 'Write your response before submitting'),
});

export type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;
