import type { ReactNode } from 'react';

import { Button } from '@/components/buttons/button';
import { EmptyState } from '@/components/common/empty-state';
import { FullPageLoader } from '@/components/loading/full-page-loader';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { API_ERROR_MESSAGES, getApiErrorKind } from '@/utils/api-error';

export type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  /** The query's `error` — picks offline/session/server copy instead of
   * the generic message. */
  error?: unknown;
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
  error,
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
          {API_ERROR_MESSAGES[getApiErrorKind(error)]}
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
