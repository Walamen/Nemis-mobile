import type { ReactNode } from 'react';

import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { useSelectedChild } from '@/hooks/use-selected-child';

/**
 * Resolves the parent's children list before a child-scoped screen renders.
 *
 * Every child-scoped query is `skip`ped until a child is selected — and a
 * skipped query reports neither loading nor error. Without this gate, while
 * the children list loaded, failed, or came back empty, those screens
 * rendered their content with no data at all: a blank page. This turns
 * those three cases into the standard loading / error+retry / empty states.
 */
export function ChildGate({
  children,
  loadingFallback,
}: {
  children: ReactNode;
  loadingFallback?: ReactNode;
}) {
  const { children: linkedChildren, error, isLoading, isError, refetch } = useSelectedChild();

  return (
    <QueryState
      isLoading={isLoading}
      // A failed refresh keeps showing the children already loaded.
      isError={isError && linkedChildren.length === 0}
      error={error}
      isEmpty={linkedChildren.length === 0}
      onRetry={refetch}
      loadingFallback={loadingFallback}
      emptyFallback={
        <EmptyState
          icon={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
          title="No children linked yet"
          description="Your children will appear here once your school links your account to their record."
        />
      }
    >
      {children}
    </QueryState>
  );
}
