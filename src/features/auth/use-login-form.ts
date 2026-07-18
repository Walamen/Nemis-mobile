import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '@/api/auth/auth-api';
import { loginSchema, type LoginFormValues } from '@/features/auth/login-schema';
import { getApiErrorMessage } from '@/utils/api-error';

export function useLoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      // No manual navigation: the login mutation invalidates the 'Me' query,
      // isAuthenticated flips true, and the root layout's Stack.Protected
      // guards swap to the (student)/(parent) group automatically.
      await login(values).unwrap();
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return { ...form, onSubmit: form.handleSubmit(onSubmit), isSubmitting: isLoading };
}
