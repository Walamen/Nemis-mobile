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
