import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { Pressable, Text } from '@/tw';
import { Palette, Typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

/** Container classes per variant. Kept separate from text/tint so both can be
 * looked up from the same `variant` without duplicating the branching. */
// Padding lives here (not in the shared base classes below) so each
// variant's py-* is the only one in the class string — mixing two py-*
// utilities in one className string has undefined winner order under
// react-native-css, unlike CSS specificity in a browser.
const VARIANT_CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-secondary px-6 py-4 shadow-sm',
  secondary: 'border-2 border-secondary bg-transparent px-6 py-4',
  text: 'bg-transparent px-2 py-2',
  danger: 'bg-error px-6 py-4 shadow-sm',
};

const VARIANT_TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-secondary',
  text: 'text-secondary',
  danger: 'text-white',
};

/** Raw color for the loading spinner / icon tint — `ActivityIndicator` and
 * `Icon` take a color prop, not a className, so this can't be a Tailwind class. */
const VARIANT_TINT: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: Palette.secondary,
  text: Palette.secondary,
  danger: '#ffffff',
};

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Visual weight/emphasis. `primary` (default) is the filled CTA color;
   * `secondary` is outlined for lower emphasis; `text` is for inline actions
   * like "See all"; `danger` is for destructive actions (logout, delete). */
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  /** Leading (or trailing, via `iconPosition`) icon. Hidden while `isLoading`. */
  icon?: IconProps['name'];
  iconPosition?: 'left' | 'right';
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading,
  disabled,
  icon,
  iconPosition = 'left',
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const tint = VARIANT_TINT[variant];

  function handlePress() {
    // Haptics aren't supported on web and the module warns instead of
    // silently no-oping there, so skip it outright rather than try/catch.
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }

  return (
    <Pressable
      className={`flex-row items-center justify-center gap-2 rounded-button active:opacity-80 ${
        VARIANT_CONTAINER_CLASSES[variant]
      } ${isDisabled ? 'opacity-60' : ''} ${className}`}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color={tint} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} size="sm" color={tint} />}
          <Text className={VARIANT_TEXT_CLASSES[variant]} style={Typography.button}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && <Icon name={icon} size="sm" color={tint} />}
        </>
      )}
    </Pressable>
  );
}
