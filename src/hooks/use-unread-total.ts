import { useGetConversationsQuery } from '@/api/messages/messages-api';
import { useGetUnreadNotificationCountQuery } from '@/api/notifications/notifications-api';

/**
 * Unread notifications + unread direct messages, for Home's bell badge and
 * "Unread" stat. `NEW_MESSAGE` notifications are excluded because each
 * direct message already counts via its conversation's own `unreadCount`
 * (a message keeps two independent read flags — see `notifications-api.ts`).
 * Both queries stay live via `useRealtimeSync` and mark-read invalidation.
 *
 * `total` stays `undefined` (never a misleading `0`) until both have loaded.
 */
export function useUnreadTotal() {
  const notificationCount = useGetUnreadNotificationCountQuery({ excludeType: 'NEW_MESSAGE' });
  const conversations = useGetConversationsQuery();

  const unreadMessages = conversations.data?.reduce((sum, c) => sum + c.unreadCount, 0);
  const total =
    notificationCount.data != null && unreadMessages != null
      ? notificationCount.data + unreadMessages
      : undefined;

  function refetch() {
    notificationCount.refetch();
    conversations.refetch();
  }

  return { total, refetch };
}
