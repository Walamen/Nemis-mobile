import { ActivityIndicator } from 'react-native';

import { Pressable, Text } from '@/tw';
import { Typography } from '@/theme';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Button({ label, onPress, isLoading, disabled, className = '' }: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      className={`items-center justify-center rounded-button bg-secondary py-4 shadow-sm active:opacity-80 ${
        isDisabled ? 'opacity-60' : ''
      } ${className}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-white" style={Typography.button}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
