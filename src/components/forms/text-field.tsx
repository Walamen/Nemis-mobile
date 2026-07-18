import type { ComponentProps } from 'react';

import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Text, TextInput } from '@/tw';

export type TextFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <ThemedView className="gap-1">
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        className="rounded-input px-4 py-3 text-base"
        style={{ backgroundColor: theme.backgroundElement, color: theme.text }}
        placeholderTextColor={theme.textSecondary}
        {...inputProps}
      />
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </ThemedView>
  );
}
