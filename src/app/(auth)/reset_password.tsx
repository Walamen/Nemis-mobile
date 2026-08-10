import type { Href } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/buttons/button';
import { AuthHeading } from '@/components/auth/auth-heading';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useConfirmPasswordResetForm } from '@/features/auth/use-confirm-password-reset-form';
import { useRequestPasswordResetForm } from '@/features/auth/use-request-password-reset-form';
import { Link } from '@/tw';

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
      <Text style={styles.message}>
        If that email address is registered, a password reset link has been sent to it.
      </Text>
    );
  }

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Email"
            icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
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

      {errors.root?.message && <Text style={styles.formError}>{errors.root.message}</Text>}

      <Button label="Send reset link" onPress={onSubmit} isLoading={isSubmitting} />
    </>
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
    <>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="New password"
            icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your new password"
            editable={!isSubmitting}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="passwordConfirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Confirm password"
            icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Re-enter your new password"
            editable={!isSubmitting}
            error={errors.passwordConfirm?.message}
          />
        )}
      />

      {errors.root?.message && <Text style={styles.formError}>{errors.root.message}</Text>}

      <Button label="Reset password" onPress={onSubmit} isLoading={isSubmitting} />
    </>
  );
}

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  return (
    <AuthScreenShell>
      <AuthHeading title={token ? 'New Password' : 'Forgot Password?'} />
      <Text style={styles.subtitle}>
        {token
          ? 'Choose a new password for your account'
          : "Enter your email and we'll send you a reset link"}
      </Text>

      {token ? <ConfirmResetForm token={token} /> : <RequestResetForm />}

      <Link href={'/' as Href} style={styles.backLink}>
        <Text style={styles.backLabel}>Back to sign in</Text>
      </Link>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: -12,
    marginBottom: 24,
  },
  message: {
    fontSize: 14,
    color: '#344054',
    textAlign: 'center',
    marginBottom: 24,
  },
  formError: {
    fontSize: 13,
    color: '#C10021',
    textAlign: 'center',
    marginBottom: 16,
  },
  backLink: {
    marginTop: 20,
  },
  backLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
  },
});
