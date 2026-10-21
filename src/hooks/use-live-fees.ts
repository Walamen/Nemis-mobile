import { useIsFocused } from 'expo-router';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { useGetChildFeeRulesStatusQuery } from '@/api/parent/fees-api';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';

/** Background poll while a fees screen is in view. */
export const FEES_POLL_INTERVAL_MS = 60_000;
/** Returning to a fees screen refetches data older than this. */
export const FEES_STALE_AFTER_MS = 30_000;

/**
 * The student's fee status, kept fresh while a screen showing it is focused —
 * the same layers as `useLiveAssignments`:
 *
 * 1. Real-time: `useRealtimeSync` invalidates `Fees` when a fee notification
 *    (`FEE_PAYMENT_DUE` / `FEE_PAYMENT_REMINDER`) arrives.
 * 2. Focus: returning to the screen refetches data over 30s old.
 * 3. Polling: every 60s while focused. The server sends no event when a
 *    payment is recorded, so this is what picks up new payments.
 */
export function useLiveFeeRulesStatus() {
  const isFocused = useIsFocused();
  const query = useGetFeeRulesStatusQuery(undefined, {
    pollingInterval: isFocused ? FEES_POLL_INTERVAL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  useRefetchOnFocus(query, FEES_STALE_AFTER_MS);
  return query;
}

/**
 * The parent-side twin of `useLiveFeeRulesStatus` for one child. Pass `null`
 * while no child is selected (the query is skipped).
 */
export function useLiveChildFeeRulesStatus(childId: string | null) {
  const isFocused = useIsFocused();
  const query = useGetChildFeeRulesStatusQuery(childId ?? '', {
    skip: !childId,
    pollingInterval: isFocused ? FEES_POLL_INTERVAL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  useRefetchOnFocus(query, FEES_STALE_AFTER_MS);
  return query;
}
