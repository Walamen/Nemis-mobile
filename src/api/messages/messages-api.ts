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
      // Also tagged `{ id: 'LIST' }` so `getConversationMessages` below can
      // invalidate just this list without invalidating itself (see there).
      providesTags: ['Messages', { type: 'Messages', id: 'LIST' }],
    }),
    getConversationMessages: build.query<ConversationMessage[], string>({
      query: (conversationId) => ({
        url: `/direct-messages/conversations/${conversationId}/messages`,
      }),
      transformResponse: (response: ApiEnvelope<PaginatedMessages>) => response.data.data,
      providesTags: ['Messages'],
      // The server marks every incoming message in this conversation as
      // read as a side effect of this same GET (see `DirectMessagesService.
      // getMessages`) — refresh the conversations list so its per-row
      // `unreadCount` (and anything derived from it, e.g. the dashboard's
      // unread badge) reflects that without a manual refresh. Targets only
      // the `LIST` id, not the plain `Messages` tag this query itself
      // provides above — invalidating that would refetch this same query
      // and re-trigger this handler forever.
      async onQueryStarted(_conversationId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(apiSlice.util.invalidateTags([{ type: 'Messages', id: 'LIST' }]));
        } catch {
          // Fetch failed — nothing read, nothing to reconcile.
        }
      },
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
