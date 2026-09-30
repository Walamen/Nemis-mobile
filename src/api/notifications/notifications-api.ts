import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  NotificationsPage,
  NotificationsQuery,
  UserNotification,
} from '@/types/notifications';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // Page-number pagination, matching the server's `page`/`limit` params
    // and `meta.totalPages` (20 per page by default).
    getNotifications: build.infiniteQuery<NotificationsPage, NotificationsQuery | void, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
          lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/user-notifications',
        params: { ...(queryArg ?? {}), page: pageParam },
      }),
      transformResponse: (response: ApiEnvelope<NotificationsPage>) => response.data,
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: build.query<number, Pick<NotificationsQuery, 'excludeType'> | void>(
      {
        query: (params) => ({
          url: '/user-notifications/unread-count',
          params: params ?? undefined,
        }),
        transformResponse: (response: ApiEnvelope<{ count: number }>) => response.data.count,
        providesTags: ['Notifications'],
      },
    ),
    markNotificationRead: build.mutation<UserNotification, string>({
      query: (id) => ({ url: `/user-notifications/${id}/read`, method: 'PATCH' }),
      transformResponse: (response: ApiEnvelope<UserNotification>) => response.data,
      // Flip the row to read immediately; the tag invalidation below then
      // reconciles the list and unread counts with the server.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            for (const page of draft.pages) {
              const notification = page.data.find((item) => item.id === id);
              if (notification) notification.isRead = true;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: '/user-notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
