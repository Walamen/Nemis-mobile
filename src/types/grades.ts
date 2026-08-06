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
