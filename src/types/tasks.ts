export type AssignmentSubmission = {
  id: string;
  submittedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING';
  response?: string;
  fileUrl?: string;
  fileName?: string;
  grade?: number;
  feedback?: string;
};

export type Assignment = {
  id: string;
  title: string;
  classId: string;
  className: string;
  subjectId?: string;
  subjectName?: string;
  teacherName: string;
  type: string;
  dueDate: string;
  totalMarks?: number;
  instructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
  mySubmission: AssignmentSubmission | null;
};

export type SubmitAssignmentRequest = {
  assignmentId: string;
  response?: string;
  file?: { uri: string; name: string; type: string };
};

export type ClassResource = {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  staffId: string;
  title: string;
  description: string | null;
  type: 'FILE' | 'LINK';
  fileUrl: string | null;
  linkUrl: string | null;
  fileSize: number | null;
  fileType: string | null;
  category: 'NOTES' | 'PAST_PAPER' | 'WORKSHEET' | 'REFERENCE' | 'OTHER';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  class: { name: string };
  subject: { name: string };
  staff: { firstName: string; lastName: string };
};
