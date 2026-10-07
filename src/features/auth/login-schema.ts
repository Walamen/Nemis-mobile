import { z } from 'zod';

import { isValidNemisId, nemisIdDigits } from '@/utils/nemis-id';

/** Which tab of the sign-in screen is active — decides the identifier field. */
export type LoginRole = 'student' | 'parent';

// Presence only — password rules are enforced where passwords are created.
const password = z.string().min(1, 'Enter your password');

/** Students sign in with their NEMIS ID; the API receives the bare 12 digits. */
export const studentLoginSchema = z.object({
  nemisId: z
    .string()
    .trim()
    .min(1, 'Enter your NEMIS ID')
    .refine((value) => nemisIdDigits(value).length === 12, 'Enter your 12-digit NEMIS ID')
    .refine(isValidNemisId, "That NEMIS ID isn't valid — check the digits on your report card")
    .transform(nemisIdDigits),
  password,
});

/** Parents sign in with their email address. */
export const parentLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password,
});

export type StudentLoginFormInput = z.input<typeof studentLoginSchema>;
export type StudentLoginFormValues = z.output<typeof studentLoginSchema>;
export type ParentLoginFormValues = z.infer<typeof parentLoginSchema>;
