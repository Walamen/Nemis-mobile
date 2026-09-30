import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
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
import { Palette } from '@/theme';
import { Text, TextInput, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

const OWN_BUBBLE_TEXT = '#FFFFFF';

/**
 * Teacher conversation thread. `teacherName`/`role` arrive as route params
 * from the conversation list (already-fetched data, not a second request)
 * and set the header title — falls back to "Conversation"/"Teacher" if
 * opened without them (e.g. from a notification).
 *
 * The avatar + role identity row below the header, and the "Start your
 * conversation with {name}" empty state, match the web Student Portal's
 * Messages page.
 */
export default function ConversationScreen() {
  const { id, teacherName, role } = useLocalSearchParams<{
    id: string;
    teacherName?: string;
    role?: string;
  }>();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [content, setContent] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const {
    data: messages,
    error,
    isLoading,
    isError,
    refetch,
  } = useGetConversationMessagesQuery(id);
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation();
  const firstName = teacherName?.split(' ')[0];

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSendError(null);
    try {
      await sendMessage({ conversationId: id, content: trimmed }).unwrap();
      setContent('');
    } catch (sendFailure) {
      // The typed message stays in the input so the student can retry.
      setSendError(`Message not sent. ${getApiErrorMessage(sendFailure)}`);
    }
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
          error={error}
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
            ref={scrollRef}
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
            contentContainerStyle={{ paddingBottom: 32 }}
            // Keeps the newest message in view on open, on send, and when a
            // new message arrives.
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages?.map((message) => {
              const time = new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <ThemedView
                  key={message.id}
                  className="mb-2 max-w-[80%] gap-1 rounded-card p-3"
                  style={{
                    backgroundColor: message.isOwn ? Palette.secondary : theme.card,
                    alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
                  }}
                  accessible
                  accessibilityLabel={`${message.isOwn ? 'You' : (teacherName ?? 'Teacher')}, ${time}: ${message.content}`}
                >
                  <ThemedText
                    type="small"
                    style={message.isOwn ? { color: OWN_BUBBLE_TEXT } : undefined}
                  >
                    {message.content}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={message.isOwn ? { color: Palette.secondary100 } : undefined}
                  >
                    {time}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </ScrollView>
        </QueryState>

        <ThemedView className="gap-1 px-4 pb-4 pt-2">
          {sendError && (
            <Text className="text-sm text-error" accessibilityLiveRegion="polite">
              {sendError}
            </Text>
          )}
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-input px-4 py-3 text-base"
              style={{ backgroundColor: theme.backgroundElement, color: theme.text }}
              placeholder="Type a message"
              placeholderTextColor={theme.textSecondary}
              value={content}
              onChangeText={setContent}
              editable={!isSending}
              multiline
              accessibilityLabel="Message"
            />
            <Button
              label="Send"
              onPress={handleSend}
              isLoading={isSending}
              disabled={!content.trim()}
              className="px-6 py-3"
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
