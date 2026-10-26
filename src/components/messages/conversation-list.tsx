import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetConversationsQuery } from '@/api/messages/messages-api';
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
import { messagingRoleLabel } from '@/utils/messaging-role';

export type ConversationListProps = {
  showBack?: boolean;
  /** Label above the rows, e.g. "Teachers" (students) or "School staff". */
  listLabel: string;
  searchPlaceholder: string;
  emptyDescription: string;
  /** Shows the header's compose button (parents start conversations). */
  onCompose?: () => void;
};

/**
 * Inbox — the direct-message conversation list (search + count + rows)
 * shared by the Student and Parent apps. Both read
 * `/direct-messages/conversations`, the conversations school staff actually
 * write to; the search filter is client-side over the conversations already
 * fetched. Opening a conversation marks it read on the server.
 */
export function ConversationList({
  showBack = false,
  listLabel,
  searchPlaceholder,
  emptyDescription,
  onCompose,
}: ConversationListProps) {
  const router = useRouter();
  const theme = useTheme();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetConversationsQuery();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data?.filter((conversation) => {
      const name = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;
      return name.toLowerCase().includes(q);
    });
  }, [data, query]);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader
        title="Inbox"
        showBack={showBack}
        actions={
          onCompose
            ? [
                {
                  icon: { ios: 'square.and.pencil', android: 'edit_square', web: 'edit_square' },
                  onPress: onCompose,
                  accessibilityLabel: 'New message',
                },
              ]
            : undefined
        }
      />
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
            description={emptyDescription}
            actionLabel={onCompose ? 'New message' : undefined}
            onAction={onCompose}
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
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
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Search conversations"
              className="flex-1"
              style={{ color: theme.text, fontSize: 15 }}
            />
          </View>

          <View className="mb-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Icon
                name={{
                  ios: 'bubble.left',
                  android: 'chat_bubble_outline',
                  web: 'chat_bubble_outline',
                }}
                size="sm"
                color={theme.textSecondary}
              />
              <ThemedText type="smallBold">{listLabel}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {filtered?.length ?? 0} of {data?.length ?? 0}
            </ThemedText>
          </View>

          {filtered?.map((conversation) => {
            const name = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;
            const roleLabel = messagingRoleLabel(conversation.counterpart.role);
            return (
              <MessageCard
                key={conversation.id}
                senderName={name}
                subtitle={roleLabel}
                lastMessage={conversation.lastMessage ?? ''}
                lastMessageAt={conversation.lastMessageAt ?? conversation.createdAt}
                unreadCount={conversation.unreadCount}
                onPress={() =>
                  router.push({
                    pathname: '/communication/conversation/[id]',
                    params: { id: conversation.id, teacherName: name, role: roleLabel },
                  })
                }
                backgroundColor={theme.card}
                avatarBackgroundColor={theme.backgroundSelected}
                unreadAccentColor={Palette.accent}
                className="mb-2"
              />
            );
          })}

          <ThemedText type="small" themeColor="textSecondary" className="mt-2 text-center">
            Messages are between you and school staff. Ministry announcements appear under
            Notifications.
          </ThemedText>
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
