import { describe, expect, it } from '@jest/globals';

import {
  formatGradeLevel,
  formatScore,
  letterGradeFor,
  outcomeText,
  priorRecordBySchool,
  reportKindLabel,
  studentFullName,
  subjectStanding,
} from '@/utils/report-card';

describe('report card wording (matches the web SIS)', () => {
  it('formats grade levels', () => {
    expect(formatGradeLevel('GRADE_10')).toBe('Grade 10');
    expect(formatGradeLevel('KINDERGARTEN')).toBe('Kindergarten');
  });

  it('labels the report kind with its period', () => {
    expect(
      reportKindLabel({ kind: 'PERIOD', issuedForPeriod: { id: 'p1', name: 'Period 1' } }),
    ).toBe('Period report — Period 1');
    expect(reportKindLabel({ kind: 'FINAL', issuedForPeriod: null })).toBe('Final report');
  });

  it('describes the end-of-year outcome', () => {
    const base = { nextGradeLevel: null, yearlyAverage: 80 };
    expect(
      outcomeText({ ...base, status: 'PROMOTED', nextGradeLevel: 'GRADE_11' }, 'GRADE_10'),
    ).toBe('Promoted to Grade 11');
    expect(outcomeText({ ...base, status: 'RETAINED' }, 'GRADE_10')).toBe('Retained in Grade 10');
    expect(outcomeText({ ...base, status: 'GRADUATED' }, 'GRADE_12')).toBe('Graduated');
  });

  it('joins names, skipping a missing middle name', () => {
    const student = {
      id: 's',
      nemisId: '815421903536',
      firstName: 'Thompson',
      lastName: 'Daiminah',
    };
    expect(studentFullName({ ...student, middleName: 'N' })).toBe('Thompson N Daiminah');
    expect(studentFullName({ ...student, middleName: null })).toBe('Thompson Daiminah');
  });

  it('shows an em dash for empty scores', () => {
    expect(formatScore(null)).toBe('—');
    expect(formatScore(undefined)).toBe('—');
    expect(formatScore(89.5)).toBe('89.5');
    expect(formatScore(0)).toBe('0');
  });

  it('groups prior-school marks by school, in order', () => {
    const rows = [
      { schoolName: 'A', subjectName: 'Math', periodLabel: 'T1 — P1', value: 80 },
      { schoolName: 'B', subjectName: 'Math', periodLabel: 'T1 — P2', value: 70 },
      { schoolName: 'A', subjectName: 'English', periodLabel: 'T1 — P1', value: 90 },
    ];
    expect(priorRecordBySchool(rows).map(([school, list]) => [school, list.length])).toEqual([
      ['A', 2],
      ['B', 1],
    ]);
    expect(priorRecordBySchool(undefined)).toEqual([]);
  });
});

describe('subjectStanding (subject screen current grade)', () => {
  const column = (key: string, kind: 'PERIOD' | 'TERM_AVERAGE', label: string) => ({
    key,
    kind,
    label,
    termId: null,
    gradingPeriodId: null,
    periodType: null,
    code: null,
    sequence: 1,
  });
  const cell = (value: number | null) => ({
    value,
    source: 'LOCAL' as const,
    sourceSchoolName: null,
  });
  const payloadWith = (cells: Record<string, number | null>) =>
    ({
      columns: [
        column('gp:1', 'PERIOD', 'Period 1'),
        column('term:1', 'TERM_AVERAGE', 'First Term'),
        column('term:2', 'TERM_AVERAGE', 'Second Term'),
      ],
      subjects: [
        {
          subjectId: 'bio',
          name: 'Biology',
          code: 'BIO',
          cells: Object.fromEntries(Object.entries(cells).map(([k, v]) => [k, cell(v)])),
        },
      ],
    }) as unknown as Parameters<typeof subjectStanding>[0];

  it('uses the newest term average with a value', () => {
    expect(subjectStanding(payloadWith({ 'term:1': 96, 'term:2': null }), 'bio')).toEqual({
      average: 96,
      termName: 'First Term',
      trend: 'stable',
    });
  });

  it('compares with the previous term using a 5-point margin', () => {
    expect(subjectStanding(payloadWith({ 'term:1': 70, 'term:2': 80 }), 'bio')?.trend).toBe('up');
    expect(subjectStanding(payloadWith({ 'term:1': 80, 'term:2': 70 }), 'bio')?.trend).toBe('down');
    expect(subjectStanding(payloadWith({ 'term:1': 80, 'term:2': 83 }), 'bio')?.trend).toBe(
      'stable',
    );
  });

  it('is null with no published average, no card or an unknown subject', () => {
    expect(subjectStanding(payloadWith({ 'gp:1': 90 }), 'bio')).toBeNull();
    expect(subjectStanding(undefined, 'bio')).toBeNull();
    expect(subjectStanding(payloadWith({ 'term:1': 90 }), 'math')).toBeNull();
  });
});

describe('letterGradeFor', () => {
  const scale = [
    { min: 90, max: 100, letter: 'A' },
    { min: 80, max: 89, letter: 'B' },
  ];
  it("finds the school's letter, rounding to a whole score", () => {
    expect(letterGradeFor(96, scale)).toBe('A');
    expect(letterGradeFor(89.6, scale)).toBe('A');
    expect(letterGradeFor(85, scale)).toBe('B');
    expect(letterGradeFor(50, scale)).toBeUndefined();
  });
});
