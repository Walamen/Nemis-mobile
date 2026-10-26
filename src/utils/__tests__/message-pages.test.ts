import { describe, expect, it } from '@jest/globals';

import { planMessagePages } from '@/utils/message-pages';

describe('planMessagePages', () => {
  it('needs nothing more for a one-page (or empty) thread', () => {
    expect(planMessagePages(1)).toEqual({ keepFirstPage: true, extraPages: [] });
    expect(planMessagePages(0)).toEqual({ keepFirstPage: true, extraPages: [] });
  });

  it('loads every page of a thread within the cap, so the newest messages show', () => {
    expect(planMessagePages(3, 10)).toEqual({ keepFirstPage: true, extraPages: [2, 3] });
    expect(planMessagePages(10, 10)).toEqual({
      keepFirstPage: true,
      extraPages: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
  });

  it('keeps only the newest pages of a very long thread', () => {
    // 12 pages, cap 10 → pages 3–12; page 1 (already fetched) is dropped.
    expect(planMessagePages(12, 10)).toEqual({
      keepFirstPage: false,
      extraPages: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    });
  });
});
