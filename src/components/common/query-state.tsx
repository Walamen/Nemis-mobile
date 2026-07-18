import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/buttons/button';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = 'Nothing here yet.',
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView className="flex-1 items-center justify-center gap-3 px-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          Something went wrong loading this. Please try again.
        </ThemedText>
        {onRetry && <Button label="Retry" onPress={onRetry} />}
      </ThemedView>
    );
  }

  if (isEmpty) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          {emptyMessage}
        </ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
