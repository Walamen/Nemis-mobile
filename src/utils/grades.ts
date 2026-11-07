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
