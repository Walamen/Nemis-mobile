import { describe, expect, it } from '@jest/globals';

import { forSelectedChild, resolveSelectedChildId } from '@/utils/selected-child';

describe('resolveSelectedChildId', () => {
  it('keeps a stored selection that belongs to this parent', () => {
    expect(resolveSelectedChildId('child-2', ['child-1', 'child-2'])).toBe('child-2');
  });

  it('defaults to the first child when nothing is selected', () => {
    expect(resolveSelectedChildId(null, ['child-1', 'child-2'])).toBe('child-1');
  });

  it("never uses an id that isn't one of this parent's children (e.g. a previous session's)", () => {
    expect(resolveSelectedChildId('other-parents-child', ['child-1'])).toBe('child-1');
  });

  it('is null when no children are linked', () => {
    expect(resolveSelectedChildId('child-1', [])).toBeNull();
    expect(resolveSelectedChildId(null, [])).toBeNull();
  });
});

describe('forSelectedChild', () => {
  const base = { isLoading: false, isFetching: false, isError: false };

  it("never exposes the previous child's data after switching child", () => {
    // RTK Query mid-switch: `data` is still child A's, `currentData` is empty.
    const result = forSelectedChild({
      ...base,
      data: 'fees of A',
      currentData: undefined,
      isFetching: true,
    });
    expect(result.data).toBeUndefined();
    expect(result.isLoading).toBe(true);
  });

  it('surfaces a failed request for the new child instead of the old data', () => {
    const result = forSelectedChild({
      ...base,
      data: 'fees of A',
      currentData: undefined,
      isError: true,
    });
    expect(result.data).toBeUndefined();
    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(true);
  });

  it('keeps showing the current child while that child refreshes', () => {
    const result = forSelectedChild({
      ...base,
      data: 'fees of B',
      currentData: 'fees of B',
      isFetching: true,
    });
    expect(result.data).toBe('fees of B');
    expect(result.isLoading).toBe(false);
  });

  it('is not loading when the query is skipped (no child selected)', () => {
    const result = forSelectedChild({ ...base, currentData: undefined });
    expect(result.isLoading).toBe(false);
  });
});
