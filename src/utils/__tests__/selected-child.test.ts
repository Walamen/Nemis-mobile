import { describe, expect, it } from '@jest/globals';

import { resolveSelectedChildId } from '@/utils/selected-child';

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
