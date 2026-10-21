import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { isStale } from '@/utils/freshness';

type RefetchableQuery = {
  refetch: () => unknown;
  fulfilledTimeStamp?: number;
  /** True while the query is skipped (e.g. no child selected yet). */
  isUninitialized: boolean;
};

/**
 * Refetches a query when its screen regains focus, if its data is older than
 * `staleAfterMs`. Tab screens stay mounted, so without this a screen keeps
 * showing what it loaded the first time it opened — e.g. a fee payment the
 * school recorded since only appeared after restarting the app. Shared by the
 * live assignments and live fees hooks so they refresh the same way.
 */
export function useRefetchOnFocus(
  { refetch, fulfilledTimeStamp, isUninitialized }: RefetchableQuery,
  staleAfterMs: number,
) {
  useFocusEffect(
    useCallback(() => {
      if (!isUninitialized && isStale(fulfilledTimeStamp, Date.now(), staleAfterMs)) {
        refetch();
      }
    }, [refetch, fulfilledTimeStamp, isUninitialized, staleAfterMs]),
  );
}
