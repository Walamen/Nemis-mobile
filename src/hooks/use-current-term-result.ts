import { useGetResultsQuery } from '@/api/grades/grades-api';
import { getCurrentTerm, getTermAverage, getTermGpa } from '@/utils/grades';

/**
 * The student's current (most recent published) term result — the single
 * source for GPA on every student screen (Home, My profile, Academics,
 * Grades), so they can't disagree.
 *
 * Deliberately *not* `dashboard.currentGPA`: that value is computed by a
 * different server formula over *all* of the current term's grades,
 * including unpublished drafts, while this one uses published grades only —
 * the same data the Grades screen shows.
 */
export function useCurrentTermResult() {
  const query = useGetResultsQuery();
  const term = getCurrentTerm(query.data);
  return {
    ...query,
    term,
    gpa: getTermGpa(term),
    average: getTermAverage(term),
  };
}
