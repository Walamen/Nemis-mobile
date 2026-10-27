import { z } from 'zod';

import { PASSWORD_RULES } from '@/utils/password-rules';

const newPassword = PASSWORD_RULES.reduce<z.ZodString>(
  (schema, rule) =>
    schema.refine(
      rule.test,
      `Your password must ${rule.label.charAt(0).toLowerCase()}${rule.label.slice(1)}`,
    ),
  z.string(),
);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword,
    newPasswordConfirm: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'Passwords do not match',
    path: ['newPasswordConfirm'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
