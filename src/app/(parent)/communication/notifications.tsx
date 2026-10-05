import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  useGetParentNotificationsQuery,
  useMarkParentNotificationReadMutation,
} from '@/api/parent/notifications-api';
import { NotificationCard } from '@/components/cards/notification-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import type { ParentNotification } from '@/types/notifications';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

/**
 * Parent notifications, in the Student Notifications style: the shared
 * `NotificationCard` (unread accent bar + dot + bold title). The parent
 * endpoint has no "mark all read" or pagination, so neither is offered.
 */
export default function NotificationsScreen() {
  const { data, error, isLoading, isFetching, isError, refetch } = useGetParentNotificationsQuery();
  const [markRead] = useMarkParentNotificationReadMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

  async function handlePress(notification: ParentNotification) {
    if (notification.isRead) return;
    setActionError(null);
    try {
      await markRead(notification.id).unwrap();
    } catch (markError) {
      setActionError(`Couldn't mark that notification as read. ${getApiErrorMessage(markError)}`);
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Notifications" />
      <QueryState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={data?.length === 0}
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
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <View className="mb-3 gap-2">
            <ThemedText type="small" themeColor="textSecondary">
              {unreadCount} unread
            </ThemedText>
            {actionError && (
              <Text className="text-sm text-error" accessibilityLiveRegion="polite">
                {actionError}
              </Text>
            )}
          </View>
          {data?.map((notification) => (
            <NotificationCard
              key={notification.id}
              title={notification.title}
              message={`${notification.description}${notification.studentName ? ` · ${notification.studentName}` : ''}`}
              createdAt={notification.createdAt}
              isRead={notification.isRead}
              onPress={() => void handlePress(notification)}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
