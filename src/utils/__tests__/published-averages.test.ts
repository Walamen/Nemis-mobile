import { describe, expect, it } from '@jest/globals';

import type { ReportCardPayload } from '@/types/grades';
import {
  cardSubjectTermAverage,
  cardTermAverage,
  EXCELLENT_AVERAGE,
  excellentPerformanceMessage,
  latestPublishedResult,
  letterGradeFor,
} from '@/utils/report-card';

/**
 * Regression fixture for the QA findings: the test student's card as the
 * school issued it (web SIS report card) — Period 1 published, Biology 96,
 * Chemistry 94, Economics 91, Geography 77, Overall 89.5.
 *
 * Biology's 96 is the period total of its assessments (#1: 9, Test: 60,
 * #2: 13, Quiz: 14 → 96); the server stores it as the period-level grade and
 * the report card reads that (`periodScores`, report-card-payload.ts).
 */
const cell = (value: number | null) => ({
  value,
  source: 'LOCAL' as const,
  sourceSchoolName: null,
});
const subject = (subjectId: string, name: string, p1: number) => ({
  subjectId,
  name,
  code: subjectId.toUpperCase(),
  cells: {
    'gp:p1': cell(p1),
    'gp:p2': cell(null),
    'gp:exam1': cell(null),
    'term:t1': cell(p1),
    year: cell(p1),
  },
});
const column = (
  key: string,
  kind: 'PERIOD' | 'TERM_AVERAGE' | 'YEARLY_AVERAGE',
  label: string,
  gradingPeriodId: string | null,
  periodType: 'REGULAR_PERIOD' | 'FINAL_EXAM' | null = null,
) => ({
  key,
  kind,
  label,
  termId: kind === 'YEARLY_AVERAGE' ? null : 't1',
  gradingPeriodId,
  periodType,
  code: null,
  sequence: 1,
});

const card: ReportCardPayload = {
  schemaVersion: 1,
  kind: 'PERIOD',
  issuedForPeriod: { id: 'p1', name: 'Period 1' },
  school: { id: 's', name: 'DaiMass School of Excellency', principalName: 'Salome T Gebeor' },
  student: {
    id: 'st',
    nemisId: '815421903536',
    firstName: 'Thompson',
    middleName: 'N',
    lastName: 'Daiminah',
  },
  class: { id: 'c', name: '10 Science', gradeLevel: 'GRADE_10' },
  academicYear: { id: 'y', name: '2026/2027' },
  terms: [{ id: 't1', name: 'First Term', sequence: 1 }],
  columns: [
    column('gp:p1', 'PERIOD', 'Period 1', 'p1', 'REGULAR_PERIOD'),
    column('gp:p2', 'PERIOD', 'Period 2', 'p2', 'REGULAR_PERIOD'),
    column('gp:exam1', 'PERIOD', 'First Term Exam', 'exam1', 'FINAL_EXAM'),
    column('term:t1', 'TERM_AVERAGE', 'First Term', null),
    column('year', 'YEARLY_AVERAGE', 'Yearly', null),
  ],
  subjects: [
    subject('bio', 'Biology', 96),
    subject('chem', 'Chemistry', 94),
    subject('econ', 'Economics', 91),
    subject('geo', 'Geography', 77),
  ],
  overall: { 'gp:p1': 89.5, 'gp:p2': null, 'gp:exam1': null, 'term:t1': 89.5, year: 89.5 },
  attendance: { present: 0, absent: 0, late: 0, excused: 0, sick: 0, carriedDays: 0 },
  passMark: 70,
  outcome: null,
  principalRemark: null,
};

// The server's DEFAULT_GRADE_SCALE (grading/services/grading-rules.ts).
const scale = [
  { min: 90, max: 100, letter: 'A' },
  { min: 80, max: 89, letter: 'B' },
  { min: 70, max: 79, letter: 'C' },
  { min: 60, max: 69, letter: 'D' },
  { min: 0, max: 59, letter: 'F' },
];

/**
 * What `GET /grades/student/me/results` did with the same data: averaged
 * every published row in the term — the period total plus 12 individual
 * assessment rows the server sends with no percentage (read as 0).
 */
