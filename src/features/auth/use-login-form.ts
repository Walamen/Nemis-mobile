import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '@/api/auth/auth-api';
import {
  parentLoginSchema,
  studentLoginSchema,
  type LoginRole,
  type ParentLoginFormValues,
  type StudentLoginFormValues,
} from '@/features/auth/login-schema';
import {
  clearRememberedLogin,
  getRememberedLogin,
  setRememberedLogin,
} from '@/services/remembered-login';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatNemisIdInput } from '@/utils/nemis-id';

/** Default tab when nothing is remembered — most sign-ins are students. */
const DEFAULT_ROLE: LoginRole = 'student';

/**
 * Sign-in state for both tabs. Each tab keeps its own form so switching
 * doesn't carry a NEMIS ID into the email field (or validation errors across);
 * only the active tab's form is submitted.
 */
export function useLoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const [role, setRoleState] = useState<LoginRole>(DEFAULT_ROLE);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const studentForm = useForm({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: { nemisId: '', password: '' },
  });
  const parentForm = useForm({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Restore a remembered tab + identifier once, on mount.
  useEffect(() => {
    let cancelled = false;
    getRememberedLogin().then((remembered) => {
      if (cancelled || !remembered) return;
      setRoleState(remembered.role);
      setRememberMe(true);
      if (remembered.role === 'student') {
        studentForm.setValue('nemisId', formatNemisIdInput(remembered.identifier));
      } else {
        parentForm.setValue('email', remembered.identifier);
      }
    });
    return () => {
      cancelled = true;
    };
    // Mount-only: the form objects are stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setRole(next: LoginRole) {
    setRoleState(next);
    setSubmitError('');
  }

  async function signIn(nextRole: LoginRole, identifier: string, request: Parameters<typeof login>[0]) {
    setSubmitError('');
    try {
      // No manual navigation: the login mutation invalidates the 'Me' query,
      // isAuthenticated flips true, and the root layout's Stack.Protected
      // guards swap to the (student)/(parent) group automatically.
      await login(request).unwrap();
      // Best effort — failing to save or clear the remembered identifier
      // must never block a successful sign-in.
      await (rememberMe
        ? setRememberedLogin({ role: nextRole, identifier })
        : clearRememberedLogin()
      ).catch(() => {});
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  const submitStudent = studentForm.handleSubmit((values: StudentLoginFormValues) =>
    signIn('student', values.nemisId, { nemisId: values.nemisId, password: values.password }),
  );
  const submitParent = parentForm.handleSubmit((values: ParentLoginFormValues) =>
    signIn('parent', values.email, { email: values.email, password: values.password }),
  );

  return {
    role,
    setRole,
    studentForm,
    parentForm,
    rememberMe,
    setRememberMe,
    submitError,
    onSubmit: role === 'student' ? submitStudent : submitParent,
    isSubmitting: isLoading,
  };
}
