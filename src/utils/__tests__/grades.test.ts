import { describe, expect, it } from '@jest/globals';

import type { TermResult } from '@/types/grades';
import { formatGpa, getCurrentTerm, getTermAverage, getTermGpa } from '@/utils/grades';

type Averages = TermResult['termAverages'];

function term(id: string, termAverages: Averages, gpa: number): TermResult {
  return {
    termId: id,
    termName: id,
    academicYear: '2025/2026',
    className: 'Grade 10A',
    published: true,
    gpa,
    totalStudents: 30,
    gradingPeriods: [],
    termAverages,
  };
}

function subject(subjectId: string, average: number, letterGrade = 'B'): Averages[number] {
  return { subjectId, subjectName: subjectId, subjectCode: subjectId, average, letterGrade };
}

// Shaped like `GET /grades/student/me/results`: newest term first. `gpa` is
// the server's own value (mean of subject averages / 25, rounded to 2dp).
const term2 = term('Term 2', [subject('MATH', 92), subject('ENG', 78), subject('SCI', 85)], 3.4);
const term1 = term('Term 1', [subject('MATH', 60), subject('ENG', 70)], 2.6);

describe('getCurrentTerm', () => {
  it('picks the first (most recent) term the API returns, not the last', () => {
    expect(getCurrentTerm([term2, term1])).toBe(term2);
  });

  it('handles a single term', () => {
    expect(getCurrentTerm([term1])).toBe(term1);
  });

  it('is undefined with no results', () => {
    expect(getCurrentTerm([])).toBeUndefined();
    expect(getCurrentTerm(undefined)).toBeUndefined();
  });
});

describe('getTermAverage', () => {
  it('is the mean of the subject averages', () => {
    expect(getTermAverage(term2)).toBeCloseTo((92 + 78 + 85) / 3, 10);
  });

  it('keeps terms separate — no leakage between terms', () => {
    expect(getTermAverage(term1)).toBe(65);
  });

  it('is undefined (not 0) for an empty term or no term', () => {
    expect(getTermAverage(term('Empty', [], 0))).toBeUndefined();
    expect(getTermAverage(undefined)).toBeUndefined();
  });

  it('skips non-finite averages instead of producing NaN', () => {
    const withBad = term('Bad', [subject('MATH', 80), subject('ENG', Number.NaN)], 3.2);
    expect(getTermAverage(withBad)).toBe(80);
  });
});

describe('getTermGpa', () => {
  it("returns the server's published term GPA unchanged", () => {
    expect(getTermGpa(term2)).toBe(3.4);
    expect(getTermGpa(term1)).toBe(2.6);
  });

  it('treats a term with no subject averages as "no GPA", not 0.00', () => {
    // The server sends gpa: 0 for such a term.
    expect(getTermGpa(term('Empty', [], 0))).toBeUndefined();
  });

  it('is undefined for missing or invalid values', () => {
    expect(getTermGpa(undefined)).toBeUndefined();
    expect(getTermGpa(term('Bad', [subject('MATH', 80)], Number.NaN))).toBeUndefined();
  });

  it('keeps a real 0.00 GPA when the term has results', () => {
    expect(getTermGpa(term('Failing', [subject('MATH', 0, 'F')], 0))).toBe(0);
  });
});

describe('formatGpa', () => {
  it('always shows two decimals', () => {
    expect(formatGpa(3)).toBe('3.00');
    expect(formatGpa(3.4)).toBe('3.40');
    expect(formatGpa(2.456)).toBe('2.46');
  });
});
