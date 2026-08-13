import { Controller } from 'react-hook-form';

import { Button } from '@/components/buttons/button';
import { TextField } from '@/components/forms/text-field';
import { QueryState } from '@/components/common/query-state';
import { SkeletonProfile } from '@/components/loading/skeleton-profile';
import { ThemedText } from '@/components/typography/themed-text';
import { useUpdateProfileForm } from '@/features/profile/use-update-profile-form';
import { Text } from '@/tw';

/** Shared by student and parent Profile screens — profile editing is role-agnostic. */
export function EditProfileForm() {
  const {
    control,
    onSubmit,
    isSubmitting,
    isSaved,
    profile,
    isProfileLoading,
    isProfileError,
    formState: { errors },
  } = useUpdateProfileForm();

  return (
    <QueryState
      isLoading={isProfileLoading}
      isError={isProfileError}
      loadingFallback={<SkeletonProfile fields={3} avatar={false} />}
    >
      <ThemedText type="small" themeColor="textSecondary" className="mb-4">
        {profile?.email}
      </ThemedText>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="First name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!isSubmitting}
            error={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Last name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!isSubmitting}
            error={errors.lastName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phoneNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Phone number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="phone-pad"
            editable={!isSubmitting}
            error={errors.phoneNumber?.message}
          />
        )}
      />

      {errors.root?.message && (
        <Text className="mb-2 text-center text-sm text-red-600">{errors.root.message}</Text>
      )}
      {isSaved && <Text className="mb-2 text-center text-sm text-green-600">Profile updated.</Text>}

      <Button label="Save changes" onPress={onSubmit} isLoading={isSubmitting} className="mt-2" />
    </QueryState>
  );
}
