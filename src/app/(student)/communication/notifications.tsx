import { RefreshControl, ScrollView } from 'react-native';

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/notifications/notifications-api';
import { Button } from '@/components/buttons/button';
import { NotificationCard } from '@/components/cards/notification-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';

export default function NotificationsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Notifications" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.data?.length}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={5} lines={3} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
            title="No notifications yet"
            description="We'll let you know when something needs your attention."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <Button
            label="Mark all as read"
            onPress={() => markAllRead()}
            isLoading={isMarkingAll}
            className="mb-3"
          />
          {data?.data?.map((notification) => (
            <NotificationCard
              key={notification.id}
              title={notification.title}
              message={notification.message}
              createdAt={notification.createdAt}
              isRead={notification.isRead}
              onPress={() => !notification.isRead && markRead(notification.id)}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