function brokenResultsAverage(periodTotal: number, assessmentRows: number): number {
  const rows = [periodTotal, ...Array<number>(assessmentRows).fill(0)];
  return Math.round((rows.reduce((a, b) => a + b, 0) / rows.length) * 10) / 10;
}

describe('the bug these fixes replace (documented, not used by the app)', () => {
  it('reproduces the 7.4% (F) Biology and 6.9% profile figures from QA', () => {
    const subjects = [96, 94, 91, 77].map((total) => brokenResultsAverage(total, 12));
    expect(subjects[0]).toBe(7.4);
    const overall = subjects.reduce((a, b) => a + b, 0) / subjects.length;
    expect(Math.round(overall * 10) / 10).toBe(6.9);
  });
});

describe('Issue 1 — term average (Grades screen, Academics tile)', () => {
  it("reads the term's overall average from the report card", () => {
    expect(cardTermAverage(card, 't1')).toBe(89.5);
  });

  it('is null for a term the card does not cover — never a made-up number', () => {
    expect(cardTermAverage(card, 'other-term')).toBeNull();
    expect(cardTermAverage(undefined, 't1')).toBeNull();
  });
});

describe('Issue 2 — Biology First Period regression', () => {
  it('shows 96 (A), the period total of 9 + 60 + 13 + 14, not 7.4% (F)', () => {
    const biology = cardSubjectTermAverage(card, 'bio', 't1');
    expect(biology).toBe(96);
    expect(9 + 60 + 13 + 14).toBe(biology);
    expect(letterGradeFor(biology!, scale)).toBe('A');
  });

  it('keeps every subject on its own row', () => {
    expect(cardSubjectTermAverage(card, 'geo', 't1')).toBe(77);
    expect(letterGradeFor(77, scale)).toBe('C');
    expect(cardSubjectTermAverage(card, 'missing', 't1')).toBeNull();
  });
});

describe('Issue 5 — My Profile average', () => {
  it('is the First Period overall, 89.5%', () => {
    expect(latestPublishedResult(card)).toEqual({ label: 'Period 1', average: 89.5 });
  });

  it('moves to the newest published period when the school publishes it', () => {
    const period2: ReportCardPayload = {
      ...card,
      issuedForPeriod: { id: 'p2', name: 'Period 2' },
      overall: { ...card.overall, 'gp:p2': 84.25 },
    };
    expect(latestPublishedResult(period2)).toEqual({ label: 'Period 2', average: 84.25 });
  });

  it('names an exam when the latest published column is an exam', () => {
    const exam: ReportCardPayload = {
      ...card,
      issuedForPeriod: { id: 'exam1', name: 'First Term Exam' },
      overall: { ...card.overall, 'gp:exam1': 91 },
    };
    expect(latestPublishedResult(exam)).toEqual({ label: 'First Term Exam', average: 91 });
  });

  it('uses the yearly average on a final card', () => {
    const final: ReportCardPayload = { ...card, kind: 'FINAL', issuedForPeriod: null };
    expect(latestPublishedResult(final)).toEqual({ label: 'the year', average: 89.5 });
  });

  it('is null with no card', () => {
    expect(latestPublishedResult(undefined)).toBeNull();
  });
});

describe('Issue 4 — Excellent Performance', () => {
  it("keeps the server's own cut-off: GPA 3.5 of 4.0 = 87.5%", () => {
    expect(EXCELLENT_AVERAGE).toBe((3.5 / 4.0) * 100);
  });

  it('names the published period instead of quoting a GPA', () => {
    const message = excellentPerformanceMessage({ label: 'Period 1', average: 89.5 });
    expect(message).toBe('You averaged 89.5% in Period 1. Keep up the great work!');
    expect(message).not.toMatch(/GPA/);
  });

  it('includes the cut-off itself and stays silent below it', () => {
    expect(excellentPerformanceMessage({ label: 'Period 1', average: 87.5 })).not.toBeNull();
    expect(excellentPerformanceMessage({ label: 'Period 1', average: 87.4 })).toBeNull();
  });
});
