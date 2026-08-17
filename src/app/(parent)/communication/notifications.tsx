import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetParentNotificationsQuery,
  useMarkParentNotificationReadMutation,
} from '@/api/parent/notifications-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export default function NotificationsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetParentNotificationsQuery();
  const [markRead] = useMarkParentNotificationReadMutation();
  const theme = useTheme();
  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyMessage="No notifications yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data && data.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary" className="mb-3">
              {unreadCount} unread
            </ThemedText>
          )}
          {data?.map((notification) => (
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
                {notification.description}
                {notification.studentName ? ` · ${notification.studentName}` : ''}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
