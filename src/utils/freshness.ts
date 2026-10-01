/**
 * Whether data fetched at `fulfilledTimeStamp` should be refetched when its
 * screen regains focus. Never-fetched data isn't "stale" — its initial
 * request is already in flight (or failed and is showing a retry), so
 * refetching would only duplicate it.
 */
export function isStale(
  fulfilledTimeStamp: number | undefined,
  now: number,
  staleAfterMs: number,
): boolean {
  return fulfilledTimeStamp != null && now - fulfilledTimeStamp > staleAfterMs;
}
