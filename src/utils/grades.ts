import type { TermResult } from '@/types/grades';

/**
 * The most recent term with published results. `GET
 * /grades/student/me/results` returns terms ordered by term start date,
 * newest first (`GradesService` orders grades by `term.startDate desc` and
 * groups them in that order) — so it's the *first* element. Screens used to
 * take the last one, which showed the oldest term once a student had more
 * than one.
 */
export function getCurrentTerm(terms: readonly TermResult[] | undefined): TermResult | undefined {
  return terms?.[0];
}

/**
 * Mean of the term's per-subject averages (each already a 0–100 percentage
 * from the server), or `undefined` when there are none — never a misleading
 * 0. Non-finite values are skipped rather than poisoning the mean.
 */
export function getTermAverage(term: TermResult | undefined): number | undefined {
  const averages = (term?.termAverages ?? [])
    .map((subject) => subject.average)
    .filter((average) => Number.isFinite(average));
  if (averages.length === 0) return undefined;
  return averages.reduce((sum, average) => sum + average, 0) / averages.length;
}

/**
 * The term's GPA as published by the server (`TermResult.gpa`), or
 * `undefined` when the term has no subject averages — the server sends `0`
 * for an empty term, which would read as a real failing GPA.
 */
export function getTermGpa(term: TermResult | undefined): number | undefined {
  if (!term || term.termAverages.length === 0 || !Number.isFinite(term.gpa)) return undefined;
  return term.gpa;
}

export function formatGpa(gpa: number): string {
  return gpa.toFixed(2);
}
