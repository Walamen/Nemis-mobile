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
import { CardBackgroundColor, Palette } from '@/theme';
import { TextInput, View } from '@/tw';

/**
 * Inbox — the Student tab bar's "Inbox" tab: a direct teacher/conversation
 * list (search + count + rows), not a hub. Notifications moved to the
 * Menu sheet (see `(student)/_layout.tsx`), so this folds in what used to
 * be the separate `messages.tsx` screen — that file is gone, this is now
 * the only "conversation list" screen. The search filter is real
 * (client-side, over already-fetched conversations) rather than
 * decorative, unlike Home's "Search anything…" row — there's no backend
 * search endpoint for that one, but filtering teachers already in hand
 * needs none. Rows keep this app's established pill-card row style
 * (matching Fees/Tasks/Academics) rather than the NEMIS Design
 * reference's flatter divider-list treatment, for consistency with every
 * other list in the Student app.
 *
 * The "Teachers" count row deliberately doesn't append a class/grade
 * (the reference's mockup showed "Teachers · Grade 5B" — that's the
 * design canvas's fictional sample data, not something this endpoint
 * returns) — confirmed against the existing web Student Portal's actual
 * Messages page, which shows plain "Teachers". Each row's "Teacher"
 * subtitle mirrors that same reference page (every contact here is a
 * teacher; this endpoint doesn't message any other staff role).
 */
export default function InboxScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, isFetching, isError, refetch } = useGetConversationsQuery();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data?.filter((conversation) => conversation.teacherName.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Inbox" showBack={false} />
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
              placeholder="Search teachers…"
              placeholderTextColor={theme.textSecondary}
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
              <ThemedText type="smallBold">Teachers</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {filtered?.length ?? 0} of {data?.length ?? 0}
            </ThemedText>
          </View>

          {filtered?.map((conversation) => (
            <MessageCard
              key={conversation.id}
              senderName={conversation.teacherName}
              subtitle="Teacher"
              lastMessage={conversation.lastMessage}
              lastMessageAt={conversation.lastMessageTime}
              unreadCount={conversation.unreadCount}
              onPress={() =>
                router.push({
                  pathname: '/communication/conversation/[id]',
                  params: {
                    id: conversation.id,
                    teacherName: conversation.teacherName,
                    subject: conversation.subject,
                  },
                })
              }
              backgroundColor={CardBackgroundColor}
              avatarBackgroundColor={theme.backgroundSelected}
              unreadAccentColor={Palette.accent}
              className="mb-2"
            />
          ))}

          <ThemedText type="small" themeColor="textSecondary" className="mt-2 text-center">
            Messages are between you and school staff. Ministry announcements appear under
            Notifications.
          </ThemedText>
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
