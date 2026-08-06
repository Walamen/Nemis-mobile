import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ParentConversation, ParentConversationMessage } from '@/types/messages';

export const parentMessagesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getParentConversations: build.query<ParentConversation[], void>({
      query: () => ({ url: '/parent/conversations' }),
      transformResponse: (response: ApiEnvelope<ParentConversation[]>) => response.data,
      providesTags: ['Messages'],
    }),
    getParentConversationMessages: build.query<ParentConversationMessage[], string>({
      query: (conversationId) => ({ url: `/parent/conversations/${conversationId}/messages` }),
      transformResponse: (response: ApiEnvelope<ParentConversationMessage[]>) => response.data,
      providesTags: ['Messages'],
    }),
    sendParentConversationMessage: build.mutation<
      ParentConversationMessage,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `/parent/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (response: ApiEnvelope<ParentConversationMessage>) => response.data,
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetParentConversationsQuery,
  useGetParentConversationMessagesQuery,
  useSendParentConversationMessageMutation,
} = parentMessagesApi;
