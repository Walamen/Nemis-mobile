import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type {
  NotificationsPage,
  NotificationsQuery,
  UserNotification,
} from '@/types/notifications';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsPage, NotificationsQuery | void>({
      query: (params) => ({ url: '/user-notifications', params: params ?? undefined }),
      transformResponse: (response: ApiEnvelope<NotificationsPage>) => response.data,
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: build.query<number, void>({
      query: () => ({ url: '/user-notifications/unread-count' }),
      transformResponse: (response: ApiEnvelope<{ count: number }>) => response.data.count,
      providesTags: ['Notifications'],
    }),
    markNotificationRead: build.mutation<UserNotification, string>({
      query: (id) => ({ url: `/user-notifications/${id}/read`, method: 'PATCH' }),
      transformResponse: (response: ApiEnvelope<UserNotification>) => response.data,
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: '/user-notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
