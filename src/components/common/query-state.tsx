import type { ReactNode } from 'react';

import { Button } from '@/components/buttons/button';
import { EmptyState } from '@/components/common/empty-state';
import { FullPageLoader } from '@/components/loading/full-page-loader';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  /** Custom loading UI (e.g. `SkeletonList`, `SkeletonProfile`) — defaults
   * to the full-page spinner so every existing call site is unaffected. */
  loadingFallback?: ReactNode;
  /** Custom empty-state UI (e.g. an `EmptyState` with an `icon` and
   * `description`) — defaults to a plain `EmptyState` using `emptyMessage`
   * as its title, so every existing call site is unaffected. */
  emptyFallback?: ReactNode;
  children: ReactNode;
};

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = 'Nothing here yet.',
  onRetry,
  loadingFallback,
  emptyFallback,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return loadingFallback ?? <FullPageLoader />;
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
    return emptyFallback ?? <EmptyState title={emptyMessage} />;
  }

  return <>{children}</>;
}
