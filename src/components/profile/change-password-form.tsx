import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { AuthTextField } from '@/components/auth/auth-text-field';
import { Button } from '@/components/buttons/button';
import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useChangePasswordForm } from '@/features/profile/use-change-password-form';
import { Palette } from '@/theme';
import { Text, View } from '@/tw';
import { PASSWORD_RULES, passwordRuleResults, passwordStrength } from '@/utils/password-rules';

const LOCK_ICON = { ios: 'lock', android: 'lock', web: 'lock' } as const;
const METER_SEGMENTS = [1, 2, 3, 4] as const;
const STRENGTH_COLOR = {
  Weak: Palette.error,
  Fair: Palette.warning,
  Strong: Palette.success,
  'Very strong': Palette.success,
} as const;

/** Four-segment meter + label under the new-password field. */
function StrengthMeter({ password }: { password: string }) {
  const theme = useTheme();
  const { score, label } = passwordStrength(password);
  const color = label ? STRENGTH_COLOR[label] : theme.backgroundElement;
  return (
    <View
      className="-mt-2 mb-5 flex-row items-center gap-2"
      accessible
      accessibilityLabel={label ? `Password strength: ${label}` : 'Password strength'}
    >
      {METER_SEGMENTS.map((segment) => (
        <View
          key={segment}
          style={[
            styles.segment,
            { backgroundColor: segment <= score ? color : theme.backgroundElement },
          ]}
        />
      ))}
      <ThemedText type="small" style={[styles.strengthLabel, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

/** "Your password must" checklist — ticks each rule as it's met. */
function RulesChecklist({ password }: { password: string }) {
  const theme = useTheme();
  const results = passwordRuleResults(password);
  return (
    <View
      className="mb-6 gap-2 rounded-card p-4"
      style={{ backgroundColor: theme.backgroundElement }}
    >
      <ThemedText type="smallBold">Your password must</ThemedText>
      {PASSWORD_RULES.map((rule) => {
        const met = results[rule.id];
        return (
          <View
            key={rule.id}
            className="flex-row items-center gap-2"
            accessible
            accessibilityLabel={`${rule.label}: ${met ? 'done' : 'not yet'}`}
          >
            <View style={[styles.ruleDot, { backgroundColor: met ? Palette.success : theme.card }]}>
              <Icon
                name={
                  met
                    ? { ios: 'checkmark', android: 'check', web: 'check' }
                    : { ios: 'minus', android: 'remove', web: 'remove' }
                }
                size={10}
                color={met ? '#FFFFFF' : theme.textSecondary}
              />
            </View>
            <ThemedText type="small">{rule.label}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Change password — shared by the Student and Parent apps. Same underline
 * fields as the sign-in screen (`AuthTextField`), a strength meter and a
 * live rules checklist driven by `PASSWORD_RULES` (the form's validation uses
 * the same list). Changing the password keeps this device signed in.
 */
export function ChangePasswordForm() {
  const { user } = useAuth();
  const {
    control,
    onSubmit,
    isSubmitting,
    isSaved,
    formState: { errors },
  } = useChangePasswordForm();
  const newPassword = useWatch({ control, name: 'newPassword' });

  return (
    <>
      <ThemedText type="small" themeColor="textSecondary" className="mb-6">
        Choose a new password for {user?.email ? user.email : 'your account'}. You will stay signed
        in on this device.
      </ThemedText>

      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Current password"
            icon={LOCK_ICON}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="current-password"
            textContentType="password"
            editable={!isSubmitting}
            error={errors.currentPassword?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="New password"
            icon={LOCK_ICON}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!isSubmitting}
            error={errors.newPassword?.message}
          />
        )}
      />
      <StrengthMeter password={newPassword} />

      <Controller
        control={control}
        name="newPasswordConfirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Confirm new password"
            icon={LOCK_ICON}
            isPassword
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!isSubmitting}
            error={errors.newPasswordConfirm?.message}
          />
        )}
      />

      <RulesChecklist password={newPassword} />

      {errors.root?.message && (
        <Text className="mb-3 text-center text-sm text-error" accessibilityLiveRegion="polite">
          {errors.root.message}
        </Text>
      )}
      {isSaved && (
        <Text className="mb-3 text-center text-sm text-success" accessibilityLiveRegion="polite">
          Password updated.
        </Text>
      )}

      <Button label="Update Password" onPress={onSubmit} isLoading={isSubmitting} />
    </>
  );
}

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    minWidth: 72,
    textAlign: 'right',
    fontWeight: '600',
  },
  ruleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
