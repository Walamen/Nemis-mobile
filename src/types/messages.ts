export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

/** Shape of `/direct-messages/conversations` — the generic cross-role
 * messaging system every role (including the web portals) actually uses.
 * See `src/api/messages/messages-api.ts` for why this replaced the old
 * student-only `/messages/student/me/conversations`. */
export type Conversation = {
  id: string;
  initiatorId: string;
  recipientId: string;
  lastMessageAt: string | null;
  createdAt: string;
  counterpart: {
    userId: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    role: string;
    institutionName?: string;
  };
  lastMessage?: string;
  unreadCount: number;
};

/** Shape of a message returned by `/direct-messages/conversations/:id/messages`. */
export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  isOwn: boolean;
  senderName: string;
};

export type ParentConversation = {
  id: string;
  studentName: string;
  teacherName: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ParentConversationMessage = {
  id: string;
  content: string;
  senderRole: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
};
