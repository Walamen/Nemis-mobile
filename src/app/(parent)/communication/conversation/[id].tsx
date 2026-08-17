import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetParentConversationMessagesQuery,
  useSendParentConversationMessageMutation,
} from '@/api/parent/messages-api';
import { Button } from '@/components/buttons/button';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/tw';

/**
 * `teacherName` arrives as a route param from the conversation list
 * (already-fetched data, not a second request) and sets the header title
 * dynamically — falls back to the layout's static "Conversation" title
 * (`communication/_layout.tsx`) if opened without it.
 */
export default function ConversationScreen() {
  const { id, teacherName } = useLocalSearchParams<{ id: string; teacherName?: string }>();
  const theme = useTheme();
  const [content, setContent] = useState('');
  const { data: messages, isLoading, isError, refetch } = useGetParentConversationMessagesQuery(id);
  const [sendMessage, { isLoading: isSending }] = useSendParentConversationMessageMutation();

  async function handleSend() {
    if (!content.trim()) return;
    await sendMessage({ conversationId: id, content: content.trim() }).unwrap();
    setContent('');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      {teacherName && <Stack.Screen options={{ title: teacherName }} />}
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
            {messages?.map((message) => {
              const isOwn = message.senderRole === 'PARENT';
              return (
                <ThemedView
                  key={message.id}
                  className="mb-2 max-w-[80%] gap-1 rounded-card p-3"
                  style={{
                    backgroundColor: isOwn ? theme.backgroundSelected : theme.backgroundElement,
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
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
              );
            })}
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
