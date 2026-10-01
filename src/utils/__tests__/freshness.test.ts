import { describe, expect, it } from '@jest/globals';

import { isStale } from '@/utils/freshness';

const STALE_AFTER = 30_000;

describe('isStale (refetch-on-focus)', () => {
  it('refetches data older than the threshold', () => {
    expect(isStale(1_000, 1_000 + STALE_AFTER + 1, STALE_AFTER)).toBe(true);
  });

  it('skips fresh data, avoiding a request on every tab switch', () => {
    expect(isStale(1_000, 1_000 + STALE_AFTER, STALE_AFTER)).toBe(false);
    expect(isStale(1_000, 1_500, STALE_AFTER)).toBe(false);
  });

  it('never duplicates the initial load (nothing fetched yet)', () => {
    expect(isStale(undefined, 999_999, STALE_AFTER)).toBe(false);
  });
});
