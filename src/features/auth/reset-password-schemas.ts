import { z } from 'zod';

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
export type RequestPasswordResetFormValues = z.infer<typeof requestPasswordResetSchema>;

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
export const confirmPasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordComplexity, 'Include an uppercase letter, a lowercase letter, and a number'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });
export type ConfirmPasswordResetFormValues = z.infer<typeof confirmPasswordResetSchema>;
