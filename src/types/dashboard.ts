export type DashboardAlert = {
  type: 'warning' | 'success';
  title: string;
  message: string;
};

export type StudentDashboard = {
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
  currentGPA?: number;
  pendingFees: number;
  unreadMessages: number;
  alerts: DashboardAlert[];
};

export type ChildSubjectGrade = {
  name: string;
  teacher: string;
  assessment: number;
  test: number;
  exam: number;
  finalGrade: string;
};

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  grade: string;
  school: string;
  feeStatus: 'due' | 'paid';
  feeDue: number;
  attendance: number;
  attendancePresent: number;
  attendanceTotal: number;
  studentId: string;
  district: string;
  principal: string;
  homeroom: string;
  subjects: ChildSubjectGrade[];
  feeOwed: number;
  feeLabel: string;
};

export type ParentDashboardAlert = {
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
};

export type ParentDashboard = {
  stats: {
    totalChildren: number;
    outstandingFees: number;
    assignmentsDue: number;
    unreadMessages: number;
  };
  children: Child[];
  recentActivity: unknown[];
  alerts: ParentDashboardAlert[];
};
