import { useGetReportCardQuery } from '@/api/grades/grades-api';
import { useGetChildReportCardQuery } from '@/api/parent/academics-api';
import { latestPublishedResult } from '@/utils/report-card';
import { forSelectedChild } from '@/utils/selected-child';

/**
 * The student's latest published result — the overall average for the
 * period or exam their school most recently published, from the report card.
 * The single source for the average on Home and My profile, matching the
 * report card and the web SIS.
 *
 * Deliberately *not* `GET /grades/student/me/results`: that endpoint averages
 * every published grade row in a term, and individual assessment rows arrive
 * with no percentage (counted as 0) — so a 96 in Biology read as 7.4%. The
 * report card applies the server's official rule instead (one period total
 * per subject: `periodScores` in `report-cards/report-card-payload.ts`).
 */
export function usePublishedResult() {
  const query = useGetReportCardQuery();
  return {
    ...query,
    payload: query.data?.payload,
    latest: latestPublishedResult(query.data?.payload),
  };
}

/** The parent-side twin: the selected child's latest published result. */
export function usePublishedChildResult(childId: string | null) {
  const query = forSelectedChild(
    useGetChildReportCardQuery({ childId: childId ?? '' }, { skip: !childId }),
  );
  return {
    ...query,
    payload: query.data?.payload,
    latest: latestPublishedResult(query.data?.payload),
  };
}
