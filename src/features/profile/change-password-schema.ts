import { z } from 'zod';

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordComplexity, 'Include an uppercase letter, a lowercase letter, and a number'),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'Passwords do not match',
    path: ['newPasswordConfirm'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
