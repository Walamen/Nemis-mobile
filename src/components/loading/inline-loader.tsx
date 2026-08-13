import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/common/themed-view';

export type InlineLoaderProps = {
  className?: string;
};

/** Compact centered spinner on a `backgroundElement` surface — for inline
 * section-level loading states where `FullPageLoader`'s `flex-1` would
 * collapse to zero height (see docs/UI_PATTERNS.md §2). Currently only used
 * by the student dashboard's local `SectionState`; extract `SectionState`
 * itself (still a separate, open ROADMAP item) only when a second screen
 * needs its error/empty branches too. */
export function InlineLoader({ className = 'items-center rounded-card p-6' }: InlineLoaderProps) {
  return (
    <ThemedView type="backgroundElement" className={className}>
      <ActivityIndicator />
    </ThemedView>
  );
}
