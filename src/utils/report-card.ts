import type { ReportCardOutcome, ReportCardPayload, ReportCardYear } from '@/types/grades';

/**
 * Wording for the stored report card, matching the web SIS report card
 * (`apps/SIS/src/components/report-card/ReportCardView.tsx` and
 * `lib/reportCardYears.ts`) so both show the same text for the same card.
 */

/** "GRADE_10" → "Grade 10"; anything else is title-cased word by word. */
export function formatGradeLevel(gradeLevel: string): string {
  return gradeLevel
    .split('_')
    .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

export function outcomeText(outcome: ReportCardOutcome, gradeLevel: string): string {
  switch (outcome.status) {
    case 'PROMOTED':
      return outcome.nextGradeLevel
        ? `Promoted to ${formatGradeLevel(outcome.nextGradeLevel)}`
        : 'Promoted';
    case 'RETAINED':
      return gradeLevel ? `Retained in ${formatGradeLevel(gradeLevel)}` : 'Retained';
    case 'GRADUATED':
      return 'Graduated';
    case 'WITHDRAWN':
      return 'Withdrawn';
  }
}

/** "Period report — Period 1" / "Final report". */
export function reportKindLabel(
  payload: Pick<ReportCardPayload, 'kind' | 'issuedForPeriod'>,
): string {
  const kind = payload.kind === 'FINAL' ? 'Final report' : 'Period report';
  return payload.issuedForPeriod ? `${kind} — ${payload.issuedForPeriod.name}` : kind;
}

export function studentFullName(student: ReportCardPayload['student']): string {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
}

/** A score cell or overall value: the number, or an em dash when empty. */
export function formatScore(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : String(value);
}

/** Year picker label: "2026/2027 · DaiMass School of Excellency · 10 Science". */
export function reportCardYearLabel(year: ReportCardYear): string {
  return `${year.academicYearName} · ${year.schoolName} · ${year.className}`;
}

type PriorRow = NonNullable<ReportCardPayload['priorSchoolRecord']>[number];

/** Marks earned at previous schools this year, grouped by school in order. */
export function priorRecordBySchool(
  rows: ReportCardPayload['priorSchoolRecord'],
): [schoolName: string, rows: PriorRow[]][] {
  const groups = new Map<string, PriorRow[]>();
  for (const row of rows ?? []) {
    const list = groups.get(row.schoolName) ?? [];
    list.push(row);
    groups.set(row.schoolName, list);
  }
  return [...groups.entries()];
}

export type SubjectStanding = {
  /** The subject's latest published term average (the "current grade"). */
  average: number;
  /** Which term it's for, e.g. "First Term". */
  termName: string;
  /** Against the previous term's average — same ±5 point rule as the server. */
  trend: 'up' | 'down' | 'stable';
};

/**
 * A subject's current grade from the published report card: its newest
 * term-average cell with a value. The subject screen's own server figure
 * also counts unpublished (draft) marks and uses a different formula, so it
 * could show marks early and disagree with the report card — this can't.
 */
export function subjectStanding(
  payload: ReportCardPayload | undefined,
  subjectId: string,
): SubjectStanding | null {
  const subject = payload?.subjects.find((s) => s.subjectId === subjectId);
  if (!payload || !subject) return null;
  const termAverages = payload.columns
    .filter((column) => column.kind === 'TERM_AVERAGE')
    .map((column) => ({ label: column.label, value: subject.cells[column.key]?.value }))
    .filter((entry): entry is { label: string; value: number } => typeof entry.value === 'number');
  const current = termAverages.at(-1);
  if (!current) return null;
  const previous = termAverages.at(-2);
  const trend =
    previous && current.value > previous.value + 5
      ? 'up'
      : previous && current.value < previous.value - 5
        ? 'down'
        : 'stable';
  return { average: current.value, termName: current.label, trend };
}

/**
 * The school's letter for a score, from its grading scale (`/grading-config`).
 * Mirrors the server's official `bandFor` (`grading/services/grading-rules.ts`):
 * the highest band whose `min` the score reaches — no rounding, so 89.6 is
 * still a B on an 80–89 band, exactly as the server grades it.
 */
export function letterGradeFor(
  value: number,
  scale: readonly { min: number; max: number; letter: string }[],
): string | undefined {
  const sorted = [...scale].sort((a, b) => b.min - a.min);
  return (sorted.find((band) => value >= band.min) ?? sorted.at(-1))?.letter;
}

/**
 * Score shown when a school marks performance as excellent: the server's own
 * "Excellent Performance" rule is a 4-point GPA of 3.5 or more, and its GPA is
 * a straight percentage × 4 ÷ 100 — so 3.5 is exactly 87.5% (see
 * `StudentPortalService.getDashboard`). Kept identical, only expressed as the
 * percentage the app now shows instead of GPA.
 */
export const EXCELLENT_AVERAGE = 87.5;

export type PublishedResult = {
  /** The period or exam it's for, e.g. "Period 1", "First Term Exam"; "the year" on a final card. */
  label: string;
  /** Overall average across subjects for that period, as on the report card. */
  average: number;
};

/**
 * The latest published result on the report card: the overall average for
 * the period (or exam) the card was issued for — the column a school just
 * published. A final card reports the yearly average. Read straight from the
 * card's own `overall` row (the server's official averages), never
 * recomputed.
 */
export function latestPublishedResult(
  payload: ReportCardPayload | undefined,
): PublishedResult | null {
  if (!payload) return null;
  if (payload.kind === 'FINAL') {
    const yearly = payload.overall.year;
    return typeof yearly === 'number' ? { label: 'the year', average: yearly } : null;
  }
  const issued = payload.issuedForPeriod;
  const periodColumns = payload.columns.filter((column) => column.kind === 'PERIOD');
  const column =
    (issued && periodColumns.find((c) => c.gradingPeriodId === issued.id)) ??
    // Fallback: the newest period column with an overall value.
    [...periodColumns].reverse().find((c) => typeof payload.overall[c.key] === 'number');
  const average = column ? payload.overall[column.key] : null;
  return column && typeof average === 'number'
    ? { label: issued?.name ?? column.label, average }
    : null;
}

/** A term's overall average on the report card, or null when the card has none for it. */
export function cardTermAverage(
  payload: ReportCardPayload | undefined,
  termId: string,
): number | null {
  const value = payload?.overall[`term:${termId}`];
  return typeof value === 'number' ? value : null;
}

/** One subject's term average on the report card, or null. */
export function cardSubjectTermAverage(
  payload: ReportCardPayload | undefined,
  subjectId: string,
  termId: string,
): number | null {
  const value = payload?.subjects.find((s) => s.subjectId === subjectId)?.cells[`term:${termId}`]
    ?.value;
  return typeof value === 'number' ? value : null;
}

/** "You averaged 89.5% in Period 1." — the Home screen's Excellent Performance alert. */
export function excellentPerformanceMessage(result: PublishedResult): string | null {
  if (result.average < EXCELLENT_AVERAGE) return null;
  return `You averaged ${result.average}% in ${result.label}. Keep up the great work!`;
}
