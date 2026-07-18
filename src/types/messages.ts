export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

export type Conversation = {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoUrl: string | null;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  senderName: 'You' | 'Teacher';
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  isOwn: boolean;
};
