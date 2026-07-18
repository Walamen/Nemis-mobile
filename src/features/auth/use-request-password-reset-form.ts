import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRequestPasswordResetMutation } from '@/api/auth/auth-api';
import {
  requestPasswordResetSchema,
  type RequestPasswordResetFormValues,
} from '@/features/auth/reset-password-schemas';
import { getApiErrorMessage } from '@/utils/api-error';

export function useRequestPasswordResetForm() {
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [isSent, setIsSent] = useState(false);
  const form = useForm<RequestPasswordResetFormValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: RequestPasswordResetFormValues) {
    try {
      await requestReset(values).unwrap();
      setIsSent(true);
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return { ...form, onSubmit: form.handleSubmit(onSubmit), isSubmitting: isLoading, isSent };
}
