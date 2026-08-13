import { RefreshControl, ScrollView } from 'react-native';

import { useGetConversationsQuery } from '@/api/messages/messages-api';
import { MessageCard } from '@/components/cards/message-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';

export default function MessagesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetConversationsQuery();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Messages" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={5} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
            title="No conversations yet"
            description="Messages from your teachers will show up here."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((conversation) => (
            <MessageCard
              key={conversation.id}
              senderName={conversation.teacherName}
              lastMessage={conversation.lastMessage}
              lastMessageAt={conversation.lastMessageTime}
              unreadCount={conversation.unreadCount}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
