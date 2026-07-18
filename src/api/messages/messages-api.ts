import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { Announcement, Conversation, ConversationMessage } from '@/types/messages';

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAnnouncements: build.query<Announcement[], void>({
      query: () => ({ url: '/messages/student/me/announcements' }),
      transformResponse: (response: ApiEnvelope<Announcement[]>) => response.data,
    }),
    getConversations: build.query<Conversation[], void>({
      query: () => ({ url: '/messages/student/me/conversations' }),
      transformResponse: (response: ApiEnvelope<Conversation[]>) => response.data,
      providesTags: ['Messages'],
    }),
    getConversationMessages: build.query<ConversationMessage[], string>({
      query: (conversationId) => ({
        url: `/messages/student/me/conversations/${conversationId}/messages`,
      }),
      transformResponse: (response: ApiEnvelope<ConversationMessage[]>) => response.data,
      providesTags: ['Messages'],
    }),
    sendConversationMessage: build.mutation<
      ConversationMessage,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `/messages/student/me/conversations/${conversationId}/messages`,
        method: 'POST',
        data: { content },
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
