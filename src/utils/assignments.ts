import type { Assignment, AssignmentSubmission } from '@/types/tasks';

export type SubmissionStatus = AssignmentSubmission['status'];
export type AssignmentFilter = 'due' | 'submitted' | 'graded';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** No submission row yet means the student hasn't submitted. */
export function getSubmissionStatus(assignment: Assignment): SubmissionStatus {
  return assignment.mySubmission?.status ?? 'PENDING';
}

/** Still waiting on the student — not submitted, or marked missing. */
export function isAwaitingSubmission(assignment: Assignment): boolean {
  const status = getSubmissionStatus(assignment);
  return status === 'PENDING' || status === 'MISSING';
}

/** Handed in (on time or late), whether or not it's been graded yet. */
export function isTurnedIn(assignment: Assignment): boolean {
  return !isAwaitingSubmission(assignment);
}

export function isOverdue(assignment: Assignment, now: number): boolean {
  return isAwaitingSubmission(assignment) && new Date(assignment.dueDate).getTime() < now;
}

/** Awaiting submission and due within the next 7 days — excludes overdue. */
export function isDueThisWeek(assignment: Assignment, now: number): boolean {
  if (!isAwaitingSubmission(assignment)) return false;
  const due = new Date(assignment.dueDate).getTime();
  return due >= now && due - now <= WEEK_MS;
}

/**
 * The server accepts resubmission (it upserts the student's submission), but
 * doing so after grading would overwrite the GRADED status — so a graded
 * assignment is read-only here.
 */
export function canSubmit(assignment: Assignment): boolean {
  return getSubmissionStatus(assignment) !== 'GRADED';
}

export function matchesAssignmentFilter(assignment: Assignment, filter: AssignmentFilter): boolean {
  const status = getSubmissionStatus(assignment);
  if (filter === 'due') return isAwaitingSubmission(assignment);
  if (filter === 'graded') return status === 'GRADED';
  return status === 'SUBMITTED' || status === 'LATE';
}

/** Earliest-due assignment still awaiting submission (overdue ones first). */
export function getNextDue(assignments: Assignment[]): Assignment | undefined {
  return assignments
    .filter(isAwaitingSubmission)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
}
