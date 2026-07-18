import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { TextField } from '@/components/forms/text-field';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useUpdateProfileForm } from '@/features/profile/use-update-profile-form';
import { Text } from '@/tw';

export default function ProfileScreen() {
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
    <SafeAreaView className="flex-1 px-6 pt-4">
      <QueryState isLoading={isProfileLoading} isError={isProfileError}>
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
        {isSaved && (
          <Text className="mb-2 text-center text-sm text-green-600">Profile updated.</Text>
        )}

        <Button label="Save changes" onPress={onSubmit} isLoading={isSubmitting} className="mt-2" />
      </QueryState>
    </SafeAreaView>
  );
}
