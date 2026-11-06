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

/** The school's letter for a score, from its grading scale (`/grading-config`). */
export function letterGradeFor(
  value: number,
  scale: readonly { min: number; max: number; letter: string }[],
): string | undefined {
  const rounded = Math.round(value);
  return scale.find((item) => rounded >= item.min && rounded <= item.max)?.letter;
}
