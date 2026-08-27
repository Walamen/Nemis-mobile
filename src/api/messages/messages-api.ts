import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Announcement, Conversation, ConversationMessage } from '@/types/messages';

type PaginatedMessages = {
  data: ConversationMessage[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAnnouncements: build.query<Announcement[], void>({
      query: () => ({ url: '/messages/student/me/announcements' }),
      transformResponse: (response: ApiEnvelope<Announcement[]>) => response.data,
    }),
    // Conversations/messages hit `/direct-messages/*` — the generic
    // cross-role messaging system the web portals (student and teacher
    // alike) actually use. The old `/messages/student/me/conversations`
    // read from a separate, disconnected `Conversation`/`Message` table
    // that nothing ever writes to anymore, so a teacher's real message
    // (stored via `/direct-messages`) never showed up here.
    getConversations: build.query<Conversation[], void>({
      query: () => ({ url: '/direct-messages/conversations' }),
      transformResponse: (response: ApiEnvelope<Conversation[]>) => response.data,
      providesTags: ['Messages'],
    }),
    getConversationMessages: build.query<ConversationMessage[], string>({
      query: (conversationId) => ({
        url: `/direct-messages/conversations/${conversationId}/messages`,
      }),
      transformResponse: (response: ApiEnvelope<PaginatedMessages>) => response.data.data,
      providesTags: ['Messages'],
    }),
    sendConversationMessage: build.mutation<
      ConversationMessage,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `/direct-messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (response: ApiEnvelope<ConversationMessage>) => response.data,
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} = messagesApi;
