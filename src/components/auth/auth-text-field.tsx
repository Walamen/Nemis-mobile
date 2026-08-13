import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { Palette } from '@/theme';

export type AuthTextFieldProps = TextInputProps & {
  label: string;
  icon: IconProps['name'];
  error?: string;
  isPassword?: boolean;
};

/** Underline field with a leading icon, used by the (auth) screens' one-off design. */
export function AuthTextField({
  label,
  icon,
  error,
  isPassword,
  ...inputProps
}: AuthTextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <Icon name={icon} size="sm" color={Palette.secondary} />
        <TextInput
          placeholderTextColor="#9AA0A6"
          secureTextEntry={isPassword && !showPassword}
          style={styles.fieldInput}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon
              name={
                showPassword
                  ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                  : { ios: 'eye', android: 'visibility', web: 'visibility' }
              }
              size="sm"
              color="#9AA0A6"
            />
          </Pressable>
        )}
      </View>
      <View style={styles.fieldUnderline} />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: '#101828',
    paddingVertical: 6,
  },
  fieldUnderline: {
    height: 1,
    backgroundColor: '#E4E7EC',
    marginTop: 8,
  },
  fieldError: {
    fontSize: 12,
    color: '#C10021',
    marginTop: 6,
  },
});
