import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useGetProfileQuery, useUpdateProfileMutation } from '@/api/profile/profile-api';
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from '@/features/profile/update-profile-schema';
import { getApiErrorMessage } from '@/utils/api-error';

export function useUpdateProfileForm() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSubmitting }] = useUpdateProfileMutation();
  const [isSaved, setIsSaved] = useState(false);
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName: '', lastName: '', phoneNumber: '' },
  });
  const { reset } = form;

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber ?? '',
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: UpdateProfileFormValues) {
    setIsSaved(false);
    try {
      await updateProfile(values).unwrap();
      setIsSaved(true);
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  }

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isSaved,
    profile,
    isProfileLoading,
    isProfileError,
  };
}
