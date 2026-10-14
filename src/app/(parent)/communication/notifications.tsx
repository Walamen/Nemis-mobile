import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';

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
import { getNotificationHref } from '@/utils/notification-route';

/**
 * Parent notifications, in the Student Notifications style: the shared
 * `NotificationCard` (unread accent bar + dot + bold title), a virtualized
 * list, and tapping opens the related screen when the notification links to
 * one (see `getNotificationHref`). The parent endpoint has no "mark all
 * read" or pagination, so neither is offered.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetParentNotificationsQuery();
  const [markRead] = useMarkParentNotificationReadMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

  async function handlePress(notification: ParentNotification) {
    setActionError(null);
    const href = getNotificationHref(notification.link, 'parent');
    if (href) router.push(href);
    if (notification.isRead) return;
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
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListHeaderComponent={
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
          }
          renderItem={({ item }) => (
            <NotificationCard
              title={item.title}
              message={`${item.description}${item.studentName ? ` · ${item.studentName}` : ''}`}
              createdAt={item.createdAt}
              isRead={item.isRead}
              opensDetail={getNotificationHref(item.link, 'parent') != null}
              onPress={() => void handlePress(item)}
              className="mb-2"
            />
          )}
        />
      </QueryState>
    </AppScreen>
  );
}
