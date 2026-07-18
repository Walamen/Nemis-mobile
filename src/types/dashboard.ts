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
