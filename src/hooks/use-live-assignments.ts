import { useFocusEffect, useIsFocused } from 'expo-router';
import { useCallback } from 'react';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetAssignmentsQuery } from '@/api/tasks/assignments-api';
import { isStale } from '@/utils/freshness';

/** Background poll while an assignments screen is in view. */
export const ASSIGNMENTS_POLL_INTERVAL_MS = 60_000;
/** Returning to an assignments screen refetches data older than this. */
export const ASSIGNMENTS_STALE_AFTER_MS = 30_000;

/**
 * The student's assignments, kept fresh while a screen showing them is
 * focused. Three layers, cheapest first:
 *
 * 1. Real-time: `useRealtimeSync` invalidates `Assignments` when an
 *    `ASSIGNMENT_POSTED` socket event arrives (teacher creates an ACTIVE
 *    assignment).
 * 2. Focus: tab screens stay mounted, so their query never re-runs on its own
 *    — returning to the screen refetches if the data is over 30s old.
 * 3. Polling: every 60s, only while focused and the app is foregrounded
 *    (`skipPollingIfUnfocused`). Covers changes the server sends no event for
 *    — publishing a draft, edits, grading.
 *
 * Refetches keep the previous data (and the screen's filters, which are local
 * state) — a failed background refresh never blanks the list.
 */
export function useLiveAssignments() {
  const isFocused = useIsFocused();
  const query = useGetAssignmentsQuery(undefined, {
    pollingInterval: isFocused ? ASSIGNMENTS_POLL_INTERVAL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  const { refetch, fulfilledTimeStamp } = query;

  useFocusEffect(
    useCallback(() => {
      if (isStale(fulfilledTimeStamp, Date.now(), ASSIGNMENTS_STALE_AFTER_MS)) {
        refetch();
      }
    }, [refetch, fulfilledTimeStamp]),
  );

  return query;
}

/**
 * The parent-side twin of `useLiveAssignments` for one child: the same
 * focus refetch and in-view polling. The server sends parents no
 * assignment event, so those two layers are what keep the list current;
 * the `Assignments` tag still picks up any invalidation that does arrive.
 * Pass `null` while no child is selected (the query is skipped).
 */
export function useLiveChildAssignments(childId: string | null) {
  const isFocused = useIsFocused();
  const query = useGetChildAssignmentsQuery(childId ?? '', {
    skip: !childId,
    pollingInterval: isFocused ? ASSIGNMENTS_POLL_INTERVAL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  const { refetch, fulfilledTimeStamp, isUninitialized } = query;

  useFocusEffect(
    useCallback(() => {
      if (!isUninitialized && isStale(fulfilledTimeStamp, Date.now(), ASSIGNMENTS_STALE_AFTER_MS)) {
        refetch();
      }
    }, [refetch, fulfilledTimeStamp, isUninitialized]),
  );

  return query;
}
