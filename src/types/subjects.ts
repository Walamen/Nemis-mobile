export type SubjectTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
};

export type SubjectScheduleEntry = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
};

export type SubjectRecentAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
};

export type SubjectListItem = {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacher: SubjectTeacher;
  performance: {
    currentGrade: number;
    letterGrade: string;
    trend: 'up' | 'down' | 'stable';
  };
  assignments: {
    total: number;
    pending: number;
    completed: number;
    averageScore?: number;
  };
  attendance: {
    totalClasses: number;
    attended: number;
    rate: number;
  };
  schedule: SubjectScheduleEntry[];
  recentAssignments: SubjectRecentAssignment[];
};

export type SubjectsResponse = {
  subjects: SubjectListItem[];
  summary: {
    totalSubjects: number;
    averageGrade: number;
    overallAttendance: number;
  };
};

export type SubjectGradeHistoryEntry = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
};

export type SubjectAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'missing';
  grade?: number;
  totalMarks?: number;
  feedback?: string;
};

export type SubjectAttendanceRecord = {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
};

export type SubjectDetail = SubjectListItem & {
  className: string;
  gradeHistory: SubjectGradeHistoryEntry[];
  allAssignments: SubjectAssignment[];
  attendanceRecords: SubjectAttendanceRecord[];
};
