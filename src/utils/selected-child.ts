/**
 * Which child is active: the stored selection if it belongs to this parent's
 * children, otherwise the first child, otherwise none. A stored id that
 * isn't in the list (e.g. left in Redux from a previous parent's session on
 * the same device — the slice survives `resetApiState`) is never used.
 */
export function resolveSelectedChildId(
  storedId: string | null,
  childIds: readonly string[],
): string | null {
  if (storedId && childIds.includes(storedId)) return storedId;
  return childIds[0] ?? null;
}

type ChildQueryResult = {
  currentData?: unknown;
  isLoading: boolean;
  isFetching: boolean;
};

/**
 * Narrows a child-scoped RTK Query result to the selected child. RTK Query's
 * `data` is the last result for *any* argument, so right after switching
 * child it still holds the previous child's fees/grades — and keeps holding
 * them if the new child's request fails. `currentData` is only ever the
 * selected child's, and while it's missing the screen shows its loading state
 * instead of the previous child's figures.
 */
export function forSelectedChild<R extends ChildQueryResult>(
  result: R,
): Omit<R, 'data' | 'isLoading'> & { data: R['currentData']; isLoading: boolean } {
  return {
    ...result,
    data: result.currentData,
    isLoading: result.currentData === undefined && (result.isLoading || result.isFetching),
  };
}
