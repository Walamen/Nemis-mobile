import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';

import {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/notifications/notifications-api';
import { Button } from '@/components/buttons/button';
import { NotificationCard } from '@/components/cards/notification-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { InlineLoader } from '@/components/loading/inline-loader';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import type { UserNotification } from '@/types/notifications';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';
import { getNotificationHref } from '@/utils/notification-route';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetNotificationsInfiniteQuery();
  // Server-side total — the list below only holds the pages loaded so far.
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  // Stops `onEndReached` from retrying a failing page in a loop; the footer's
  // "Try again" clears it.
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);

  const notifications = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  async function handlePress(notification: UserNotification) {
    setActionError(null);
    const href = getNotificationHref(notification.link);
    if (href) router.push(href);
    if (notification.isRead) return;
    try {
      await markRead(notification.id).unwrap();
    } catch (markError) {
      setActionError(`Couldn't mark that notification as read. ${getApiErrorMessage(markError)}`);
    }
  }

  async function handleMarkAllRead() {
    setActionError(null);
    try {
      await markAllRead().unwrap();
    } catch (markError) {
      setActionError(`Couldn't mark notifications as read. ${getApiErrorMessage(markError)}`);
    }
  }

  async function loadMore() {
    if (!hasNextPage || isFetchingNextPage) return;
    setLoadMoreFailed(false);
    const result = await fetchNextPage();
    setLoadMoreFailed(result.isError);
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Notifications" />
      <QueryState
        isLoading={isLoading}
        isError={isError && notifications.length === 0}
        error={error}
        isEmpty={notifications.length === 0}
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
          data={notifications}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading && !isFetchingNextPage}
              onRefresh={refetch}
            />
          }
          onEndReached={() => {
            if (!loadMoreFailed) void loadMore();
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View className="mb-3 gap-2">
              <View className="flex-row items-center justify-between">
                <ThemedText type="small" themeColor="textSecondary">
                  {unreadCount} unread
                </ThemedText>
                {unreadCount > 0 && (
                  <Button
                    variant="text"
                    label="Mark all as read"
                    onPress={handleMarkAllRead}
                    isLoading={isMarkingAll}
                  />
                )}
              </View>
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
              message={item.message}
              createdAt={item.createdAt}
              isRead={item.isRead}
              opensDetail={getNotificationHref(item.link) != null}
              onPress={() => handlePress(item)}
              className="mb-2"
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <InlineLoader />
            ) : loadMoreFailed ? (
              <View className="items-center gap-1 py-2">
                <ThemedText type="small" themeColor="textSecondary">
                  Couldn&apos;t load more notifications.
                </ThemedText>
                <Button variant="text" label="Try again" onPress={() => void loadMore()} />
              </View>
            ) : !hasNextPage ? (
              <ThemedText type="small" themeColor="textSecondary" className="py-2 text-center">
                You&apos;re all caught up.
              </ThemedText>
            ) : null
          }
        />
      </QueryState>
    </AppScreen>
  );
}
