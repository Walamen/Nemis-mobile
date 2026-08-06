export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';

export type AttendanceSummary = {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
};

export type AttendanceBySubject = {
  subjectId: string;
  subjectName: string;
  summary: AttendanceSummary;
  calendar: Record<string, { status: AttendanceStatus; reason?: string }>;
};

export type StudentAttendance = {
  summary: AttendanceSummary;
  subjects: AttendanceBySubject[];
  disputes: [];
};

export type ChildAttendance = {
  summary: AttendanceSummary;
  subjects: AttendanceBySubject[];
};
