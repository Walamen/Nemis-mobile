import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { TextField } from '@/components/forms/text-field';
import { useChangePasswordForm } from '@/features/profile/use-change-password-form';
import { Text } from '@/tw';

export default function ChangePasswordScreen() {
  const {
    control,
    onSubmit,
    isSubmitting,
    isSaved,
    formState: { errors },
  } = useChangePasswordForm();

  return (
    <SafeAreaView className="flex-1 px-6 pt-4">
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Current password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            editable={!isSubmitting}
            error={errors.currentPassword?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            editable={!isSubmitting}
            error={errors.newPassword?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="newPasswordConfirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm new password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            editable={!isSubmitting}
            error={errors.newPasswordConfirm?.message}
          />
        )}
      />

      {errors.root?.message && (
        <Text className="mb-2 text-center text-sm text-red-600">{errors.root.message}</Text>
      )}
      {isSaved && (
        <Text className="mb-2 text-center text-sm text-green-600">Password updated.</Text>
      )}

      <Button
        label="Update password"
        onPress={onSubmit}
        isLoading={isSubmitting}
        className="mt-2"
      />
    </SafeAreaView>
  );
}
