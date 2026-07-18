import type { Href } from 'expo-router';
import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { TextField } from '@/components/forms/text-field';
import { ThemedView } from '@/components/common/themed-view';
import { ThemedText } from '@/components/typography/themed-text';
import { useLoginForm } from '@/features/auth/use-login-form';
import { Link, Text } from '@/tw';

export default function LoginScreen() {
  const {
    control,
    onSubmit,
    isSubmitting,
    formState: { errors },
  } = useLoginForm();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 justify-center gap-4 px-6">
        <ThemedText type="title" className="text-center">
          Nemis Student & Parent Portal
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="mb-4 text-center">
          Use your NEMIS account to continue
        </ThemedText>

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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Password"
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

          {errors.root?.message && (
            <Text className="text-center text-sm text-red-600">{errors.root.message}</Text>
          )}

          <Button label="Sign in" onPress={onSubmit} isLoading={isSubmitting} />
        </ThemedView>

        {/* Cast: /reset_password isn't in the typed-routes union until the dev server re-scans. */}
        <Link href={'/reset_password' as Href} className="mt-2 text-center">
          <ThemedText themeColor="textSecondary">Forgot your password?</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}
