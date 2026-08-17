import type { Href } from 'expo-router';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/buttons/button';
import { Icon } from '@/components/common/icon';
import { AuthHeading } from '@/components/auth/auth-heading';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useLoginForm } from '@/features/auth/use-login-form';
import { Palette } from '@/theme';
import { Link } from '@/tw';

// One-off screen-specific look (underline fields, wave header) — the shared
// TextField/Button styling used by every other screen is untouched.
export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);
  const {
    control,
    onSubmit,
    isSubmitting,
    formState: { errors },
  } = useLoginForm();

  return (
    <AuthScreenShell>
      <AuthHeading title="Sign in" />

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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Password"
            icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your password"
            editable={!isSubmitting}
            error={errors.password?.message}
          />
        )}
      />

      <View style={styles.optionsRow}>
        <Pressable
          style={styles.rememberRow}
          onPress={() => setRememberMe((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          accessibilityLabel="Remember me"
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && (
              <Icon
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                size="sm"
                color="#FFFFFF"
              />
            )}
          </View>
          <Text style={styles.rememberLabel}>Remember Me</Text>
        </Pressable>

        {/* Cast: /reset_password isn't in the typed-routes union until the dev server re-scans. */}
        <Link href={'/reset_password' as Href}>
          <Text style={styles.forgotLabel}>Forgot Password?</Text>
        </Link>
      </View>

      {errors.root?.message && <Text style={styles.formError}>{errors.root.message}</Text>}

      <Button label="Login" onPress={onSubmit} isLoading={isSubmitting} />

      <Text style={styles.footer}>To sign up, go to the website or ask your school</Text>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  rememberLabel: {
    fontSize: 14,
    color: '#344054',
  },
  forgotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.secondary,
  },
  formError: {
    fontSize: 13,
    color: Palette.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 13,
    color: '#667085',
  },
});
