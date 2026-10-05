import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/common/themed-view';

export type FullPageLoaderProps = {
  className?: string;
};

/** Full-screen centered spinner — the shared shape behind `QueryState`'s
 * default loading branch and the root layout's session-check screen. */
export function FullPageLoader({
  className = 'items-center justify-center py-12',
}: FullPageLoaderProps) {
  return (
    // `flexGrow` (not `flex: 1`): fills a bounded screen, but keeps its natural
    // height inside scroll content instead of collapsing to 0.
    <ThemedView className={className} style={{ flexGrow: 1 }}>
      <ActivityIndicator />
    </ThemedView>
  );
}
