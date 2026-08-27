import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} from '@/api/messages/messages-api';
import { Button } from '@/components/buttons/button';
import { initialsOf } from '@/components/cards/message-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { ThemedView } from '@/components/common/themed-view';
import { AppHeader } from '@/components/layout/app-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { TextInput, View } from '@/tw';

/**
 * Teacher conversation thread — the `useGetConversationMessagesQuery`/
 * `useSendConversationMessageMutation` hooks already existed in
 * `messages-api.ts` but weren't wired to any screen yet (`messages.tsx`
 * had no navigation at all); this fills that gap rather than inventing new
 * API surface. Mirrors `(parent)/communication/conversation/[id].tsx`'s
 * shape. `teacherName`/`role` arrive as route params from the conversation
 * list (already-fetched data, not a second request) and set the header
 * title — falls back to "Conversation"/"Teacher" if opened without them.
 *
 * The avatar + role identity row below the header, and the "Start your
 * conversation with {name}" empty state, match the web Student Portal's
 * Messages page (same avatar treatment as the Inbox list's `MessageCard`
 * rows) so opening a teacher feels like the same product on both surfaces.
 */
export default function ConversationScreen() {
  const { id, teacherName, role } = useLocalSearchParams<{
    id: string;
    teacherName?: string;
    role?: string;
  }>();
  const theme = useTheme();
  const [content, setContent] = useState('');
  const { data: messages, isLoading, isError, refetch } = useGetConversationMessagesQuery(id);
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation();
  const firstName = teacherName?.split(' ')[0];

  async function handleSend() {
    if (!content.trim()) return;
    await sendMessage({ conversationId: id, content: content.trim() }).unwrap();
    setContent('');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <AppHeader title={teacherName ?? 'Conversation'} />
      <View className="-mt-2 mb-1 flex-row items-center gap-2 px-4">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.backgroundSelected }}
        >
          <ThemedText type="small" style={{ fontWeight: '700' }}>
            {initialsOf(teacherName ?? '?')}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {role ?? 'Teacher'}
        </ThemedText>
      </View>
      {/* 'padding' on both platforms — see `AuthScreenShell` for why
          Android can't rely on `behavior: undefined` under edge-to-edge. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={messages?.length === 0}
          onRetry={refetch}
          emptyFallback={
            <EmptyState
              icon={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
              title={firstName ? `Start your conversation with ${firstName}` : 'Say hello!'}
              description="Messages here go straight to your teacher."
            />
          }
        >
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {messages?.map((message) => (
              <ThemedView
                key={message.id}
                className="mb-2 max-w-[80%] gap-1 rounded-card p-3"
                style={{
                  backgroundColor: message.isOwn
                    ? theme.backgroundSelected
                    : theme.backgroundElement,
                  alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                <ThemedText type="small">{message.content}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </QueryState>

        <ThemedView className="flex-row items-center gap-2 px-4 pb-4 pt-2">
          <TextInput
            className="flex-1 rounded-input px-4 py-3 text-base"
            style={{ backgroundColor: theme.backgroundElement, color: theme.text }}
            placeholder="Type a message"
            placeholderTextColor={theme.textSecondary}
            value={content}
            onChangeText={setContent}
            editable={!isSending}
            multiline
          />
          <Button label="Send" onPress={handleSend} isLoading={isSending} className="px-6 py-3" />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
