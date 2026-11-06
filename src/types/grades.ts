/** `GET …/report-card` — the original simplified grid, plus (newer servers)
 * the year/school fields and the full stored card in `payload`. */
export type ReportCard = {
  studentName: string;
  className: string;
  academicYear: string;
  subjects: { id: string; name: string; code: string }[];
  terms: {
    id: string;
    name: string;
    periods: { id: string; name: string; code: string; periodType: string; sequence: number }[];
  }[];
  grades: { subjectId: string; periodId: string; score: number }[];
  // Optional: an older server sends only the fields above.
  academicYearId?: string;
  kind?: 'PERIOD' | 'FINAL';
  schoolName?: string;
  outcome?: ReportCardOutcome | null;
  principalRemark?: string | null;
  /** The full card exactly as the school issued it — render this when present. */
  payload?: ReportCardPayload;
  version?: number;
  status?: 'CURRENT' | 'SUPERSEDED' | 'WITHDRAWN';
};

export type ReportCardOutcome = {
  status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' | 'WITHDRAWN';
  nextGradeLevel: string | null;
  yearlyAverage: number | null;
};

export type ReportCardColumn = {
  /** "gp:<gradingPeriodId>" | "term:<termId>" | "year" */
  key: string;
  kind: 'PERIOD' | 'TERM_AVERAGE' | 'YEARLY_AVERAGE';
  label: string;
  termId: string | null;
  gradingPeriodId: string | null;
  periodType: 'REGULAR_PERIOD' | 'MIDTERM_EXAM' | 'FINAL_EXAM' | null;
  code: string | null;
  sequence: number;
};

export type ReportCardCell = {
  value: number | null;
  /** CARRIED: earned at a previous school this year; ADMIN_AT_CLOSE: entered when the year closed. */
  source: 'LOCAL' | 'CARRIED' | 'ADMIN_AT_CLOSE';
  sourceSchoolName: string | null;
};

/** The server's frozen `ReportCardPayloadV1` — averages are already computed. */
export type ReportCardPayload = {
  schemaVersion: number;
  kind: 'PERIOD' | 'FINAL';
  issuedForPeriod: { id: string; name: string } | null;
  school: { id: string; name: string; principalName: string | null };
  student: {
    id: string;
    nemisId: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  class: { id: string; name: string; gradeLevel: string };
  academicYear: { id: string; name: string };
  terms: { id: string; name: string; sequence: number }[];
  columns: ReportCardColumn[];
  subjects: {
    subjectId: string;
    name: string;
    code: string;
    cells: Record<string, ReportCardCell>;
  }[];
  /** Per column key: mean of the subjects' values. */
  overall: Record<string, number | null>;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    sick: number;
    carriedDays: number;
  };
  passMark: number;
  /** FINAL cards only. */
  outcome: ReportCardOutcome | null;
  principalRemark: string | null;
  /** Marks from a previous school this year that fill no column here. */
  priorSchoolRecord?: {
    schoolName: string;
    subjectName: string;
    periodLabel: string;
    value: number;
  }[];
};

/** `GET …/report-card/years` — one entry per year (and school) with a card, newest first. */
export type ReportCardYear = {
  academicYearId: string;
  academicYearName: string;
  yearStatus: 'SETUP' | 'ACTIVE' | 'CLOSED' | 'REOPENED';
  schoolName: string;
  className: string;
  gradeLevel: string;
  latestKind: 'PERIOD' | 'FINAL';
};

export type TermResult = {
  termId: string;
  termName: string;
  academicYear: string;
  className: string;
  published: true;
  gpa: number;
  totalStudents: number;
  gradingPeriods: {
    periodId: string;
    periodName: string;
    periodType: string;
    subjects: {
      subjectId: string;
      subjectName: string;
      subjectCode: string;
      marksObtained: number;
      maxMarks: number;
      percentage: number;
      letterGrade: string;
      remarks: string;
    }[];
  }[];
  termAverages: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    average: number;
    letterGrade: string;
  }[];
};

export type AssessmentGrade = {
  id: string;
  assessmentId: string;
  assessmentName: string;
  assessmentDate: string;
  assessmentType: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  letterGrade: string;
  gradingPeriodId?: string;
  gradingPeriodName?: string;
  termId?: string;
  termName?: string;
  academicYear?: string;
  className?: string;
};

export type AssessmentGradesQuery = {
  termId?: string;
  gradingPeriodId?: string;
  subjectId?: string;
};

export type ChildAssessmentGrade = {
  id: string;
  title: string;
  type: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remarks: string | null;
};

export type GradeScaleItem = {
  min: number;
  max: number;
  letter: string;
  gradePoint: number;
  description: string;
};

export type GradingConfig = {
  id: string;
  maxMarks: number;
  passingMarks: number;
  gradeScale: GradeScaleItem[];
};
