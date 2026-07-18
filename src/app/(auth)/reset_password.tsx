import type { Href } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { TextField } from '@/components/forms/text-field';
import { ThemedView } from '@/components/common/themed-view';
import { ThemedText } from '@/components/typography/themed-text';
import { useConfirmPasswordResetForm } from '@/features/auth/use-confirm-password-reset-form';
import { useRequestPasswordResetForm } from '@/features/auth/use-request-password-reset-form';
import { Link, Text } from '@/tw';

function RequestResetForm() {
  const {
    control,
    onSubmit,
    isSubmitting,
    isSent,
    formState: { errors },
  } = useRequestPasswordResetForm();

  if (isSent) {
    return (
      <ThemedText themeColor="textSecondary" className="text-center">
        If that email address is registered, a password reset link has been sent to it.
      </ThemedText>
    );
  }

  return (
    <ThemedView className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            editable={!isSubmitting}
            error={errors.email?.message}
          />
        )}
      />

      {errors.root?.message && (
        <Text className="text-center text-sm text-red-600">{errors.root.message}</Text>
      )}

      <Button label="Send reset link" onPress={onSubmit} isLoading={isSubmitting} />
    </ThemedView>
  );
}

function ConfirmResetForm({ token }: { token: string }) {
  const {
    control,
    onSubmit,
    isSubmitting,
    formState: { errors },
  } = useConfirmPasswordResetForm(token);

  return (
    <ThemedView className="gap-4">
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            placeholder="••••••••"
            editable={!isSubmitting}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="passwordConfirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            placeholder="••••••••"
            editable={!isSubmitting}
            error={errors.passwordConfirm?.message}
          />
        )}
      />

      {errors.root?.message && (
        <Text className="text-center text-sm text-red-600">{errors.root.message}</Text>
      )}

      <Button label="Reset password" onPress={onSubmit} isLoading={isSubmitting} />
    </ThemedView>
  );
}

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 justify-center gap-4 px-6">
        <ThemedText type="title" className="text-center">
          Reset your password
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="mb-4 text-center">
          {token
            ? 'Choose a new password for your account'
            : "Enter your email and we'll send you a reset link"}
        </ThemedText>

        {token ? <ConfirmResetForm token={token} /> : <RequestResetForm />}

        <Link href={'/' as Href} className="mt-2 text-center">
          <ThemedText themeColor="textSecondary">Back to sign in</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}
