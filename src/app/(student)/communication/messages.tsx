import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetConversationsQuery } from '@/api/messages/messages-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export default function MessagesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetConversationsQuery();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyMessage="No conversations yet."
        onRetry={refetch}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((conversation) => (
            <Pressable
              key={conversation.id}
              className="mb-2 gap-1 rounded-card p-4"
              style={{ backgroundColor: theme.backgroundElement }}
            >
              <ThemedText type="smallBold">{conversation.teacherName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {conversation.lastMessage || 'No messages yet'}
              </ThemedText>
              {conversation.unreadCount > 0 && (
                <ThemedText type="small">{conversation.unreadCount} unread</ThemedText>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
