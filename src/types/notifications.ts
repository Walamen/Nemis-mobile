export type UserNotificationType =
  | 'STUDENT_ABSENT'
  | 'STUDENT_PRESENT'
  | 'STUDENT_LATE'
  | 'REPORT_CARD_PUBLISHED'
  | 'NEW_MESSAGE'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'DEADLINE_REMINDER'
  | 'GENERAL_ALERT'
  | 'EXAM_SCHEDULED'
  | 'ASSIGNMENT_POSTED'
  | 'FEE_PAYMENT_DUE'
  | 'GRADE_POSTED'
  | (string & {});

export type UserNotification = {
  id: string;
  recipientId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: unknown | null;
  link: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsPage = {
  data: UserNotification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type NotificationsQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};
