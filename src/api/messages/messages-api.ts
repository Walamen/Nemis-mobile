import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  Announcement,
  Conversation,
  ConversationMessage,
  MessageRecipient,
} from '@/types/messages';
import { MESSAGES_PAGE_SIZE, planMessagePages } from '@/utils/message-pages';

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
    // The server pages a thread oldest-first (at most 50 per page), so page 1
    // alone hid every message after the first page — including new ones.
    // Fetch page 1 to learn the page count, then the newest pages (see
    // `planMessagePages`), and return them as one oldest-first list.
    getConversationMessages: build.query<ConversationMessage[], string>({
      async queryFn(conversationId, _api, _extraOptions, baseQuery) {
        const url = `/direct-messages/conversations/${conversationId}/messages`;
        type PageResult =
          { ok: true; page: PaginatedMessages } | { ok: false; error: FetchBaseQueryError };
        const fetchPage = async (page: number): Promise<PageResult> => {
          const result = await baseQuery({ url, params: { page, limit: MESSAGES_PAGE_SIZE } });
          return result.error
            ? { ok: false, error: result.error }
            : { ok: true, page: (result.data as ApiEnvelope<PaginatedMessages>).data };
        };

        const first = await fetchPage(1);
        if (!first.ok) return { error: first.error };

        const { keepFirstPage, extraPages } = planMessagePages(first.page.meta.totalPages);
        const rest = await Promise.all(extraPages.map(fetchPage));
        const pages: PaginatedMessages[] = keepFirstPage ? [first.page] : [];
        for (const result of rest) {
          if (!result.ok) return { error: result.error };
          pages.push(result.page);
        }

        // A message sent between page requests can't move earlier pages
        // (new messages only append), but dedupe by id to be safe.
        const seen = new Set<string>();
        const messages = pages
          .flatMap((page) => page.data)
          .filter((message) => !seen.has(message.id) && seen.add(message.id));
        return { data: messages };
      },
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
    // People the user may start a conversation with — the server applies
    // the messaging rules (parents: teachers and school administrators at
    // their children's schools). `q` filters by name or email server-side.
    getMessageRecipients: build.query<MessageRecipient[], string | void>({
      query: (q) => ({ url: '/direct-messages/recipients', params: q ? { q } : undefined }),
      transformResponse: (response: ApiEnvelope<MessageRecipient[]>) => response.data,
    }),
    // Opens (or reuses) the conversation with `targetUserId` and sends the
    // first message in one call.
    startConversation: build.mutation<
      { conversation: { id: string } },
      { targetUserId: string; initialMessage: string }
    >({
      query: (body) => ({ url: '/direct-messages/conversations', method: 'POST', body }),
      transformResponse: (response: ApiEnvelope<{ conversation: { id: string } }>) => response.data,
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
  useGetMessageRecipientsQuery,
  useStartConversationMutation,
} = messagesApi;
