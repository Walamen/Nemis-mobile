import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { ParentNotification } from '@/types/notifications';

export const parentNotificationsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getParentNotifications: build.query<ParentNotification[], void>({
      query: () => ({ url: '/parent/notifications' }),
      transformResponse: (response: ApiEnvelope<ParentNotification[]>) => response.data,
      providesTags: ['Notifications'],
    }),
    markParentNotificationRead: build.mutation<void, string>({
      query: (id) => ({ url: `/parent/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetParentNotificationsQuery, useMarkParentNotificationReadMutation } =
  parentNotificationsApi;
