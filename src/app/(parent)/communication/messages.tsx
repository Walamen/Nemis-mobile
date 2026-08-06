import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetParentConversationsQuery } from '@/api/parent/messages-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Link } from '@/tw';

export default function MessagesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetParentConversationsQuery();
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
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/communication/conversation/${conversation.id}` as Href}
              className="mb-2 gap-1 rounded-card p-4"
              style={{ backgroundColor: theme.backgroundElement }}
            >
              <ThemedText type="smallBold">{conversation.teacherName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Re: {conversation.studentName}
                {conversation.subject ? ` · ${conversation.subject}` : ''}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {conversation.lastMessage || 'No messages yet'}
              </ThemedText>
              {conversation.unreadCount > 0 && (
                <ThemedText type="small">{conversation.unreadCount} unread</ThemedText>
              )}
            </Link>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
