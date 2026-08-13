import type { PropsWithChildren } from 'react';

import { InlineLoader } from '@/components/loading/inline-loader';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export type SectionStateProps = PropsWithChildren<{
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage: string;
}>;

/**
 * Compact loading/error/empty renderer for a section within an
 * already-loaded screen (e.g. one card group on a dashboard driven by its
 * own independent query) — where `QueryState`'s full-page `flex-1`
 * fallbacks would collapse to zero height outside a screen-filling
 * container. See docs/UI_PATTERNS.md §2. Originally a local copy in the
 * student dashboard; extracted once the parent dashboard needed the same
 * shape too.
 */
export function SectionState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  children,
}: SectionStateProps) {
  if (isLoading) {
    return <InlineLoader />;
  }
  if (isError) {
    return (
      <ThemedView type="backgroundElement" className="rounded-card p-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          Couldn&apos;t load this right now.
        </ThemedText>
      </ThemedView>
    );
  }
  if (isEmpty) {
    return (
      <ThemedView type="backgroundElement" className="items-center gap-1 rounded-card p-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          {emptyMessage}
        </ThemedText>
      </ThemedView>
    );
  }
  return <>{children}</>;
}
