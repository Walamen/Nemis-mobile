import { useState, type ComponentProps } from 'react';
import { ActivityIndicator } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, Text, TextInput, View } from '@/tw';

const EYE_ICON: IconProps['name'] = { ios: 'eye', android: 'visibility', web: 'visibility' };
const EYE_SLASH_ICON: IconProps['name'] = {
  ios: 'eye.slash',
  android: 'visibility_off',
  web: 'visibility_off',
};

export type TextFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  /** Shown below the input when there's no `error`. */
  helperText?: string;
  leftIcon?: IconProps['name'];
  /** Ignored when `isPassword` or `isLoading` is set — those own the right slot. */
  rightIcon?: IconProps['name'];
  /** Adds a show/hide toggle in the right slot and manages `secureTextEntry` internally. */
  isPassword?: boolean;
  /** Shows a spinner in the right slot, e.g. while an async validation check runs. */
  isLoading?: boolean;
  disabled?: boolean;
};

export function TextField({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword,
  isLoading,
  disabled,
  editable,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isEditable = disabled ? false : (editable ?? true);

  return (
    <ThemedView className={`gap-1 ${disabled ? 'opacity-60' : ''}`}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        className="flex-row items-center gap-2 rounded-input px-4"
        style={{ backgroundColor: theme.backgroundElement }}
      >
        {leftIcon && <Icon name={leftIcon} size="sm" color={theme.textSecondary} />}
        <TextInput
          className="flex-1 py-3 text-base"
          style={{ color: theme.text }}
          placeholderTextColor={theme.textSecondary}
          editable={isEditable}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          {...inputProps}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon
              name={showPassword ? EYE_SLASH_ICON : EYE_ICON}
              size="sm"
              color={theme.textSecondary}
            />
          </Pressable>
        ) : (
          rightIcon && <Icon name={rightIcon} size="sm" color={theme.textSecondary} />
        )}
      </View>
      {error ? (
        <Text className="text-sm text-error">{error}</Text>
      ) : (
        helperText && (
          <ThemedText type="small" themeColor="textSecondary">
            {helperText}
          </ThemedText>
        )
      )}
    </ThemedView>
  );
}
