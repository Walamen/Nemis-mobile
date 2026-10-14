import type { Href } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/buttons/button';
import { AuthHeading } from '@/components/auth/auth-heading';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useConfirmPasswordResetForm } from '@/features/auth/use-confirm-password-reset-form';
import { Palette } from '@/theme';
import { Link } from '@/tw';

/**
 * The server doesn't send reset emails yet (it never emails the link), so
 * the app can't run the request step — it points people to the website
 * instead of promising an email that never arrives. Restore the email form
 * (git history) once the server sends reset links.
 */
function ResetOnWebsiteNotice() {
  return (
    <>
      <Text style={styles.message}>
        To reset your password, go to the NEMIS SIS website (Student Portal) and reset it there.
      </Text>
      <Text style={styles.note}>
        Can&apos;t reset it on the website? Ask your school administrator to reset it for you.
      </Text>
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
      <AuthHeading
        title={token ? 'New Password' : 'Forgot Password?'}
        subtitle={
          token
            ? 'Choose a new password for your account'
            : 'Reset your password on the SIS website'
        }
      />

      {token ? <ConfirmResetForm token={token} /> : <ResetOnWebsiteNotice />}

      <Link href={'/' as Href} style={styles.backLink}>
        <Text style={styles.backLabel}>Back to sign in</Text>
      </Link>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    color: '#667085',
  },
  message: {
    fontSize: 14,
    color: '#344054',
    textAlign: 'center',
    marginBottom: 24,
  },
  formError: {
    fontSize: 13,
    color: Palette.error,
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
