import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetParentConversationsQuery } from '@/api/parent/messages-api';
import { MessageCard } from '@/components/cards/message-card';
import { QueryState } from '@/components/common/query-state';

export default function MessagesScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = useGetParentConversationsQuery();

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
            <MessageCard
              key={conversation.id}
              senderName={conversation.teacherName}
              subtitle={`Re: ${conversation.studentName}${conversation.subject ? ` · ${conversation.subject}` : ''}`}
              lastMessage={conversation.lastMessage}
              lastMessageAt={conversation.lastMessageAt}
              unreadCount={conversation.unreadCount}
              onPress={() =>
                router.push({
                  pathname: '/communication/conversation/[id]',
                  params: { id: conversation.id, teacherName: conversation.teacherName },
                })
              }
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
