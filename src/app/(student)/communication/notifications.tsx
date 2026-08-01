import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/notifications/notifications-api';
import { Button } from '@/components/buttons/button';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export default function NotificationsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.data?.length}
        emptyMessage="No notifications yet."
        onRetry={refetch}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <Button
            label="Mark all as read"
            onPress={() => markAllRead()}
            isLoading={isMarkingAll}
            className="mb-3"
          />
          {data?.data?.map((notification) => (
            <Pressable
              key={notification.id}
              className="mb-2 gap-1 rounded-card p-4"
              style={{
                backgroundColor: notification.isRead
                  ? theme.backgroundElement
                  : theme.backgroundSelected,
              }}
              onPress={() => !notification.isRead && markRead(notification.id)}
            >
              <ThemedText type="smallBold">{notification.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {notification.message}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
