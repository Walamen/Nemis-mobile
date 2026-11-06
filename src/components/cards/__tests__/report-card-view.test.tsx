import { describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { ReportCardView } from '@/components/cards/report-card-view';
import type { ReportCardPayload } from '@/types/grades';

// The real theme/tw modules import global.css, which Jest can't parse — stub
// them (and the components built on them) with plain React Native pieces.
jest.mock('@/theme', () => ({
  Palette: { accent: '#1874a8', success: '#065808', warning: '#a6731c', error: '#d60416' },
  Fonts: { mono: 'monospace' },
}));
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#000000',
    textSecondary: '#60646C',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  }),
}));
jest.mock('@/components/typography/themed-text', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ThemedText: Text };
});
jest.mock('@/components/common/badge', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Badge: ({ label }: { label: string }) => <Text>{label}</Text> };
});

// Shaped like the web report card in the design reference (Period 1 issued).
const payload: ReportCardPayload = {
  schemaVersion: 1,
  kind: 'PERIOD',
  issuedForPeriod: { id: 'p1', name: 'Period 1' },
  school: { id: 'sch', name: 'DaiMass School of Excellency', principalName: 'Salome T Gebeor' },
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
    {
      key: 'gp:p1',
      kind: 'PERIOD',
      label: 'Period 1',
      termId: 't1',
      gradingPeriodId: 'p1',
      periodType: 'REGULAR_PERIOD',
      code: 'P1',
      sequence: 1,
    },
    {
      key: 'term:t1',
      kind: 'TERM_AVERAGE',
      label: 'First Term',
      termId: 't1',
      gradingPeriodId: null,
      periodType: null,
      code: null,
      sequence: 1,
    },
    {
      key: 'year',
      kind: 'YEARLY_AVERAGE',
      label: 'Yearly',
      termId: null,
      gradingPeriodId: null,
      periodType: null,
      code: null,
      sequence: 99,
    },
  ],
  subjects: [
    {
      subjectId: 'bio',
      name: 'Biology',
      code: 'BIO',
      cells: {
        'gp:p1': { value: 96, source: 'LOCAL', sourceSchoolName: null },
        'term:t1': { value: 96, source: 'LOCAL', sourceSchoolName: null },
        year: { value: 96, source: 'LOCAL', sourceSchoolName: null },
      },
    },
  ],
  overall: { 'gp:p1': 89.5, 'term:t1': 89.5, year: 89.5 },
  attendance: { present: 0, absent: 0, late: 0, excused: 0, sick: 0, carriedDays: 0 },
  passMark: 70,
  outcome: null,
  principalRemark: null,
};

/** Every text the view renders, including mixed children like "Pass mark: 70". */
function textOf(renderer: ReactTestRenderer): string {
  const flatten = (children: unknown): string =>
    Array.isArray(children)
      ? children.map(flatten).join('')
      : typeof children === 'string' || typeof children === 'number'
        ? String(children)
        : '';
  return renderer.root
    .findAll((node) => typeof node.type === 'string' && node.props.children !== undefined)
    .map((node) => flatten(node.props.children))
    .filter(Boolean)
    .join(' | ');
}

function render(element: React.ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  return renderer;
}

describe('ReportCardView', () => {
  it('shows the same facts, grid and footer as the web report card', () => {
    const text = textOf(render(<ReportCardView payload={payload} version={2} status="CURRENT" />));
    for (const expected of [
      'DaiMass School of Excellency',
      'Version 2',
      'Thompson N Daiminah',
      '8154-2190-3536',
      '10 Science',
      'Grade 10',
      '2026/2027',
      'Period report — Period 1',
      'PERIOD 1',
      'FIRST TERM',
      'YEARLY',
      'Biology',
      '96',
      'Overall',
      '89.5',
      'Attendance (days)',
      'Carried',
    ]) {
      expect(text).toContain(expected);
    }
    expect(text).toContain('Pass mark: 70');
  });

  it('shows the outcome and principal remark on a final card', () => {
    const text = textOf(
      render(
        <ReportCardView
          payload={{
            ...payload,
            kind: 'FINAL',
            issuedForPeriod: null,
            outcome: { status: 'PROMOTED', nextGradeLevel: 'GRADE_11', yearlyAverage: 89.5 },
            principalRemark: 'Excellent work this year.',
          }}
        />,
      ),
    );
    expect(text).toContain('Final report');
    expect(text).toContain('Promoted to Grade 11');
    expect(text).toContain('Excellent work this year.');
  });

  it('asks for an app update on an unknown card format', () => {
    const text = textOf(render(<ReportCardView payload={{ ...payload, schemaVersion: 2 }} />));
    expect(text).toContain('newer format');
  });
});
