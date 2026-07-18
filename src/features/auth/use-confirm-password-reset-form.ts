import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useConfirmPasswordResetMutation } from '@/api/auth/auth-api';
import {
  confirmPasswordResetSchema,
  type ConfirmPasswordResetFormValues,
} from '@/features/auth/reset-password-schemas';
import { getApiErrorMessage } from '@/utils/api-error';

export function useConfirmPasswordResetForm(token: string) {
  const router = useRouter();
  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation();
  const form = useForm<ConfirmPasswordResetFormValues>({
    resolver: zodResolver(confirmPasswordResetSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  async function onSubmit(values: ConfirmPasswordResetFormValues) {
    try {
      await confirmReset({ token, ...values }).unwrap();
      router.replace('/' as Href);
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return { ...form, onSubmit: form.handleSubmit(onSubmit), isSubmitting: isLoading };
}
