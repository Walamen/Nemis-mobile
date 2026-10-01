import { describe, expect, it } from '@jest/globals';

import type { Assignment, AssignmentSubmission } from '@/types/tasks';
import {
  canSubmit,
  getNextDue,
  getSubmissionAvailability,
  getSubmissionStatus,
  isDueThisWeek,
  isOverdue,
  isTurnedIn,
  matchesAssignmentFilter,
} from '@/utils/assignments';

const NOW = Date.parse('2026-10-01T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

function iso(offsetDays: number): string {
  return new Date(NOW + offsetDays * DAY).toISOString();
}

function submission(status: AssignmentSubmission['status']): AssignmentSubmission {
  return { id: 'sub-1', submittedAt: iso(-1), status };
}

function assignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'a-1',
    title: 'Presentation: Water cycle',
    classId: 'class-1',
    className: 'Grade 10A',
    subjectName: 'Science',
    teacherName: 'J. Doe',
    type: 'HOMEWORK',
    dueDate: iso(3),
    status: 'ACTIVE',
    createdAt: iso(-5),
    mySubmission: null,
    ...overrides,
  };
}

describe('submission status', () => {
  it('treats no submission row as PENDING', () => {
    expect(getSubmissionStatus(assignment())).toBe('PENDING');
    expect(isTurnedIn(assignment())).toBe(false);
  });

  it('counts SUBMITTED, LATE and GRADED as turned in; MISSING is not', () => {
    for (const status of ['SUBMITTED', 'LATE', 'GRADED'] as const) {
      expect(isTurnedIn(assignment({ mySubmission: submission(status) }))).toBe(true);
    }
    expect(isTurnedIn(assignment({ mySubmission: submission('MISSING') }))).toBe(false);
  });
});

describe('filters', () => {
  const pending = assignment();
  const missing = assignment({ mySubmission: submission('MISSING') });
  const late = assignment({ mySubmission: submission('LATE') });
  const graded = assignment({ mySubmission: submission('GRADED') });

  it('puts pending and missing work under Due', () => {
    expect(matchesAssignmentFilter(pending, 'due')).toBe(true);
    expect(matchesAssignmentFilter(missing, 'due')).toBe(true);
    expect(matchesAssignmentFilter(late, 'due')).toBe(false);
  });

  it('separates submitted (incl. late) from graded', () => {
    expect(matchesAssignmentFilter(late, 'submitted')).toBe(true);
    expect(matchesAssignmentFilter(graded, 'submitted')).toBe(false);
    expect(matchesAssignmentFilter(graded, 'graded')).toBe(true);
  });
});

describe('due this week vs overdue', () => {
  it('counts upcoming work due within 7 days, excluding overdue', () => {
    expect(isDueThisWeek(assignment({ dueDate: iso(3) }), NOW)).toBe(true);
    expect(isDueThisWeek(assignment({ dueDate: iso(8) }), NOW)).toBe(false);
    expect(isDueThisWeek(assignment({ dueDate: iso(-1) }), NOW)).toBe(false);
  });

  it('marks unsubmitted past-due work overdue, but not handed-in work', () => {
    expect(isOverdue(assignment({ dueDate: iso(-1) }), NOW)).toBe(true);
    expect(isOverdue(assignment({ dueDate: iso(-1), mySubmission: submission('LATE') }), NOW)).toBe(
      false,
    );
  });

  it('picks the earliest unsubmitted assignment as next due', () => {
    const soon = assignment({ id: 'soon', dueDate: iso(1) });
    const later = assignment({ id: 'later', dueDate: iso(5) });
    const done = assignment({ id: 'done', dueDate: iso(0), mySubmission: submission('SUBMITTED') });
    expect(getNextDue([later, done, soon])?.id).toBe('soon');
    expect(getNextDue([done])).toBeUndefined();
  });
});

describe('getSubmissionAvailability (web Student Portal rules)', () => {
  it('is open before submitting, even past due (server records LATE)', () => {
    expect(getSubmissionAvailability(assignment(), NOW)).toBe('open');
    expect(getSubmissionAvailability(assignment({ dueDate: iso(-2) }), NOW)).toBe('open');
  });

  it('is closed when the teacher closed it before anything was handed in', () => {
    expect(getSubmissionAvailability(assignment({ status: 'CLOSED' }), NOW)).toBe('closed');
  });

  it('allows resubmission while not graded, closed or past due', () => {
    const submitted = assignment({ mySubmission: submission('SUBMITTED') });
    expect(getSubmissionAvailability(submitted, NOW)).toBe('resubmittable');
  });

  it('locks a handed-in submission once past due or closed', () => {
    const pastDue = assignment({ dueDate: iso(-1), mySubmission: submission('SUBMITTED') });
    const closed = assignment({ status: 'CLOSED', mySubmission: submission('LATE') });
    expect(getSubmissionAvailability(pastDue, NOW)).toBe('locked');
    expect(getSubmissionAvailability(closed, NOW)).toBe('locked');
  });

  it('never allows changes once graded', () => {
    const graded = assignment({ mySubmission: submission('GRADED') });
    expect(getSubmissionAvailability(graded, NOW)).toBe('graded');
    expect(canSubmit(graded, NOW)).toBe(false);
  });

  it('canSubmit is true only for open and resubmittable', () => {
    expect(canSubmit(assignment(), NOW)).toBe(true);
    expect(canSubmit(assignment({ mySubmission: submission('SUBMITTED') }), NOW)).toBe(true);
    expect(canSubmit(assignment({ status: 'CLOSED' }), NOW)).toBe(false);
  });
});
