import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useChangePasswordMutation } from '@/api/profile/profile-api';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/profile/change-password-schema';
import { getApiErrorMessage } from '@/utils/api-error';

export function useChangePasswordForm() {
  const [changePassword, { isLoading: isSubmitting }] = useChangePasswordMutation();
  const [isSaved, setIsSaved] = useState(false);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', newPasswordConfirm: '' },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsSaved(false);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      setIsSaved(true);
      form.reset();
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return { ...form, onSubmit: form.handleSubmit(onSubmit), isSubmitting, isSaved };
}
