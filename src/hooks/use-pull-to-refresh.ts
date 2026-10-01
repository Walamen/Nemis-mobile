import { useCallback, useState } from 'react';

/**
 * `RefreshControl` state that only reflects refreshes the user started.
 * Binding `refreshing` to a query's `isFetching` instead makes background
 * polls/focus refetches spin the pull-to-refresh indicator too.
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { refreshing, onRefresh };
}
