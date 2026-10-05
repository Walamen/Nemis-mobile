import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetParentConversationsQuery } from '@/api/parent/messages-api';
import { MessageCard } from '@/components/cards/message-card';
import { EmptyState } from '@/components/common/empty-state';
import { Icon } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { TextInput, View } from '@/tw';

/**
 * Parent Inbox — the "Inbox" tab is the conversation list itself (search +
 * count + rows), matching the Student Inbox. It used to be a two-row menu
 * (Messages / Notifications); Notifications now lives in the Menu sheet and
 * the dashboard bell, like the Student app. `/communication/messages` stays
 * a working route (it renders this same screen).
 */
export function ParentInbox({ showBack }: { showBack?: boolean }) {
  const router = useRouter();
  const theme = useTheme();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetParentConversationsQuery();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data?.filter((conversation) =>
      [conversation.teacherName, conversation.studentName, conversation.subject]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q)),
    );
  }, [data, query]);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Inbox" showBack={showBack} />
      <QueryState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={5} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
            title="No conversations yet"
            description="Messages with your children's teachers will show up here."
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <View
            className="mb-3.5 flex-row items-center gap-2 rounded-input px-3.5 py-3"
            style={{ backgroundColor: theme.backgroundElement }}
          >
            <Icon
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size="sm"
              color={theme.textSecondary}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search teachers or children…"
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Search conversations"
              className="flex-1"
              style={{ color: theme.text, fontSize: 15 }}
            />
          </View>

          <View className="mb-2.5 flex-row items-center justify-between">
            <ThemedText type="smallBold">Teachers</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {filtered?.length ?? 0} of {data?.length ?? 0}
            </ThemedText>
          </View>

          {filtered?.map((conversation) => (
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
              backgroundColor={theme.card}
              avatarBackgroundColor={theme.backgroundSelected}
              unreadAccentColor={Palette.accent}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

/** Inbox tab root — no back button. */
export default function InboxScreen() {
  return <ParentInbox showBack={false} />;
}
