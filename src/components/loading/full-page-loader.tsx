import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/common/themed-view';

export type FullPageLoaderProps = {
  className?: string;
};

/** Full-screen centered spinner — the shared shape behind `QueryState`'s
 * default loading branch and the root layout's session-check screen. */
export function FullPageLoader({
  className = 'flex-1 items-center justify-center',
}: FullPageLoaderProps) {
  return (
    <ThemedView className={className}>
      <ActivityIndicator />
    </ThemedView>
  );
}
