import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LoginRole } from '@/features/auth/login-schema';
import { Palette } from '@/theme';

const OPTIONS: { role: LoginRole; label: string }[] = [
  { role: 'parent', label: 'Parent' },
  { role: 'student', label: 'Student' },
];

export type AuthRoleToggleProps = {
  value: LoginRole;
  onChange: (role: LoginRole) => void;
  disabled?: boolean;
};

/** Parent / Student pill switch on the sign-in screen. */
export function AuthRoleToggle({ value, onChange, disabled }: AuthRoleToggleProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {OPTIONS.map(({ role, label }) => {
        const selected = role === value;
        return (
          <Pressable
            key={role}
            style={[styles.pill, selected ? styles.pillSelected : styles.pillIdle]}
            onPress={() => onChange(role)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={`Sign in as ${label.toLowerCase()}`}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Palette.secondary,
  },
  pillSelected: {
    backgroundColor: Palette.secondary,
  },
  pillIdle: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelIdle: {
    color: Palette.secondary,
  },
});
