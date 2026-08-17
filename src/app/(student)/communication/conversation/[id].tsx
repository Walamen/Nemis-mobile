import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} from '@/api/messages/messages-api';
import { Button } from '@/components/buttons/button';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/tw';

/**
 * Teacher conversation thread — the `useGetConversationMessagesQuery`/
 * `useSendConversationMessageMutation` hooks already existed in
 * `messages-api.ts` but weren't wired to any screen yet (`messages.tsx`
 * had no navigation at all); this fills that gap rather than inventing new
 * API surface. Mirrors `(parent)/communication/conversation/[id].tsx`'s
 * shape. `teacherName`/`subject` arrive as route params from the
 * conversation list (already-fetched data, not a second request) and set
 * the header title — falls back to "Conversation" if opened without them.
 */
export default function ConversationScreen() {
  const { id, teacherName, subject } = useLocalSearchParams<{
    id: string;
    teacherName?: string;
    subject?: string;
  }>();
  const theme = useTheme();
  const [content, setContent] = useState('');
  const { data: messages, isLoading, isError, refetch } = useGetConversationMessagesQuery(id);
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation();

  async function handleSend() {
    if (!content.trim()) return;
    await sendMessage({ conversationId: id, content: content.trim() }).unwrap();
    setContent('');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <AppHeader title={teacherName ?? 'Conversation'} />
      {subject && (
        <ThemedText type="small" themeColor="textSecondary" className="px-4 -mt-2 mb-1">
          {subject}
        </ThemedText>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={messages?.length === 0}
          emptyMessage="No messages yet. Say hello!"
          onRetry={refetch}
        >
          <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
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
                  {new Date(message.timestamp).toLocaleTimeString([], {
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
